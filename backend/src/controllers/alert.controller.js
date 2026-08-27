/*
IMPLEMENTATION PROMPT
FILE: backend/src/controllers/alert.controller.js
PURPOSE:
Handle listing and status updates for alert records.

PROJECT CONTEXT:
The alert lifecycle is a critical human review flow for operational response and governance oversight.

TECHNOLOGIES:
Node.js, Express, JavaScript

INPUTS:
- Query parameters and patch payloads for status updates

OUTPUTS:
- Alert list and alert status mutation responses

DEPENDENCIES:
- ../services/alert.service.js
- ../repositories/alert.repository.js

DATABASE DEPENDENCIES:
- Alert, Project, Anomaly

API DEPENDENCIES:
- Internal orchestration only; no direct external API

BUSINESS RULES:
- Valid status transitions must be enforced
- Auditing is required for each change

ERROR HANDLING:
- Return 404 for missing alerts and 409 for invalid transitions

SECURITY REQUIREMENTS:
- Only authorized roles may resolve or reject alerts

ACCEPTANCE CRITERIA:
- Alert lifecycle is persistent and traceable

WHAT NOT TO CHANGE:
- Do not implement alert logic in routes or UI layers

IMPLEMENTATION NOTES:
- Keep the controller response format clean and reusable for the frontend
*/

import { AlertService } from '../services/alert.service.js';

export class AlertController {
  constructor({ alertService = new AlertService() } = {}) {
    this.alertService = alertService;
  }

  async listAlerts(filters = {}, user = null) {
    const result = await this.alertService.listAlerts(filters);
    return {
      data: result.items,
      meta: result.pagination,
    };
  }

  async updateAlertStatus(alertId, payload = {}, user = null) {
    const updated = await this.alertService.updateAlertStatus(alertId, payload);
    return { data: updated };
  }
}
