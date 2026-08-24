/*
IMPLEMENTATION PROMPT
FILE: backend/src/routes/risk.routes.js
PURPOSE:
Define routes for risk analysis and risk retrieval.

PROJECT CONTEXT:
Risk scoring combines ML output, rule engine findings, compliance metrics, delays, and duplication signals.

TECHNOLOGIES:
Express, JavaScript, Prisma

INPUTS:
- Risk analysis payload and project ID

OUTPUTS:
- Risk score, explanations, and metadata

DEPENDENCIES:
- ../controllers/risk.controller.js
- ../validators/risk.validator.js
- ../services/risk.service.js

DATABASE DEPENDENCIES:
- Project, RiskScore, Anomaly, Alert

API DEPENDENCIES:
- POST /api/risk/analyze
- GET /api/projects/:id/risk

BUSINESS RULES:
- Risk output must be explainable and scoped to evidence-driven signals
- Do not claim fraud automatically

ERROR HANDLING:
- Return missing-project and validation errors clearly

SECURITY REQUIREMENTS:
- Require role-appropriate authorization for risk triggers

ACCEPTANCE CRITERIA:
- API contract aligns with the scoring and dashboard design
- Risk endpoints call the service layer rather than direct logic

WHAT NOT TO CHANGE:
- Do not compute risk in router code

IMPLEMENTATION NOTES:
- Keep the route surface small and predictable
*/

import { Router } from 'express';
import { RiskController } from '../controllers/risk.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { riskAnalysisSchema } from '../validators/risk.validator.js';

export const riskRouter = Router();
const controller = new RiskController();

riskRouter.post('/analyze', requireAuth, requireRole(['ADMIN', 'OFFICER']), async (req, res) => {
  const parsed = riskAnalysisSchema.safeParse ? riskAnalysisSchema.safeParse(req.body) : { success: true, data: req.body };

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid risk analysis payload', issues: parsed.error?.issues ?? [] });
  }

  const result = await controller.analyzeProjectRisk(parsed.data, req.user);
  res.json(result);
});

riskRouter.get('/projects/:id', requireAuth, async (req, res) => {
  const result = await controller.getProjectRisk(req.params.id, req.user);
  res.json(result);
});
