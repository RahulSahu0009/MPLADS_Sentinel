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

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const REQUIRED_FIELDS = [
  { key: 'sanctionedAmount', label: 'sanctioned amount' },
  { key: 'stateId', label: 'state' },
  { key: 'districtId', label: 'district' },
  { key: 'agencyId', label: 'implementing agency' },
  { key: 'expectedCompletionDate', label: 'expected completion date' },
];

export class ComplianceRule extends BaseRule {
  run(project = {}) {
    const missing = REQUIRED_FIELDS.filter(({ key }) => project[key] === undefined || project[key] === null || project[key] === '');
    const dateIssues = [];

    const workOrderDate = toDate(project.workOrderDate);
    const startDate = toDate(project.startDate);
    const expectedCompletionDate = toDate(project.expectedCompletionDate);
    const actualCompletionDate = toDate(project.actualCompletionDate);

    if (workOrderDate && startDate && startDate < workOrderDate) {
      dateIssues.push('Start date precedes the work order date.');
    }
    if (startDate && expectedCompletionDate && expectedCompletionDate < startDate) {
      dateIssues.push('Expected completion date precedes the start date.');
    }
    if (actualCompletionDate && startDate && actualCompletionDate < startDate) {
      dateIssues.push('Actual completion date precedes the start date.');
    }
    if (project.status === 'COMPLETED' && !actualCompletionDate) {
      dateIssues.push('Project marked COMPLETED but has no actual completion date.');
    }

    if (missing.length === 0 && dateIssues.length === 0) {
      return null;
    }

    const severity = missing.length + dateIssues.length >= 3 ? 'HIGH' : missing.length + dateIssues.length === 2 ? 'MEDIUM' : 'LOW';
    const messageParts = [];
    if (missing.length > 0) {
      messageParts.push(`Missing required fields: ${missing.map((m) => m.label).join(', ')}.`);
    }
    if (dateIssues.length > 0) {
      messageParts.push(...dateIssues);
    }

    return this.createResult({
      ruleId: 'COMPLIANCE_DEVIATION',
      anomalyType: 'COMPLIANCE_DEVIATION',
      severity,
      message: messageParts.join(' '),
      evidence: { missingFields: missing.map((m) => m.key), dateIssues },
      relevantValues: {
        sanctionedAmount: project.sanctionedAmount,
        stateId: project.stateId,
        districtId: project.districtId,
        agencyId: project.agencyId,
        expectedCompletionDate: project.expectedCompletionDate,
        status: project.status,
      },
    });
  }
}
