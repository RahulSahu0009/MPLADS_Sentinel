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

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const tokenize = (text) =>
  new Set(
    String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2)
  );

const jaccardSimilarity = (a, b) => {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Unlike the other rules, duplicate detection is inherently comparative:
 * it needs candidate projects to compare against. Rules stay DB-free per
 * the base-rule contract, so the caller (AnalysisService) is responsible
 * for fetching a reasonable candidate set (e.g. same district/state,
 * created within a recent window) and passing it in as `context.candidates`.
 */
export class DuplicateRule extends BaseRule {
  run(project = {}, context = {}) {
    const candidates = Array.isArray(context.candidates) ? context.candidates : [];
    if (candidates.length === 0) return null;

    const projectTokens = tokenize(project.title);
    const projectSanctioned = toNumber(project.sanctionedAmount);
    const projectStart = toDate(project.startDate);

    let bestMatch = null;

    for (const candidate of candidates) {
      if (!candidate || candidate.id === project.id) continue;

      const titleSimilarity = jaccardSimilarity(projectTokens, tokenize(candidate.title));
      if (titleSimilarity < 0.5) continue;

      const sameDistrict = Boolean(project.districtId) && project.districtId === candidate.districtId;

      const candidateSanctioned = toNumber(candidate.sanctionedAmount);
      const costClose =
        projectSanctioned !== null &&
        candidateSanctioned !== null &&
        Math.abs(projectSanctioned - candidateSanctioned) / Math.max(projectSanctioned, candidateSanctioned) <= 0.1;

      const candidateStart = toDate(candidate.startDate);
      const dateClose =
        projectStart !== null &&
        candidateStart !== null &&
        Math.abs(projectStart - candidateStart) / MS_PER_DAY <= 30;

      const matchCount = [sameDistrict, costClose, dateClose].filter(Boolean).length;

      // Require strong title overlap plus at least one corroborating signal
      // so we don't flag two unrelated projects that just share common words.
      if (matchCount === 0 && titleSimilarity < 0.75) continue;

      const candidateScore = titleSimilarity + matchCount * 0.1;
      if (!bestMatch || candidateScore > bestMatch.candidateScore) {
        bestMatch = { candidate, titleSimilarity, sameDistrict, costClose, dateClose, matchCount, candidateScore };
      }
    }

    if (!bestMatch) return null;

    const { candidate, titleSimilarity, sameDistrict, costClose, dateClose, matchCount } = bestMatch;
    const severity = titleSimilarity >= 0.9 && matchCount >= 2 ? 'HIGH' : matchCount >= 1 ? 'MEDIUM' : 'LOW';

    return this.createResult({
      ruleId: 'POTENTIAL_DUPLICATE',
      anomalyType: 'POTENTIAL_DUPLICATE',
      severity,
      message: `Project closely resembles "${candidate.title}" (${Math.round(titleSimilarity * 100)}% title match)${sameDistrict ? ', same district' : ''}${costClose ? ', similar sanctioned amount' : ''}${dateClose ? ', similar start date' : ''}.`,
      evidence: {
        candidateProjectId: candidate.id,
        candidateTitle: candidate.title,
        titleSimilarity: Number(titleSimilarity.toFixed(2)),
        sameDistrict,
        costClose,
        dateClose,
      },
      relevantValues: { title: project.title, districtId: project.districtId, sanctionedAmount: project.sanctionedAmount, startDate: project.startDate },
    });
  }
}
