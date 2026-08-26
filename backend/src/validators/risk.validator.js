/*
IMPLEMENTATION PROMPT
FILE: backend/src/validators/risk.validator.js
PURPOSE:
Validate project risk analysis requests before they reach the risk or analysis service.

PROJECT CONTEXT:
Risk analysis requests combine project context and scoring metadata. Validation ensures the request is structurally sound before invoking the scoring engine.

TECHNOLOGIES:
JavaScript, Zod

INPUTS:
- Risk analysis request body
- Project identifier and optional metadata

OUTPUTS:
- Parsed risk-analysis payload

DEPENDENCIES:
- zod

DATABASE DEPENDENCIES:
- Project, RiskScore, Anomaly, Alert

API DEPENDENCIES:
- Risk route and controller layer

BUSINESS RULES:
- Project ID must be present when required
- Numeric values must be valid and within the expected range of the risk engine

ERROR HANDLING:
- Return descriptive validation errors for missing or invalid request fields

SECURITY REQUIREMENTS:
- Reject malformed payloads early

ACCEPTANCE CRITERIA:
- Risk analysis requests are consistent with the application contract
- No invalid analysis requests reach the service layer

WHAT NOT TO CHANGE:
- Do not implement risk calculation in this validator

IMPLEMENTATION NOTES:
- Keep schema objects aligned with the final risk API contract
*/

import { z } from 'zod';

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

export const riskAnalysisSchema = z.object({
  projectId: z.string().uuid(),
  persist: z.boolean().optional(),
  ruleResults: z.array(z.object({
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    score: z.preprocess(parseNumber, z.number().min(0).max(100)).optional(),
    reason: z.string().trim().min(1).max(500).optional(),
    type: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().min(1).max(1000).optional(),
  }).passthrough()).optional(),
  mlResult: z.object({
    anomalyScore: z.preprocess(parseNumber, z.number().min(0)).optional(),
    riskScore: z.preprocess(parseNumber, z.number().min(0).max(100)).optional(),
    modelVersion: z.string().trim().min(1).max(120).optional(),
  }).passthrough().optional(),
}).strict();
