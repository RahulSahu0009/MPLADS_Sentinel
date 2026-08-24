/*
IMPLEMENTATION PROMPT
FILE: backend/src/rules/compliance-rule.js
PURPOSE:
Evaluate compliance signals such as missing documentation, policy deviations, and required approvals.

PROJECT CONTEXT:
Compliance checks are essential for a transparent governance platform and support escalation decisions.

TECHNOLOGIES:
JavaScript

INPUTS:
- project status data
- completion evidence fields
- submission dates
- required approvals

OUTPUTS:
- Rule result with `anomalyType = COMPLIANCE_VIOLATION`

DEPENDENCIES:
- ./base-rule.js

DATABASE DEPENDENCIES:
- None directly; consumes a normalized project object from service logic

API DEPENDENCIES:
- Used by risk analysis service

BUSINESS RULES:
- Missing mandatory evidence should be treated as a compliance concern

ERROR HANDLING:
- Return null if the project lacks the fields needed for a meaningful evaluation

SECURITY REQUIREMENTS:
- Do not expose or infer privileged data beyond what is justified by the project

ACCEPTANCE CRITERIA:
- The rule produces explainable compliance evidence and a severity label

WHAT NOT TO CHANGE:
- Do not add authentication or user permission logic here

IMPLEMENTATION NOTES:
- Use rule outputs as evidence for downstream alerts and audit review
*/

import { BaseRule } from './base-rule.js';

export class ComplianceRule extends BaseRule {
  // TODO: implement compliance checks
}
