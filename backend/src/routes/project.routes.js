/*
IMPLEMENTATION PROMPT
FILE: backend/src/routes/project.routes.js
PURPOSE:
Define the project API routes for list, detail, create, analyze, anomaly, and risk retrieval operations.

PROJECT CONTEXT:
Projects are the core domain objects for MPLADS monitoring. These routes support dashboard-driven and operational workflows.

TECHNOLOGIES:
Express, JavaScript, Prisma

INPUTS:
- Query params and request bodies from frontend or admin tooling

OUTPUTS:
- HTTP responses for project data and analysis requests

DEPENDENCIES:
- ../controllers/project.controller.js
- ../middleware/auth.middleware.js
- ../validators/project.validator.js

DATABASE DEPENDENCIES:
- Project, FinancialRecord, ProgressRecord, RiskScore, Anomaly

API DEPENDENCIES:
- GET /api/projects
- GET /api/projects/:id
- POST /api/projects
- POST /api/projects/:id/analyze
- GET /api/projects/:id/anomalies
- GET /api/projects/:id/risk

BUSINESS RULES:
- Project creation and mutation endpoints must be role-controlled
- Source must remain distinct between OFFICIAL_MPLADS and SYNTHETIC_DEMO

ERROR HANDLING:
- Return clear validation and not-found errors

SECURITY REQUIREMENTS:
- Protect mutation routes with JWT and role checks

ACCEPTANCE CRITERIA:
- Route structure matches the backend API contract
- Validation sits before controller logic

WHAT NOT TO CHANGE:
- Do not implement business logic in the router
- Do not introduce MongoDB or TypeScript

IMPLEMENTATION NOTES:
- Keep route naming consistent with the frontend service layer and documentation
*/

import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

export const projectRouter = Router();
const controller = new ProjectController();

projectRouter.get('/', requireAuth, async (req, res) => {
  const result = await controller.listProjects(req.query, req.user);
  res.json(result);
});

projectRouter.get('/:id', requireAuth, async (req, res) => {
  const result = await controller.getProjectById(req.params.id, req.user);
  res.json(result);
});

projectRouter.post('/', requireAuth, requireRole(['ADMIN', 'OFFICER']), async (req, res) => {
  const result = await controller.createProject(req.body, req.user);
  res.status(201).json(result);
});

projectRouter.post('/:id/analyze', requireAuth, requireRole(['ADMIN', 'OFFICER']), async (req, res) => {
  const result = await controller.analyzeProject(req.params.id, req.body, req.user);
  res.json(result);
});

projectRouter.get('/:id/anomalies', requireAuth, async (req, res) => {
  const result = await controller.getProjectAnomalies(req.params.id, req.user);
  res.json(result);
});

projectRouter.get('/:id/risk', requireAuth, async (req, res) => {
  const result = await controller.getProjectRisk(req.params.id, req.user);
  res.json(result);
});
