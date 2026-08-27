/*
IMPLEMENTATION PROMPT
FILE: backend/src/validators/project.validator.js
PURPOSE:
Validate project creation, update, and list-query payloads before they reach services or repositories.

PROJECT CONTEXT:
Project records have status, geographies, financial values, and source metadata. Validation must enforce integrity and prevent malformed writes.

TECHNOLOGIES:
JavaScript, Zod

INPUTS:
- Request payloads and query filters

OUTPUTS:
- Parsed and validated project payload objects

DEPENDENCIES:
- zod

DATABASE DEPENDENCIES:
- Project, State, District, Constituency, Agency, MP

API DEPENDENCIES:
- Project routes and controller layer

BUSINESS RULES:
- Numeric values representing amounts must be valid and non-negative when expected
- Status must be a valid project state and `dataSource` must align with the allowed values

ERROR HANDLING:
- Return clear validation issues for missing or malformed inputs

SECURITY REQUIREMENTS:
- Reject malformed or malicious payloads early

ACCEPTANCE CRITERIA:
- Invalid payloads fail before persistence
- Validation logic is consistent with Prisma schema and app expectations

WHAT NOT TO CHANGE:
- Do not implement business logic in the validator

IMPLEMENTATION NOTES:
- Keep schemas central and reusable so route/controller code stays consistent
*/

import { z } from 'zod';

const projectStatusValues = ['PLANNED', 'SANCTIONED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'SUSPENDED', 'CANCELLED'];
const dataSourceValues = ['OFFICIAL_MPLADS', 'SYNTHETIC_DEMO'];

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

const optionalNonNegativeNumber = z.preprocess(
  parseNumber,
  z.number().nonnegative()
).optional();

const optionalDate = z.coerce.date().optional();

export const projectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(projectStatusValues).optional(),
  stateId: z.string().uuid().optional(),
  districtId: z.string().uuid().optional(),
  constituencyId: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional(),
  mpId: z.string().uuid().optional(),
  dataSourceType: z.enum(dataSourceValues).optional(),
  isSyntheticDemo: z.coerce.boolean().optional(),
  search: z.string().trim().min(1).max(200).optional(),
}).strict();

export const projectCreateSchema = z.object({
  externalId: z.string().trim().max(120).optional(),
  title: z.string().trim().min(3).max(500),
  description: z.string().trim().max(4000).optional(),
  projectType: z.string().trim().max(120).optional(),
  status: z.enum(projectStatusValues).optional(),
  sanctionedAmount: z.preprocess(parseNumber, z.number().nonnegative()),
  estimatedCost: optionalNonNegativeNumber,
  totalExpenditure: optionalNonNegativeNumber,
  workOrderDate: optionalDate,
  startDate: optionalDate,
  expectedCompletionDate: optionalDate,
  actualCompletionDate: optionalDate,
  progressPercentage: z.preprocess(parseNumber, z.number().min(0).max(100)).optional(),
  districtId: z.string().uuid().optional(),
  constituencyId: z.string().uuid().optional(),
  stateId: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional(),
  mpId: z.string().uuid().optional(),
  dataSourceId: z.string().uuid().optional(),
  dataSourceType: z.enum(dataSourceValues).optional(),
  isSyntheticDemo: z.boolean().optional(),
}).strict();

export const projectUpdateSchema = projectCreateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be provided for update',
});

export const projectAnalyzeSchema = z.object({
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
  persist: z.boolean().optional(),
}).strict();
