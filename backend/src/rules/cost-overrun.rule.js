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

export class CostOverrunRule extends BaseRule {
  // TODO: implement cost overrun detection logic
}
