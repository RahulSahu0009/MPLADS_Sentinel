/*
IMPLEMENTATION PROMPT
FILE: backend/src/services/ml-client.service.js
PURPOSE:
Create a client for the Python FastAPI ML service so the backend can send project features and receive anomaly or risk metadata.

PROJECT CONTEXT:
The Node backend orchestrates the ML workflow while the ML service performs feature engineering and Isolation Forest inference.

TECHNOLOGIES:
Node.js, JavaScript, Axios

INPUTS:
- Project feature payloads
- Optional metadata such as model version

OUTPUTS:
- ML prediction payload with anomaly score and model metadata

DEPENDENCIES:
- axios
- ../config/env.js

DATABASE DEPENDENCIES:
- None directly

API DEPENDENCIES:
- POST /api/ml/predict or an internal FastAPI endpoint

BUSINESS RULES:
- Network failures should be recoverable and not crash API requests
- Model output is a risk signal, not a definitive accusation of fraud

ERROR HANDLING:
- Retry or fail gracefully with typed fallback metadata when the ML service is unavailable

SECURITY REQUIREMENTS:
- Keep service URLs in environment variables only

ACCEPTANCE CRITERIA:
- The backend can send a feature payload to the ML service and parse the response
- Response mapping remains consistent with the risk engine contract

WHAT NOT TO CHANGE:
- Do not implement the Isolation Forest model here
- Do not mix ML request logic with route handlers

IMPLEMENTATION NOTES:
- Wrap API request and response mapping in a single client for maintainability
*/

export class MlClientService {
  async predict(features) {
    // TODO: call the Python ML service and normalize its response into a domain payload
    return {
      anomalyScore: 0,
      prediction: 'NORMAL',
      modelVersion: 'pending',
      source: 'ml-service',
      features,
    };
  }
}
