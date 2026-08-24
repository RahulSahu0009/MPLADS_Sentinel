/*
IMPLEMENTATION PROMPT
FILE: backend/src/repositories/alert.repository.js
PURPOSE:
Persist and retrieve alert records for project risk and anomaly review workflows.

PROJECT CONTEXT:
Alerts represent actionable review items derived from project anomalies and risk scores.

TECHNOLOGIES:
Node.js, JavaScript, Prisma, PostgreSQL

INPUTS:
- Alert creation and status update payloads
- Query filters for project or status-based listing

OUTPUTS:
- Alert row data and filtered alert lists

DEPENDENCIES:
- ../config/prisma.js

DATABASE DEPENDENCIES:
- Alert, Project, Anomaly

API DEPENDENCIES:
- Used by alert service and controller

BUSINESS RULES:
- Alert status transitions must remain valid
- Each alert should remain tied to its project and anomaly context

ERROR HANDLING:
- Surface database conflicts and update failures clearly

SECURITY REQUIREMENTS:
- Repository should not perform auth or UI enforcement logic

ACCEPTANCE CRITERIA:
- Alert records can be created, fetched, and updated consistently

WHAT NOT TO CHANGE:
- Do not bypass Prisma and database constraints
- Do not mix alert logic with business rules outside the service layer

IMPLEMENTATION NOTES:
- Keep filters flexible for dashboard review and triage experiences
*/

export class AlertRepository {
  async create(alertData) {
    // TODO: insert alert into Prisma and include project/anomaly linkage
    return alertData;
  }

  async findMany(filters = {}) {
    // TODO: list alerts by status, project, or severity using Prisma
    return [];
  }

  async update(alertId, updates) {
    // TODO: update alert status and resolution metadata
    return { id: alertId, ...updates };
  }
}
