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

export class UtilizationAnomalyRule extends BaseRule {
  // TODO: implement utilization anomaly detection logic
}
