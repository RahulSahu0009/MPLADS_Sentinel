/*
IMPLEMENTATION PROMPT
FILE: backend/src/rules/delay.rule.js
PURPOSE:
Flag projects with schedule slippage relative to planned milestones and expected completion dates.

PROJECT CONTEXT:
This rule helps identify delays that may require escalation or audit follow-up.

TECHNOLOGIES:
JavaScript

INPUTS:
- plannedStartDate
- actualStartDate
- plannedEndDate
- actualEndDate
- progressPercent

OUTPUTS:
- Rule result with `anomalyType = SCHEDULE_DELAY`

DEPENDENCIES:
- ./base-rule.js

DATABASE DEPENDENCIES:
- None directly; receives project data from the analysis service

API DEPENDENCIES:
- Called by risk analysis service

BUSINESS RULES:
- Delay severity should increase with time overrun and low progress-to-plan ratio

ERROR HANDLING:
- Return a safe result when date values are missing or invalid

SECURITY REQUIREMENTS:
- Avoid exposing internal assumptions or unsupported confidence

ACCEPTANCE CRITERIA:
- The rule can explain the delay and provide measurable evidence

WHAT NOT TO CHANGE:
- Do not add external API calls here

IMPLEMENTATION NOTES:
- Use date arithmetic carefully and normalize project-specific schedule data
*/

import { BaseRule } from './base-rule.js';

export class DelayRule extends BaseRule {
  // TODO: implement delay detection logic
}
