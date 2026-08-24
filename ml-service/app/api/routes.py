"""
IMPLEMENTATION PROMPT
FILE: ml-service/app/api/routes.py
PURPOSE:
Define the FastAPI routes for prediction and health checks in the ML service.

PROJECT CONTEXT:
The backend calls the ML service to obtain anomaly scores and model output based on project feature vectors.

TECHNOLOGIES:
Python, FastAPI

INPUTS:
- Project feature payloads
- Optional model metadata or payload version

OUTPUTS:
- Prediction result and anomaly score JSON

DEPENDENCIES:
- fastapi
- pydantic

DATABASE DEPENDENCIES:
- None directly

API DEPENDENCIES:
- Consumed by backend MlClientService

BUSINESS RULES:
- Predictions must be model outputs only and not final accusations
- Keep API responses explainable and versioned

ERROR HANDLING:
- Return validation errors for malformed payloads

SECURITY REQUIREMENTS:
- Require environment-specific service protection in deployed settings

ACCEPTANCE CRITERIA:
- The service exposes a health endpoint and a predict endpoint
- The route contracts align with the backend ML client service

WHAT NOT TO CHANGE:
- Do not include training logic here

IMPLEMENTATION NOTES:
- Keep route handlers thin and delegate execution to service functions
"""

from fastapi import APIRouter

router = APIRouter()


@router.get('/health')
def health() -> dict:
    return {'status': 'ok', 'service': 'mplads-ml-service'}


@router.post('/predict')
def predict(payload: dict) -> dict:
    return {
        'anomaly_score': 0.0,
        'prediction': 'NORMAL',
        'model_version': 'pending',
        'payload': payload,
    }
