/*
IMPLEMENTATION PROMPT
FILE: backend/src/rules/utilization-anomaly.rule.js
PURPOSE:
Detect unusual fund utilization patterns, including abrupt spikes or underutilization compared with the expected trajectory.

PROJECT CONTEXT:
In MPLADS projects, utilization anomalies often signal governance issues or implementation problems.

TECHNOLOGIES:
JavaScript

INPUTS:
- sanctionedAmount
- utilizedAmount
- plannedUtilization
- actualProgress
- timeElapsed

OUTPUTS:
- Rule result with `anomalyType = UTILIZATION_ANOMALY`

DEPENDENCIES:
- ./base-rule.js

DATABASE DEPENDENCIES:
- None directly

API DEPENDENCIES:
- Called by analysis and risk services

BUSINESS RULES:
- Severity should reflect the gap between expected and observed utilization

ERROR HANDLING:
- Return null when insufficient values exist to compute a ratio

SECURITY REQUIREMENTS:
- Keep calculation transparent and explainable

ACCEPTANCE CRITERIA:
- Rule returns a clear anomaly result with evidence and severity

WHAT NOT TO CHANGE:
- Do not add monitoring or infra logic here

IMPLEMENTATION NOTES:
- Use normalized ratios for plan-vs-actual utilization and progress comparison
*/

import { BaseRule } from './base-rule.js';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export class UtilizationAnomalyRule extends BaseRule {
  run(project = {}) {
    const sanctionedAmount = toNumber(project.sanctionedAmount);
    const totalExpenditure = toNumber(project.totalExpenditure);
    const progressPercentage = toNumber(project.progressPercentage);

    if (sanctionedAmount === null || sanctionedAmount <= 0 || totalExpenditure === null || progressPercentage === null) {
      return null;
    }

    const utilizationRatio = (totalExpenditure / sanctionedAmount) * 100; // % of funds spent
    const gap = utilizationRatio - progressPercentage; // positive = over-spent vs. progress

    // Over-utilization: money spent well ahead of physical/overall progress —
    // a common irregularity signal (funds drawn without matching work done).
    if (gap >= 20) {
      const severity = gap >= 60 ? 'CRITICAL' : gap >= 40 ? 'HIGH' : 'MEDIUM';
      return this.createResult({
        ruleId: 'FUND_UTILIZATION_ANOMALY',
        anomalyType: 'FUND_UTILIZATION_ANOMALY',
        severity,
        message: `Fund utilization (${utilizationRatio.toFixed(1)}%) is running ${gap.toFixed(1)} points ahead of reported progress (${progressPercentage}%).`,
        evidence: { sanctionedAmount, totalExpenditure, utilizationRatio: Number(utilizationRatio.toFixed(2)), progressPercentage, gap: Number(gap.toFixed(2)) },
        relevantValues: { sanctionedAmount, totalExpenditure, progressPercentage },
      });
    }

    // Under-utilization: significant progress claimed with very little
    // spend — either a reporting inconsistency or funds not actually
    // flowing to match reported work.
    if (progressPercentage >= 40 && utilizationRatio <= progressPercentage - 30) {
      const underGap = progressPercentage - utilizationRatio;
      const severity = underGap >= 60 ? 'HIGH' : 'MEDIUM';
      return this.createResult({
        ruleId: 'FUND_UTILIZATION_ANOMALY',
        anomalyType: 'FUND_UTILIZATION_ANOMALY',
        severity,
        message: `Reported progress (${progressPercentage}%) significantly exceeds fund utilization (${utilizationRatio.toFixed(1)}%).`,
        evidence: { sanctionedAmount, totalExpenditure, utilizationRatio: Number(utilizationRatio.toFixed(2)), progressPercentage, underGap: Number(underGap.toFixed(2)) },
        relevantValues: { sanctionedAmount, totalExpenditure, progressPercentage },
      });
    }

    return null;
  }
}
