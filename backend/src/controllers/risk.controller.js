/*
IMPLEMENTATION PROMPT
FILE: backend/src/controllers/risk.controller.js
PURPOSE:
Handle project risk retrieval and trigger risk analysis workflows.

PROJECT CONTEXT:
Risk analysis combines rule outputs, ML inference, and project context to generate explainable risk scores.

TECHNOLOGIES:
Node.js, Express, JavaScript, Prisma

INPUTS:
- Project identifier or risk analysis payload

OUTPUTS:
- Risk score payload including `risk_score`, `risk_level`, and `reasons`

DEPENDENCIES:
- ../services/risk.service.js
- ../services/analysis.service.js

DATABASE DEPENDENCIES:
- Project, RiskScore, Anomaly, Alert

API DEPENDENCIES:
- POST /api/risk/analyze
- GET /api/projects/:id/risk

BUSINESS RULES:
- Risk must remain explainable with explicit reasons and contributing signals
- The system can flag risk but must not claim fraud automatically

ERROR HANDLING:
- Return 404 for missing project and 422 for invalid analysis payloads

SECURITY REQUIREMENTS:
- Restrict triggering analysis to authorized roles

ACCEPTANCE CRITERIA:
- Controller returns structured risk info and delegates calculations to services

WHAT NOT TO CHANGE:
- Do not implement ML algorithms here

IMPLEMENTATION NOTES:
- Keep the response contract aligned with the frontend and database schema
*/

export class RiskController {
  async analyzeProjectRisk(payload = {}, user = null) {
    // TODO: validate payload and call AnalysisService / RiskService
    return { projectId: payload.projectId ?? null, risk: null, user: user?.id ?? null };
  }

  async getProjectRisk(projectId, user = null) {
    // TODO: fetch risk score for a project
    return { projectId, risk: null, user: user?.id ?? null };
  }
}
