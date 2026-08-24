/*
IMPLEMENTATION PROMPT
FILE: backend/src/rules/base-rule.js
PURPOSE:
Define the common interface and output contract for all rule-engine modules.

PROJECT CONTEXT:
Rules must remain independent from controllers, ML model code, and database queries. They are the explainability layer for project risk flags.

TECHNOLOGIES:
JavaScript

INPUTS:
- Project context and relevant metric values

OUTPUTS:
- Structured rule result with `rule_id`, `anomaly_type`, `severity`, `message`, `evidence`, and `relevant_values`

DEPENDENCIES:
- No DB access; this is a pure domain interface

DATABASE DEPENDENCIES:
- None directly; rules consume input objects passed from the analysis service

API DEPENDENCIES:
- Used by analysis and risk orchestration

BUSINESS RULES:
- Rules are explainable and deterministic
- Rules should not directly label a project fraudulent

ERROR HANDLING:
- Return null or a safe result when required fields are missing

SECURITY REQUIREMENTS:
- Keep the rule contract explicit and safe for downstream use

ACCEPTANCE CRITERIA:
- All rules share a consistent output schema
- Results can be passed into the risk engine and alert creation flow

WHAT NOT TO CHANGE:
- Do not add database calls or UI logic here

IMPLEMENTATION NOTES:
- Keep rule outputs serializable and easy to test
*/

export const ruleOutputShape = {
  ruleId: 'string',
  anomalyType: 'string',
  severity: 'LOW | MEDIUM | HIGH | CRITICAL',
  message: 'string',
  evidence: {},
  relevantValues: {},
};

export class BaseRule {
  run() {
    return null;
  }
}
