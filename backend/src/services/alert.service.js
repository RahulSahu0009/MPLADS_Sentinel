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

import { AlertRepository } from '../repositories/alert.repository.js';

const allowedStatuses = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'FALSE_POSITIVE'];

const transitions = {
  OPEN: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['RESOLVED', 'FALSE_POSITIVE'],
  RESOLVED: [],
  FALSE_POSITIVE: [],
};

const withStatus = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const riskScoreToSeverity = (riskScore) => {
  const value = Number(riskScore);
  if (value >= 75) return 'CRITICAL';
  if (value >= 50) return 'HIGH';
  if (value >= 25) return 'MEDIUM';
  return 'LOW';
};

export class AlertService {
  constructor({ alertRepository = new AlertRepository() } = {}) {
    this.alertRepository = alertRepository;
  }

  async createAlert(projectId, alertPayload) {
    if (!projectId) {
      throw withStatus('Project id is required to create alert', 400);
    }

    const riskScore = Number(alertPayload?.riskScore ?? 0);
    if (!Number.isFinite(riskScore)) {
      throw withStatus('Alert riskScore must be numeric', 400);
    }

    return this.alertRepository.create({
      projectId,
      alertId: alertPayload?.alertId ?? `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      anomalyId: alertPayload?.anomalyId ?? null,
      anomalyType: alertPayload?.anomalyType ?? 'DATA_INCONSISTENCY',
      severity: alertPayload?.severity ?? riskScoreToSeverity(riskScore),
      riskScore,
      message: alertPayload?.message ?? 'Potential risk signal detected for review.',
      status: 'OPEN',
    });
  }

  async listAlerts(filters = {}) {
    return this.alertRepository.findMany(filters);
  }

  async updateAlertStatus(alertId, payload = {}) {
    if (!alertId) {
      throw withStatus('Alert id is required', 400);
    }

    const nextStatus = payload?.status;
    if (!allowedStatuses.includes(nextStatus)) {
      throw withStatus('Invalid alert status', 400);
    }

    const existing = await this.alertRepository.findById(alertId);
    if (!existing) {
      throw withStatus('Alert not found', 404);
    }

    if (existing.status !== nextStatus && !(transitions[existing.status] || []).includes(nextStatus)) {
      throw withStatus(`Invalid alert status transition from ${existing.status} to ${nextStatus}`, 409);
    }

    return this.alertRepository.update(alertId, { status: nextStatus });
  }

  async resolveAlert(alertId, resolution) {
    return this.updateAlertStatus(alertId, { status: 'RESOLVED', resolution });
  }
}
