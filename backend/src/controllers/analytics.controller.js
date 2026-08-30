/*
IMPLEMENTATION PROMPT
FILE: backend/src/controllers/analytics.controller.js
PURPOSE:
Provide analytical summaries for dashboard and geography-based views.

PROJECT CONTEXT:
Analytical outputs support ministry, state, and district authorities in reviewing portfolio health, divergence, and trend coverage.

TECHNOLOGIES:
Node.js, Express, JavaScript, Prisma

INPUTS:
- Query filters for geography, time range, project type, risk level, and status

OUTPUTS:
- Dashboard and analytics summaries for charts and KPI cards

DEPENDENCIES:
- ../services/analysis.service.js
- ../repositories/analytics.repository.js

DATABASE DEPENDENCIES:
- Project, FinancialRecord, RiskScore, Alert, AggregateStatistic

API DEPENDENCIES:
- GET /api/dashboard/stats
- GET /api/analytics/state
- GET /api/analytics/district

BUSINESS RULES:
- Aggregate and chart metrics must be consistent with filter selection
- Keep source metadata separate when official and synthetic data overlap

ERROR HANDLING:
- Use safe fallback responses for invalid or incomplete filters

SECURITY REQUIREMENTS:
- Auth-protect analytics endpoints and enforce role-aware access

ACCEPTANCE CRITERIA:
- Controller returns chart-ready metrics and summary counts
- The data shape remains stable across dashboard screens

WHAT NOT TO CHANGE:
- Do not add raw SQL or frontend chart logic here

IMPLEMENTATION NOTES:
- Keep names aligned with the frontend analytics and dashboard services
*/

import { AnalyticsService } from '../services/analytics.service.js';
import { analyticsQuerySchema } from '../validators/analytics.validator.js';

const withStatus = (message, status, issues) => {
  const error = new Error(message);
  error.status = status;
  if (issues) {
    error.issues = issues;
  }
  return error;
};

export class AnalyticsController {
  constructor({ analyticsService = new AnalyticsService() } = {}) {
    this.analyticsService = analyticsService;
  }

  parseFilters(filters) {
    const parsed = analyticsQuerySchema.safeParse(filters);
    if (!parsed.success) {
      throw withStatus('Invalid analytics query filters', 400, parsed.error.issues);
    }
    return parsed.data;
  }

  async getStateAnalytics(filters = {}, user = null) {
    return this.analyticsService.getStateAnalytics(this.parseFilters(filters), user);
  }

  async getDistrictAnalytics(filters = {}, user = null) {
    return this.analyticsService.getDistrictAnalytics(this.parseFilters(filters), user);
  }

  async getDashboardStats(filters = {}, user = null) {
    return this.analyticsService.getDashboardStats(this.parseFilters(filters), user);
  }
}
