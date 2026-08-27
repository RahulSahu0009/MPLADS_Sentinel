/*
IMPLEMENTATION PROMPT
FILE: backend/src/services/risk.service.js
PURPOSE:
Implement the central risk orchestration service that combines rule outputs, ML anomaly scores, and project context into an explainable risk score.

PROJECT CONTEXT:
This is the key risk engine for MPLADS Sentinel. It computes project risk based on cost deviation, delay, duplicate signals, compliance findings, and ML anomaly results.

TECHNOLOGIES:
Node.js, JavaScript, Prisma

INPUTS:
- Project data
- Rule output objects
- ML prediction and anomaly score payloads
- Optional drift or early-warning metrics

OUTPUTS:
- `risk_score` from 0 to 100
- `risk_level` as LOW, MEDIUM, HIGH, or CRITICAL
- `reasons` and `contributing_signals`
- `model_version` and `calculated_at`

DEPENDENCIES:
- ../rules/*.js
- ./analysis.service.js
- ./alert.service.js
- ../repositories/risk.repository.js

DATABASE DEPENDENCIES:
- Project, RiskScore, Anomaly, Alert

API DEPENDENCIES:
- Called by risk controller and project analysis flow

BUSINESS RULES:
- The score must be explainable and evidence-based
- Distinguish current risk from predicted or early-warning risk when both are supported
- Do not automatically label a project as fraudulent

ERROR HANDLING:
- Handle missing anomaly input values gracefully and preserve a fallback safe path when necessary

SECURITY REQUIREMENTS:
- Only authorized business logic may calculate risk and store results

ACCEPTANCE CRITERIA:
- A risk score can be generated from rule and ML outputs
- Reasons explain why a project was flagged
- Output is persisted for dashboard and detail pages

WHAT NOT TO CHANGE:
- Do not implement ML model code in Node.js
- Do not place score logic in the route file

IMPLEMENTATION NOTES:
- Keep weights and thresholds explicit and testable
- Persist the model version metadata for accountability and explainability
*/

import { RiskRepository } from '../repositories/risk.repository.js';

const severityScore = {
  LOW: 10,
  MEDIUM: 25,
  HIGH: 40,
  CRITICAL: 60,
};

const withStatus = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const clampScore = (value) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
};

const scoreToLevel = (score) => {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
};

export class RiskService {
  constructor({ riskRepository = new RiskRepository() } = {}) {
    this.riskRepository = riskRepository;
  }

  async computeRisk(project, ruleResults = [], mlResult = null) {
    if (!project?.id) {
      throw withStatus('Risk computation requires a project with id', 400);
    }

    const normalizedRules = Array.isArray(ruleResults) ? ruleResults : [];
    const reasons = [];

    const ruleScoreTotal = normalizedRules.reduce((total, signal) => {
      const signalScore = Number(signal?.score);
      const derived = Number.isFinite(signalScore)
        ? signalScore
        : severityScore[signal?.severity] ?? 0;

      if (signal?.reason) {
        reasons.push(signal.reason);
      } else if (signal?.description) {
        reasons.push(signal.description);
      } else if (signal?.type) {
        reasons.push(`Signal detected: ${signal.type}`);
      }

      return total + clampScore(derived);
    }, 0);

    const boundedRuleScore = clampScore(ruleScoreTotal);

    let modelScore = 0;
    if (mlResult) {
      const rawRiskScore = Number(mlResult.riskScore);
      const rawAnomalyScore = Number(mlResult.anomalyScore);

      if (Number.isFinite(rawRiskScore)) {
        modelScore = clampScore(rawRiskScore);
      } else if (Number.isFinite(rawAnomalyScore)) {
        modelScore = rawAnomalyScore <= 1 ? clampScore(rawAnomalyScore * 100) : clampScore(rawAnomalyScore);
      }
    }

    const hasRuleSignals = normalizedRules.length > 0;
    const hasModelSignal = modelScore > 0;
    const blendedScore = hasRuleSignals && hasModelSignal
      ? clampScore((boundedRuleScore * 0.6) + (modelScore * 0.4))
      : clampScore(Math.max(boundedRuleScore, modelScore));

    if (reasons.length === 0) {
      reasons.push('No explicit high-risk signals were provided in this analysis input.');
    }

    return {
      projectId: project.id,
      riskScore: blendedScore,
      riskLevel: scoreToLevel(blendedScore),
      reasons,
      contributingSignals: {
        ruleResults: normalizedRules,
        mlResult: mlResult ?? null,
      },
      modelVersion: mlResult?.modelVersion || 'rule-only',
      calculatedAt: new Date().toISOString(),
    };
  }

  async saveRiskSnapshot(riskPayload) {
    return this.riskRepository.create(riskPayload);
  }

  async getLatestRiskByProjectId(projectId) {
    if (!projectId) {
      throw withStatus('Project id is required to fetch risk', 400);
    }

    return this.riskRepository.findLatestByProjectId(projectId);
  }
}
