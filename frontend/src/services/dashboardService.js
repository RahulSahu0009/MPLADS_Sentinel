/*
IMPLEMENTATION PROMPT
FILE: frontend/src/services/dashboardService.js
PURPOSE:
Provide dashboard-specific API methods for KPI cards and charts. This service is the interface between the dashboard UI and backend analytics endpoints.

PROJECT CONTEXT:
The dashboard returns aggregated and geography-based metrics needed for the risk overview screens.

TECHNOLOGIES:
Axios, JavaScript

INPUTS:
- Dashboard filter parameters such as date range, state, district, risk level, status, and project type

OUTPUTS:
- KPI totals and chart-ready JSON payloads

DEPENDENCIES:
- api.js

DATABASE DEPENDENCIES:
- None directly

API DEPENDENCIES:
- GET /api/dashboard/stats
- GET /api/analytics/state
- GET /api/analytics/district

BUSINESS RULES:
- Keep metric names consistent with backend analytics contract
- Return data structured for charts and KPI cards without UI-specific reshaping

ERROR HANDLING:
- Handle failed requests and invalid parameter combinations gracefully

SECURITY REQUIREMENTS:
- Keep auth tokens attached when required

ACCEPTANCE CRITERIA:
- Dashboard page can fetch all necessary data with a single service abstraction
- Response payloads are ready for UI rendering without extra backend logic

WHAT NOT TO CHANGE:
- Do not add business logic for risk calculation here
- Do not store raw API metadata in components

IMPLEMENTATION NOTES:
- Keep this file focused on API contracts and response mapping only
*/

import { api } from './api.js';

export const dashboardService = {
  async getStats(params = {}) {
    // TODO: call GET /api/dashboard/stats with optional filters
    return api.get('/dashboard/stats', { params });
  },

  async getStateAnalytics(params = {}) {
    // TODO: call GET /api/analytics/state with filters
    return api.get('/analytics/state', { params });
  },

  async getDistrictAnalytics(params = {}) {
    // TODO: call GET /api/analytics/district with filters
    return api.get('/analytics/district', { params });
  },

  async getRiskSummary(params = {}) {
    // TODO: call GET /api/analytics/risk-summary when implemented
    return api.get('/analytics/risk-summary', { params });
  },
};
