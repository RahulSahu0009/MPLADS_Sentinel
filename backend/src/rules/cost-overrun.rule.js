/*
IMPLEMENTATION PROMPT
FILE: backend/src/rules/cost-overrun.rule.js
PURPOSE:
Detect cost overruns when actual expenditure materially exceeds sanctioned or estimated cost.

PROJECT CONTEXT:
This rule helps identify significant overspending without asserting that a project is fraudulent.

TECHNOLOGIES:
JavaScript

INPUTS:
- sanctionedAmount
- estimatedCost
- totalExpenditure
- relevant project status info

OUTPUTS:
- Rule result with `anomalyType = COST_OVERRUN`

DEPENDENCIES:
- ./base-rule.js

DATABASE DEPENDENCIES:
- None directly; uses project values passed from the analysis service

API DEPENDENCIES:
- Called by analysis orchestration and risk scoring

BUSINESS RULES:
- Output evidence must include sanctioned amount, estimated cost, total expenditure, and deviation percentage

ERROR HANDLING:
- Return null when required values are missing or invalid

SECURITY REQUIREMENTS:
- Rules must remain evidence-driven and not accusatory

ACCEPTANCE CRITERIA:
- A structured anomaly result is returned for substantial cost deviation
- Severity is assigned according to the deviation magnitude

WHAT NOT TO CHANGE:
- Do not add DB or UI code here

IMPLEMENTATION NOTES:
- Maintain a single responsibility and simple unit tests for this rule
*/

import { BaseRule } from './base-rule.js';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// Deviation-percentage tiers. Below the LOW threshold we don't flag at all —
// small overspend against estimate is normal project variance.
const SEVERITY_TIERS = [
  { min: 100, severity: 'CRITICAL' },
  { min: 50, severity: 'HIGH' },
  { min: 25, severity: 'MEDIUM' },
  { min: 10, severity: 'LOW' },
];

export class CostOverrunRule extends BaseRule {
  run(project = {}) {
    const sanctionedAmount = toNumber(project.sanctionedAmount);
    const estimatedCost = toNumber(project.estimatedCost);
    const totalExpenditure = toNumber(project.totalExpenditure);

    // PS requirement: IF expenditure > sanctioned_amount THEN flag COST_OVERRUN.
    // We use sanctionedAmount as the baseline, falling back to estimatedCost
    // only when sanctionedAmount isn't available.
    const baseline = sanctionedAmount ?? estimatedCost;

    if (baseline === null || baseline <= 0 || totalExpenditure === null) {
      return null;
    }

    const deviation = totalExpenditure - baseline;
    if (deviation <= 0) {
      return null;
    }

    const deviationPercent = (deviation / baseline) * 100;
    const tier = SEVERITY_TIERS.find((t) => deviationPercent >= t.min);
    if (!tier) {
      return null;
    }

    return this.createResult({
      ruleId: 'COST_OVERRUN',
      anomalyType: 'COST_OVERRUN',
      severity: tier.severity,
      message: `Expenditure exceeds sanctioned amount by ${deviationPercent.toFixed(1)}% (₹${deviation.toLocaleString('en-IN')} over baseline of ₹${baseline.toLocaleString('en-IN')}).`,
      evidence: {
        sanctionedAmount,
        estimatedCost,
        totalExpenditure,
        baseline,
        deviation,
        deviationPercent: Number(deviationPercent.toFixed(2)),
      },
      relevantValues: { sanctionedAmount, estimatedCost, totalExpenditure },
    });
  }
}
