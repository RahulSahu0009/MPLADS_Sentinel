/*
IMPLEMENTATION PROMPT
FILE: backend/src/routes/analytics.routes.js
PURPOSE:
Provide analytics endpoints for state, district, and dashboard aggregate views.

PROJECT CONTEXT:
The analytics layer supports the main dashboard and geography-specific decision screens.

TECHNOLOGIES:
Express, JavaScript, Prisma

INPUTS:
- Query filters for state, district, constituency, status, risk level, and date range

OUTPUTS:
- Aggregated statistical payloads ready for charts

DEPENDENCIES:
- ../controllers/analytics.controller.js
- ../services/analysis.service.js

DATABASE DEPENDENCIES:
- Project, AggregateStatistic, RiskScore, Alert, FinancialRecord

API DEPENDENCIES:
- GET /api/dashboard/stats
- GET /api/analytics/state
- GET /api/analytics/district

BUSINESS RULES:
- Keep official and synthetic data provenance visible when needed
- Support role-based filtering by geography and sensitivity

ERROR HANDLING:
- Return 400 for invalid input ranges and 500 for unhandled aggregation issues

SECURITY REQUIREMENTS:
- Require authentication for analytics endpoints

ACCEPTANCE CRITERIA:
- Endpoint contract supports the dashboard and analytic views
- Payloads are structured for chart rendering

WHAT NOT TO CHANGE:
- Do not put raw aggregation SQL or business logic in the routes

IMPLEMENTATION NOTES:
- Prefer reusable service methods and consistent metric names
*/

import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const analyticsRouter = Router();
const controller = new AnalyticsController();

analyticsRouter.get('/state', requireAuth, async (req, res) => {
  const result = await controller.getStateAnalytics(req.query, req.user);
  res.json(result);
});

analyticsRouter.get('/district', requireAuth, async (req, res) => {
  const result = await controller.getDistrictAnalytics(req.query, req.user);
  res.json(result);
});

analyticsRouter.get('/dashboard/stats', requireAuth, async (req, res) => {
  const result = await controller.getDashboardStats(req.query, req.user);
  res.json(result);
});
