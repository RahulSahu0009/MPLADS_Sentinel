/*
IMPLEMENTATION PROMPT
FILE: backend/src/services/alert.service.js
PURPOSE:
Generate, update, and manage alert records resulting from anomalies and risk scoring.

PROJECT CONTEXT:
Alert generation is essential for operational triage and ministry oversight. Each alert must be traceable to evidence and resolution state.

TECHNOLOGIES:
Node.js, JavaScript, Prisma

INPUTS:
- Risk results
- Anomaly outputs
- Project context

OUTPUTS:
- Alert objects with message, severity, status, and timestamps

DEPENDENCIES:
- ../repositories/alert.repository.js
- ./risk.service.js
- ./analysis.service.js

DATABASE DEPENDENCIES:
- Alert, Anomaly, Project, RiskScore

API DEPENDENCIES:
- Used by project and risk analysis flows

BUSINESS RULES:
- Alert severity should align with risk and anomaly severity
- `OPEN`, `UNDER_REVIEW`, `RESOLVED`, and `FALSE_POSITIVE` status transitions must be auditable

ERROR HANDLING:
- Prevent duplicate open alerts unless intentional deduplication logic is approved

SECURITY REQUIREMENTS:
- Only authorized users may resolve or reject alerts

ACCEPTANCE CRITERIA:
- Alert creation occurs during or after risk analysis
- Alert lifecycle can be tracked through the API and UI

WHAT NOT TO CHANGE:
- Do not add UI logic here
- Do not suppress evidence in alert content

IMPLEMENTATION NOTES:
- Keep alert messages concise but reasoned enough for intervention decisions
*/

export class AlertService {
  async createAlert(projectId, alertPayload) {
    // TODO: create a traceable alert record with evidence and severity mapping
    return {
      id: 'alert-id',
      projectId,
      status: 'OPEN',
      severity: 'MEDIUM',
      ...alertPayload,
      createdAt: new Date().toISOString(),
    };
  }

  async resolveAlert(alertId, resolution) {
    // TODO: update status and store resolution metadata
    return { id: alertId, status: 'RESOLVED', resolution };
  }
}
