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

import { ProjectService } from '../services/project.service.js';
import { RiskService } from '../services/risk.service.js';
import { riskAnalysisSchema } from '../validators/risk.validator.js';

const withStatus = (message, status, issues) => {
  const error = new Error(message);
  error.status = status;
  if (issues) {
    error.issues = issues;
  }

  return error;
};

export class RiskController {
  constructor({ riskService = new RiskService(), projectService = new ProjectService() } = {}) {
    this.riskService = riskService;
    this.projectService = projectService;
  }

  async analyzeProjectRisk(payload = {}, user = null) {
    const parsed = riskAnalysisSchema.safeParse(payload);
    if (!parsed.success) {
      throw withStatus('Invalid risk analysis payload', 400, parsed.error.issues);
    }

    const project = await this.projectService.getProjectById(parsed.data.projectId);
    const riskPayload = await this.riskService.computeRisk(
      project,
      parsed.data.ruleResults ?? [],
      parsed.data.mlResult ?? null
    );

    const shouldPersist = parsed.data.persist !== false;
    const risk = shouldPersist
      ? await this.riskService.saveRiskSnapshot(riskPayload)
      : riskPayload;

    return { projectId: parsed.data.projectId, risk };
  }

  async getProjectRisk(projectId, user = null) {
    const risk = await this.projectService.getProjectRisk(projectId);
    return { projectId, risk };
  }
}
