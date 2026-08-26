/*
IMPLEMENTATION PROMPT
FILE: backend/src/routes/alert.routes.js
PURPOSE:
Expose alert listing and status update endpoints.

PROJECT CONTEXT:
Alert review is crucial for operational response and risk triage.

TECHNOLOGIES:
Express, JavaScript, Prisma

INPUTS:
- Alert status and severity queries
- Update payloads for triage decisions

OUTPUTS:
- List of alerts and updated alert status responses

DEPENDENCIES:
- ../controllers/alert.controller.js
- ../middleware/auth.middleware.js

DATABASE DEPENDENCIES:
- Alert, Project, Anomaly

API DEPENDENCIES:
- GET /api/alerts
- PATCH /api/alerts/:id/status

BUSINESS RULES:
- Alert lifecycle states must follow OPEN -> UNDER_REVIEW -> RESOLVED / FALSE_POSITIVE

ERROR HANDLING:
- Return clear errors for invalid transitions and unauthorized updates

SECURITY REQUIREMENTS:
- Enforce authentication and role checks on status changes

ACCEPTANCE CRITERIA:
- Route contract matches the alert workflow and dashboard UX

WHAT NOT TO CHANGE:
- Do not implement logic directly in the router

IMPLEMENTATION NOTES:
- Keep alert route naming and intent consistent with the review UI
*/

import { Router } from 'express';
import { AlertController } from '../controllers/alert.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../lib/async-handler.js';
import { WRITE_ROLES } from '../constants/rbac.js';

export const alertRouter = Router();
const controller = new AlertController();

alertRouter.get('/', requireAuth, asyncHandler(async (req, res) => {
  const result = await controller.listAlerts(req.query, req.user);
  res.json(result);
}));

alertRouter.patch('/:id/status', requireAuth, requireRole(WRITE_ROLES), asyncHandler(async (req, res) => {
  const result = await controller.updateAlertStatus(req.params.id, req.body, req.user);
  res.json(result);
}));
