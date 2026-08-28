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

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const monthsOverdueToSeverity = (monthsOverdue) => {
  if (monthsOverdue >= 12) return 'CRITICAL';
  if (monthsOverdue >= 6) return 'HIGH';
  if (monthsOverdue >= 3) return 'MEDIUM';
  if (monthsOverdue >= 0) return 'LOW';
  return null;
};

export class DelayRule extends BaseRule {
  run(project = {}, context = {}) {
    const expectedCompletionDate = toDate(project.expectedCompletionDate);
    if (!expectedCompletionDate) {
      return null;
    }

    const actualCompletionDate = toDate(project.actualCompletionDate);
    const now = context.now ? toDate(context.now) ?? new Date() : new Date();
    const progressPercentage = toNumber(project.progressPercentage);

    // Completed projects: compare actual vs expected completion.
    if (actualCompletionDate) {
      const overdueDays = Math.round((actualCompletionDate - expectedCompletionDate) / MS_PER_DAY);
      if (overdueDays <= 0) {
        return null;
      }

      const monthsOverdue = overdueDays / 30;
      const severity = monthsOverdueToSeverity(monthsOverdue);
      if (!severity) return null;

      return this.createResult({
        ruleId: 'PROJECT_DELAY',
        anomalyType: 'PROJECT_DELAY',
        severity,
        message: `Project completed ${overdueDays} day(s) after the expected completion date.`,
        evidence: {
          expectedCompletionDate: expectedCompletionDate.toISOString(),
          actualCompletionDate: actualCompletionDate.toISOString(),
          overdueDays,
        },
        relevantValues: { expectedCompletionDate: project.expectedCompletionDate, actualCompletionDate: project.actualCompletionDate },
      });
    }

    // Not yet completed: check whether it's already past the expected date,
    // or whether progress is badly lagging as the deadline approaches
    // (early-warning signal ahead of an outright overrun).
    const daysUntilExpected = Math.round((expectedCompletionDate - now) / MS_PER_DAY);

    if (daysUntilExpected < 0) {
      const overdueDays = -daysUntilExpected;
      const monthsOverdue = overdueDays / 30;
      const severity = monthsOverdueToSeverity(monthsOverdue);
      if (!severity) return null;

      return this.createResult({
        ruleId: 'PROJECT_DELAY',
        anomalyType: 'PROJECT_DELAY',
        severity,
        message: `Project is ${overdueDays} day(s) past its expected completion date and not marked complete.`,
        evidence: {
          expectedCompletionDate: expectedCompletionDate.toISOString(),
          overdueDays,
          progressPercentage,
        },
        relevantValues: { expectedCompletionDate: project.expectedCompletionDate, progressPercentage: project.progressPercentage },
      });
    }

    // Early warning: deadline is close (within 90 days) but progress is
    // well behind where it should be. This flags risk before the project
    // actually overruns.
    if (progressPercentage !== null && daysUntilExpected <= 90) {
      const urgencyRatio = 1 - daysUntilExpected / 90; // 0 (90 days out) -> 1 (due now)
      const expectedMinProgress = urgencyRatio * 70; // rough plan-vs-actual expectation
      const progressGap = expectedMinProgress - progressPercentage;

      if (progressGap >= 15) {
        const severity = progressGap >= 40 ? 'HIGH' : progressGap >= 25 ? 'MEDIUM' : 'LOW';
        return this.createResult({
          ruleId: 'PROJECT_DELAY',
          anomalyType: 'PROJECT_DELAY',
          severity,
          message: `Early warning: only ${progressPercentage}% complete with ${daysUntilExpected} day(s) left until the expected completion date.`,
          evidence: { daysUntilExpected, progressPercentage, expectedMinProgress: Number(expectedMinProgress.toFixed(1)) },
          relevantValues: { expectedCompletionDate: project.expectedCompletionDate, progressPercentage: project.progressPercentage },
        });
      }
    }

    return null;
  }
}
