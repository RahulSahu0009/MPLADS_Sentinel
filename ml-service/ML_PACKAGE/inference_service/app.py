"""
app.py
Phase 4.5 FastAPI HTTP Boundary.
Exposes POST /api/v1/risk/analyze to the MERN backend.
Fails closed on startup if MANIFEST.json integrity check fails.
"""
import os
from typing import Any, Dict, List

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from predict import IntegrityError, InferenceConfigurationError, ProductionInference

BUNDLE_DIR = os.environ.get(
    "BUNDLE_DIR",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../production_bundle")),
)

_engine: ProductionInference = None  # type: ignore[assignment]

app = FastAPI(title="MPLADS Risk Inference API", version="1.0.0")


@app.on_event("startup")
def startup():
    global _engine
    # Fail-closed: any integrity or config error crashes the process
    _engine = ProductionInference(BUNDLE_DIR)
    print(f"ProductionInference loaded from: {BUNDLE_DIR}")


# ------------------------------------------------------------------
# Request / Response models
# ------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    project: Dict[str, Any]
    candidate_peers: List[Dict[str, Any]] = []


# ------------------------------------------------------------------
# Exception handlers
# ------------------------------------------------------------------
@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    return JSONResponse(status_code=500, content={"error": "IntegrityError", "detail": str(exc)})


@app.exception_handler(InferenceConfigurationError)
async def config_error_handler(request: Request, exc: InferenceConfigurationError):
    return JSONResponse(status_code=500, content={"error": "InferenceConfigurationError", "detail": str(exc)})


# ------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok", "bundle_dir": BUNDLE_DIR}


@app.post("/api/v1/risk/analyze")
def analyze(payload: AnalyzeRequest):
    try:
        result = _engine.analyze(payload.project, payload.candidate_peers)
        return result
    except (IntegrityError, InferenceConfigurationError):
        raise
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": type(exc).__name__, "detail": str(exc)},
        )
