# MPLADS Risk Analytics: Production ML Package (Phase 4.5)
**Status:** FROZEN | **Target:** PERN Stack Integration

---

### 1. `src/phase4/risk_aggregator.py`
*Location: `C:\Users\smrit\OneDrive\Desktop\SIH MPLADS\src\phase4\risk_aggregator.py`*

```python
"""
risk_aggregator.py
Phase 4.4 Risk Aggregation Engine.
Implements deterministic governance policy floors and risk banding.
"""

def calculate_final_risk(ml_normalized_score: float, rules_results: list, duplicate_status: str) -> dict:
    final_score = float(ml_normalized_score)
    override_applied = False
    override_source = None
    override_floor = None
    drivers = []

    is_duplicate = (duplicate_status == "DUPLICATE_DETECTED")
    has_prog01 = any(r.get("rule_id") == "PROG-01" and r.get("status") == "TRIGGERED" for r in rules_results)
    has_util01 = any(r.get("rule_id") == "UTIL-01" and r.get("status") == "TRIGGERED" for r in rules_results)

    # Hierarchical Governance Overrides
    if is_duplicate:
        final_score = 100.0
        override_applied = True
        override_source = "DUP-01"
        override_floor = 100.0
        drivers.append("Critical duplicate-work risk detected across spatial and textual boundaries.")
    elif has_prog01 and final_score < 85.0:
        final_score = 85.0
        override_applied = True
        override_source = "PROG-01"
        override_floor = 85.0
    elif has_util01 and final_score < 75.0:
        final_score = 75.0
        override_applied = True
        override_source = "UTIL-01"
        override_floor = 75.0

    # Non-duplicate risk drivers
    if has_prog01 and not is_duplicate:
        drivers.append("Critical financial progress mismatch (PROG-01).")
    if has_util01 and not is_duplicate:
        drivers.append("High under-utilization risk relative to project lifecycle (UTIL-01).")
    if ml_normalized_score >= 75.0 and not is_duplicate:
        drivers.append(f"Statistical temporal/financial anomaly detected against peer group (Base ML: {ml_normalized_score:.1f}).")

    # Final Risk Banding
    if final_score >= 90.0:
        band = "CRITICAL"
    elif final_score >= 75.0:
        band = "HIGH"
    elif final_score >= 50.0:
        band = "MEDIUM"
    else:
        band = "LOW"
        if not drivers:
            drivers.append("Project attributes align with expected compliance baselines.")

    return {
        "risk_score": round(final_score, 2),
        "risk_band": band,
        "aggregation": {
            "base_ml_score": round(ml_normalized_score, 2),
            "override_applied": override_applied,
            "override_source": override_source,
            "override_floor": override_floor
        },
        "risk_drivers": drivers
    }
```

---

### 2. `src/inference/build_bundle.py`
*Location: `C:\Users\smrit\OneDrive\Desktop\SIH MPLADS\src\inference\build_bundle.py`*

```python
"""
build_bundle.py (Release Grade)
Phase 4.5A Artifact Bundler.
Enforces Experiment C provenance, builds the full schema/rule/model tree, 
and dynamically hashes every file into an immutable MANIFEST.json.
"""
import os
import json
import hashlib
import shutil
from datetime import datetime

def compute_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b""):
            h.update(chunk)
    return h.hexdigest()

def verify_experiment_c_provenance(model_path: str, expected_registry_hash: str):
    actual_hash = compute_sha256(model_path)
    if actual_hash != expected_registry_hash:
        raise ValueError(f"❌ PROVENANCE ALERT: The provided model ({actual_hash}) is NOT the registered Experiment C model ({expected_registry_hash}).")
    print("✅ Experiment C Provenance Verified via Registry Hash.")

def build_production_bundle(target_dataset_hash: str, target_model_hash: str):
    print("="*70)
    print("📦 PHASE 4.5A: RELEASE-GRADE ARTIFACT BUNDLER")
    print("="*70)

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    source_dir = os.path.join(root_dir, "artifacts")
    bundle_dir = os.path.join(root_dir, "ML_PACKAGE", "production_bundle")

    if os.path.exists(bundle_dir):
        shutil.rmtree(bundle_dir)
    
    for d in ["model", "preprocessing", "scoring", "rules", "duplicate", "schemas"]:
        os.makedirs(os.path.join(bundle_dir, d))

    artifact_map = {
        os.path.join(source_dir, "isolation_forest.joblib"): os.path.join(bundle_dir, "model", "isolation_forest.joblib"),
        os.path.join(source_dir, "preprocessing", "scaler.joblib"): os.path.join(bundle_dir, "preprocessing", "scaler.joblib"),
        os.path.join(source_dir, "preprocessing", "imputer.joblib"): os.path.join(bundle_dir, "preprocessing", "imputer.joblib"),
        os.path.join(source_dir, "preprocessing", "encoder.joblib"): os.path.join(bundle_dir, "preprocessing", "encoder.joblib"),
        os.path.join(source_dir, "preprocessing", "peer_medians.json"): os.path.join(bundle_dir, "preprocessing", "peer_medians.json"),
        os.path.join(source_dir, "threshold.json"): os.path.join(bundle_dir, "scoring", "threshold.json"),
        os.path.join(source_dir, "ml_score_normalization.json"): os.path.join(bundle_dir, "scoring", "ml_score_normalization.json"),
        os.path.join(source_dir, "utilization_calibration_report.json"): os.path.join(bundle_dir, "rules", "utilization_calibration_report.json"),
        os.path.join(source_dir, "duplicate_engine_frozen_spec.json"): os.path.join(bundle_dir, "duplicate", "duplicate_engine_frozen_spec.json"),
        os.path.join(source_dir, "schemas", "feature_schema.json"): os.path.join(bundle_dir, "schemas", "feature_schema.json"),
        os.path.join(source_dir, "schemas", "input_schema.json"): os.path.join(bundle_dir, "schemas", "input_schema.json"),
        os.path.join(source_dir, "schemas", "output_schema.json"): os.path.join(bundle_dir, "schemas", "output_schema.json"),
    }

    # Verify Provenance
    verify_experiment_c_provenance(os.path.join(source_dir, "isolation_forest.joblib"), target_model_hash)

    for src, dst in artifact_map.items():
        if not os.path.exists(src):
            raise FileNotFoundError(f"❌ CRITICAL: Required artifact missing: {src}")
        shutil.copy(src, dst)

    manifest_files = {}
    for root, _, files in os.walk(bundle_dir):
        for file in files:
            filepath = os.path.join(root, file)
            rel_path = os.path.relpath(filepath, bundle_dir)
            manifest_files[rel_path] = {
                "sha256": compute_sha256(filepath),
                "size_bytes": os.path.getsize(filepath)
            }

    bundle_manifest = {
        "bundle_version": "1.0.0",
        "pipeline_version": "1.0.0",
        "experiment": "C",
        "dataset_sha256": target_dataset_hash, 
        "creation_timestamp": datetime.utcnow().isoformat() + "Z",
        "files": manifest_files
    }

    with open(os.path.join(bundle_dir, "MANIFEST.json"), "w") as f:
        json.dump(bundle_manifest, f, indent=4)
    
    print(f"✅ BUNDLE CREATED SUCCESSFULLY AT: {bundle_dir}")
    print("="*70)

if __name__ == '__main__':
    # REPLACE WITH ACTUAL EXPERIMENT C HASHES
    build_production_bundle(
        target_dataset_hash="229a64e31fb0f3c28be001309e3a5b878a41fa8fb9b0d50b333396de9f620d65",
        target_model_hash="<YOUR_ACTUAL_MODEL_HASH>"
    )
```

---

### 3. `ML_PACKAGE/inference_service/predict.py`
*Location: `C:\Users\smrit\OneDrive\Desktop\SIH MPLADS\ML_PACKAGE\inference_service\predict.py`*

```python
"""
predict.py
Production inference orchestrator.
NO MOCKS. All artifacts loaded from the verified production bundle.
"""
from __future__ import annotations
import hashlib
import json
import pandas as pd
import numpy as np
import joblib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

class IntegrityError(RuntimeError): pass
class InferenceConfigurationError(RuntimeError): pass

class ProductionInference:
    def __init__(self, bundle_dir: str | Path):
        self.bundle_dir = Path(bundle_dir).resolve()
        if not self.bundle_dir.exists():
            raise InferenceConfigurationError(f"Production bundle not found: {self.bundle_dir}")

        self._verify_manifest()
        self._load_configuration()
        self._load_model()
        self._load_preprocessing()

    @staticmethod
    def _sha256(path: Path) -> str:
        h = hashlib.sha256()
        with path.open("rb") as f:
            for chunk in iter(lambda: f.read(1024 * 1024), b""):
                h.update(chunk)
        return h.hexdigest()

    def _verify_manifest(self) -> None:
        manifest_path = self.bundle_dir / "MANIFEST.json"
        if not manifest_path.exists():
            raise IntegrityError("MANIFEST.json missing")

        with manifest_path.open("r", encoding="utf-8") as f:
            manifest = json.load(f)

        if manifest.get("experiment") != "C":
            raise IntegrityError("Production bundle experiment must be C")

        for relative_path, metadata in manifest["files"].items():
            path = (self.bundle_dir / relative_path).resolve()
            if self.bundle_dir not in path.parents:
                raise IntegrityError(f"Manifest path escapes bundle: {relative_path}")
            if not path.exists():
                raise IntegrityError(f"Required artifact missing: {relative_path}")
            
            actual_hash = self._sha256(path)
            if actual_hash != metadata["sha256"]:
                raise IntegrityError(f"SHA256 mismatch for {relative_path}")

        self.manifest = manifest

    def _load_json(self, relative_path: str) -> Dict[str, Any]:
        with (self.bundle_dir / relative_path).open("r", encoding="utf-8") as f:
            return json.load(f)

    def _load_configuration(self) -> None:
        self.threshold = self._load_json("scoring/threshold.json")
        self.normalization = self._load_json("scoring/ml_score_normalization.json")
        self.feature_schema = self._load_json("schemas/feature_schema.json")
        self.duplicate_spec = self._load_json("duplicate/duplicate_engine_frozen_spec.json")
        self.utilization_calibration = self._load_json("rules/utilization_calibration_report.json")

    def _load_model(self) -> None:
        self.model = joblib.load(self.bundle_dir / "model" / "isolation_forest.joblib")
        if not hasattr(self.model, "decision_function"):
            raise InferenceConfigurationError("Loaded model does not expose decision_function()")

    def _load_preprocessing(self) -> None:
        self.scaler = joblib.load(self.bundle_dir / "preprocessing" / "scaler.joblib")
        self.imputer = joblib.load(self.bundle_dir / "preprocessing" / "imputer.joblib")
        self.encoder = joblib.load(self.bundle_dir / "preprocessing" / "encoder.joblib")
        with (self.bundle_dir / "preprocessing" / "peer_medians.json").open("r", encoding="utf-8") as f:
            self.peer_medians = json.load(f)

    def _transform_with_frozen_phase31(self, project: Dict[str, Any]) -> np.ndarray:
        numeric_cols = self.feature_schema.get("numeric_features", [])
        categorical_cols = self.feature_schema.get("categorical_features", [])
        expected_dim = self.feature_schema.get("expected_feature_count")

        raw_num = []
        for col in numeric_cols:
            val = project.get(col)
            if val is None or pd.isna(val):
                val = self.peer_medians.get(col, 0.0) 
            raw_num.append(float(val))

        raw_cat = []
        for col in categorical_cols:
            val = project.get(col, "UNKNOWN")
            raw_cat.append(str(val))

        X_num = self.scaler.transform([raw_num]) if raw_num else np.array([[]])
        X_cat = self.encoder.transform([raw_cat]) if raw_cat else np.array([[]])
        X_final = np.hstack([X_num, X_cat])

        if X_final.shape[1] != expected_dim:
            raise InferenceConfigurationError(f"Feature dimension mismatch: expected {expected_dim}, got {X_final.shape[1]}")

        return X_final

    def _normalize_score(self, score: float) -> float:
        method = self.normalization.get("method")
        if method == "min_max":
            minimum = float(self.normalization["min_score"])
            maximum = float(self.normalization["max_score"])
            if maximum <= minimum:
                raise InferenceConfigurationError("Invalid ML normalization bounds")
            normalized = ((score - minimum) / (maximum - minimum)) * 100.0
            return float(np.clip(normalized, 0.0, 100.0))
        raise InferenceConfigurationError(f"Unsupported normalization method: {method!r}")

    def _calculate_ml_score(self, X: np.ndarray) -> Dict[str, Any]:
        raw_if_score = float(self.model.decision_function(X)[0])
        ml_anomaly_score = -raw_if_score
        normalized_score = self._normalize_score(ml_anomaly_score)
        threshold = float(self.threshold["threshold_value"])
        
        status = "ANOMALY" if ml_anomaly_score >= threshold else "NORMAL"
        return {
            "status": status,
            "raw_score": raw_if_score,
            "ml_anomaly_score": ml_anomaly_score,
            "normalized_score": normalized_score,
        }

    def _evaluate_rules(self, project: Dict[str, Any]) -> List[Dict[str, Any]]:
        import sys
        sys.path.append(str(self.bundle_dir.parent.parent / "src"))
        from phase4.rules import DeterministicEngine
        
        results = []
        prog = DeterministicEngine.evaluate_prog_01(project)
        if prog.status.value == "TRIGGERED":
            results.append({
                "rule_id": prog.rule_id, "status": prog.status.value,
                "reason_code": prog.reason_code, "details": prog.details
            })

        util = DeterministicEngine.evaluate_util_01(project, calibration_report=self.utilization_calibration)
        if util.status.value == "TRIGGERED":
            results.append({
                "rule_id": util.rule_id, "status": util.status.value,
                "reason_code": util.reason_code, "details": util.details
            })
        return results

    def _evaluate_duplicates(self, project: Dict[str, Any], peers: List[Dict[str, Any]]) -> Dict[str, Any]:
        import sys
        sys.path.append(str(self.bundle_dir.parent.parent / "src"))
        from phase4.duplicate_engine import DuplicateEngine, DuplicateStatus

        for peer in peers:
            if peer.get("project_id") == project.get("project_id"): continue
            result = DuplicateEngine.evaluate_pair(project, peer)
            if result.status == DuplicateStatus.DUPLICATE_DETECTED:
                return {
                    "status": result.status.value, "matched_project_id": peer.get("project_id"),
                    "pathway": result.reason_code, "details": result.details
                }
        return {"status": DuplicateStatus.NO_MATCH.value}

    def analyze(self, target_project: Dict[str, Any], candidate_peers: List[Dict[str, Any]]) -> Dict[str, Any]:
        project_id = target_project.get("project_id")
        if not project_id:
            raise ValueError("project_id is required")

        X = self._transform_with_frozen_phase31(target_project)
        ml_result = self._calculate_ml_score(X)
        rules_results = self._evaluate_rules(target_project)
        duplicate_result = self._evaluate_duplicates(target_project, candidate_peers)

        import sys
        sys.path.append(str(self.bundle_dir.parent.parent / "src"))
        from phase4.risk_aggregator import calculate_final_risk

        aggregate = calculate_final_risk(
            ml_normalized_score=ml_result["normalized_score"],
            rules_results=rules_results,
            duplicate_status=duplicate_result["status"],
        )

        return {
            "project_id": project_id,
            "risk_score": aggregate["risk_score"],
            "risk_band": aggregate["risk_band"],
            "assessment_timestamp": datetime.now(timezone.utc).isoformat(),
            "aggregation": aggregate["aggregation"],
            "engines": {"isolation_forest": ml_result, "rules": rules_results, "duplicate": duplicate_result},
            "risk_drivers": aggregate["risk_drivers"],
        }
```

---

### 4. `ML_PACKAGE/inference_service/app.py`
*Location: `C:\Users\smrit\OneDrive\Desktop\SIH MPLADS\ML_PACKAGE\inference_service\app.py`*

```python
"""
app.py
Production HTTP boundary for the ML inference service.
The API refuses to start if the production bundle is invalid.
"""
from pathlib import Path
from typing import Any, Dict, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from predict import ProductionInference, IntegrityError, InferenceConfigurationError

BUNDLE_DIR = Path(__file__).resolve().parent.parent / "production_bundle"

class RiskRequest(BaseModel):
    project: Dict[str, Any]
    candidate_peers: List[Dict[str, Any]] = Field(default_factory=list)

try:
    inference_engine = ProductionInference(BUNDLE_DIR)
except Exception as exc:
    raise RuntimeError(f"PRODUCTION STARTUP FAILED: {exc}") from exc

app = FastAPI(title="MPLADS Risk Analytics Service", version="1.0.0")

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "mplads-risk-inference",
        "bundle_version": inference_engine.manifest["bundle_version"],
        "experiment": inference_engine.manifest["experiment"],
    }

@app.post("/api/v1/risk/analyze")
def analyze(request: RiskRequest):
    try:
        return inference_engine.analyze(
            target_project=request.project,
            candidate_peers=request.candidate_peers,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail={"code": "INVALID_REQUEST", "errors": [str(exc)]})
    except (IntegrityError, InferenceConfigurationError) as exc:
        raise HTTPException(status_code=500, detail={"code": "INFERENCE_CONFIGURATION_FAILURE", "errors": [str(exc)]})
    except Exception:
        raise HTTPException(status_code=500, detail={"code": "INFERENCE_FAILURE", "errors": ["Risk assessment could not be completed."]})
```

---

### 5. `ML_PACKAGE/inference_service/test_production_inference.py`
*Location: `C:\Users\smrit\OneDrive\Desktop\SIH MPLADS\ML_PACKAGE\inference_service\test_production_inference.py`*

```python
"""
test_production_inference.py
8-Gate Acceptance Suite.
"""
import copy
import json
import hashlib
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from app import app, inference_engine

client = TestClient(app)

def load_json(relative_path):
    path = inference_engine.bundle_dir / relative_path
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

def base_project():
    return {
        "project_id": "P_TEST_001",
        "expenditure": 400000,
        "sanctioned_amount": 1000000,
        "physical_progress_pct": 40.0,
        "project_age_days": 120,
        "start_date": "2025-01-01",
        "location_id": "LOC123",
        "constituency": "North",
        "work_type": "Road",
        "project_description": "Construction of road",
        # NOTE: Add state, district or any other fields required by your specific feature_schema.json
    }

def test_gate_1_health():
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "healthy"
    assert payload["experiment"] == "C"

def test_gate_2_manifest_integrity():
    manifest = inference_engine.manifest
    for relative_path, metadata in manifest["files"].items():
        path = inference_engine.bundle_dir / relative_path
        assert path.exists()
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        assert digest == metadata["sha256"]

def test_gate_3_scoring_artifact():
    threshold = load_json("scoring/threshold.json")
    normalization = load_json("scoring/ml_score_normalization.json")
    assert "threshold_value" in threshold
    assert normalization["method"] == "min_max"
    assert "min_score" in normalization
    assert "max_score" in normalization
    assert normalization["max_score"] > normalization["min_score"]

def test_gate_4_preprocessing_artifacts():
    required = [
        "model/isolation_forest.joblib", "preprocessing/scaler.joblib",
        "preprocessing/encoder.joblib", "preprocessing/peer_medians.json",
        "schemas/feature_schema.json"
    ]
    for relative_path in required:
        assert (inference_engine.bundle_dir / relative_path).exists()

def test_gate_5_normal_project():
    payload = {"project": base_project(), "candidate_peers": []}
    response = client.post("/api/v1/risk/analyze", json=payload)
    assert response.status_code == 200
    result = response.json()
    assert result["project_id"] == "P_TEST_001"
    assert 0 <= result["risk_score"] <= 100
    assert result["risk_band"] in {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

def test_gate_6_prog01_floor():
    project = base_project()
    project.update({"expenditure": 800000, "physical_progress_pct": 30.0})
    response = client.post("/api/v1/risk/analyze", json={"project": project, "candidate_peers": []})
    assert response.status_code == 200
    result = response.json()
    prog = next(r for r in result["engines"]["rules"] if r["rule_id"] == "PROG-01")
    assert prog["status"] == "TRIGGERED"
    assert result["risk_score"] >= 85.0

def test_gate_7_duplicate_override():
    project = base_project()
    peer = copy.deepcopy(project)
    peer["project_id"] = "P_DUP_001"
    response = client.post("/api/v1/risk/analyze", json={"project": project, "candidate_peers": [peer]})
    assert response.status_code == 200
    result = response.json()
    assert result["engines"]["duplicate"]["status"] == "DUPLICATE_DETECTED"
    assert result["risk_score"] == 100.0
    assert result["risk_band"] == "CRITICAL"
    assert result["aggregation"]["override_source"] == "DUP-01"

def test_gate_8_invalid_request():
    response = client.post("/api/v1/risk/analyze", json={"candidate_peers": []})
    assert response.status_code == 422
```

---

### 6. `ML_PACKAGE/inference_service/requirements.txt`
*Location: `C:\Users\smrit\OneDrive\Desktop\SIH MPLADS\ML_PACKAGE\inference_service\requirements.txt`*

```text
fastapi==0.103.2
uvicorn==0.23.2
pydantic==2.4.2
joblib==1.3.2
pandas==2.1.1
numpy==1.26.0
rapidfuzz==3.4.0
scikit-learn==1.3.1
pytest==7.4.2
httpx==0.25.0
```

---

### 7. `ML_PACKAGE/MLreadme.md`
*Location: `C:\Users\smrit\OneDrive\Desktop\SIH MPLADS\ML_PACKAGE\MLreadme.md`*

```markdown
# 🚀 MPLADS Risk Analytics: ML_PACKAGE Integration Guide

**To:** Backend Engineering Team (Express/Node.js + PostgreSQL)
**From:** ML & Data Science Team

This package contains the **MPLADS Risk Analytics Engine**, packaged as a **standalone Python Microservice (FastAPI)**. You do NOT need to run Python code inside Node.js or manage `.joblib` model weights. 

## 🏗️ Architecture
1. **Your Node.js/Express Backend** (e.g., Port 5000) - Connected to PostgreSQL.
2. **The ML Inference Service** (e.g., Port 8000) - Stateless, fail-closed REST API.

## ⚙️ How to Start the ML Service
```bash
cd ML_PACKAGE/inference_service
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```
*(Note: `app.py` enforces cryptographic integrity at startup. Do not modify the `production_bundle` directory).*

## 🌐 API Contract

**`POST http://localhost:8000/api/v1/risk/analyze`**

**Request payload (JSON):**
```json
{
  "project": { ... },
  "candidate_peers": [ { ... } ]
}
```

**Response payload (JSON):**
```json
{
  "project_id": "P_1029",
  "risk_score": 100.0,
  "risk_band": "CRITICAL",
  "assessment_timestamp": "2026-08-26T14:08:41Z",
  "aggregation": { ... },
  "engines": { ... },
  "risk_drivers": [ ... ]
}
```

**Integration:** Send the Project data from Postgres via Axios/Fetch to this endpoint. Map the returned `risk_score` and `risk_drivers` in your React frontend. Handle HTTP `400` or `500` codes gracefully (do NOT default the risk score to 0).
```