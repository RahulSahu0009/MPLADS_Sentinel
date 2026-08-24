/*
IMPLEMENTATION PROMPT
FILE: backend/src/services/risk.service.js
PURPOSE:
Implement the central risk orchestration service that combines rule outputs, ML anomaly scores, and project context into an explainable risk score.

PROJECT CONTEXT:
This is the key risk engine for MPLADS Sentinel. It computes project risk based on cost deviation, delay, duplicate signals, compliance findings, and ML anomaly results.

TECHNOLOGIES:
Node.js, JavaScript, Prisma

INPUTS:
- Project data
- Rule output objects
- ML prediction and anomaly score payloads
- Optional drift or early-warning metrics

OUTPUTS:
- `risk_score` from 0 to 100
- `risk_level` as LOW, MEDIUM, HIGH, or CRITICAL
- `reasons` and `contributing_signals`
- `model_version` and `calculated_at`

DEPENDENCIES:
- ../rules/*.js
- ./analysis.service.js
- ./alert.service.js
- ../repositories/risk.repository.js

DATABASE DEPENDENCIES:
- Project, RiskScore, Anomaly, Alert

API DEPENDENCIES:
- Called by risk controller and project analysis flow

BUSINESS RULES:
- The score must be explainable and evidence-based
- Distinguish current risk from predicted or early-warning risk when both are supported
- Do not automatically label a project as fraudulent

ERROR HANDLING:
- Handle missing anomaly input values gracefully and preserve a fallback safe path when necessary

SECURITY REQUIREMENTS:
- Only authorized business logic may calculate risk and store results

ACCEPTANCE CRITERIA:
- A risk score can be generated from rule and ML outputs
- Reasons explain why a project was flagged
- Output is persisted for dashboard and detail pages

WHAT NOT TO CHANGE:
- Do not implement ML model code in Node.js
- Do not place score logic in the route file

IMPLEMENTATION NOTES:
- Keep weights and thresholds explicit and testable
- Persist the model version metadata for accountability and explainability
*/

export class RiskService {
  async computeRisk(project, ruleResults = [], mlResult = null) {
    // TODO: calculate weighted score and assign risk level based on all evidence
    return {
      projectId: project?.id || null,
      riskScore: 0,
      riskLevel: 'LOW',
      reasons: [],
      contributingSignals: ruleResults,
      modelVersion: mlResult?.modelVersion || 'unknown',
      calculatedAt: new Date().toISOString(),
    };
  }

  async saveRiskSnapshot(riskPayload) {
    // TODO: persist snapshot to RiskScore table and related anomaly records
    return riskPayload;
  }
}
