/*
IMPLEMENTATION PROMPT
FILE: backend/src/rules/duplicate-rule.js
PURPOSE:
Identify duplicate, near-duplicate, or suspiciously repeated project records.

PROJECT CONTEXT:
Duplicated projects can create inflated counts, skewed finance summaries, and poor governance visibility.

TECHNOLOGIES:
JavaScript

INPUTS:
- projectName
- districtId
- sanctionedAmount
- startDate
- other project metadata

OUTPUTS:
- Rule result with `anomalyType = DUPLICATE_PROJECT`

DEPENDENCIES:
- ./base-rule.js

DATABASE DEPENDENCIES:
- None directly; may leverage repository or service comparisons in the higher layer

API DEPENDENCIES:
- Called by analysis service before final risk aggregation

BUSINESS RULES:
- Flag only likely duplicates and require evidence from matching fields

ERROR HANDLING:
- Return null when too little evidence exists

SECURITY REQUIREMENTS:
- Keep the rationale evidence-based and explainable

ACCEPTANCE CRITERIA:
- Returned result explains the duplicate signal with matching evidence

WHAT NOT TO CHANGE:
- Do not add general project deduplication logic elsewhere in this file

IMPLEMENTATION NOTES:
- Prefer a clear similarity heuristic over overly aggressive matching
*/

import { BaseRule } from './base-rule.js';

export class DuplicateRule extends BaseRule {
  // TODO: implement duplicate detection logic
}
