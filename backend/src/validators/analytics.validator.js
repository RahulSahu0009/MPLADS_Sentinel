/*
FILE: backend/src/validators/analytics.validator.js
PURPOSE:
Validate query filters for the dashboard, state, and district analytics endpoints.

IMPLEMENTATION NOTES:
Mirrors the filter set project.validator.js already exposes for listing
projects, plus a `from`/`to` date range, so analytics filters stay
consistent with how projects themselves are filtered.
*/

import { z } from 'zod';

const projectStatusValues = ['PLANNED', 'SANCTIONED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'SUSPENDED', 'CANCELLED'];
const dataSourceValues = ['OFFICIAL_MPLADS', 'SYNTHETIC_DEMO'];
const riskLevelValues = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const optionalDate = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date;
}, z.date().optional());

export const analyticsQuerySchema = z.object({
  stateId: z.string().uuid().optional(),
  districtId: z.string().uuid().optional(),
  constituencyId: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional(),
  mpId: z.string().uuid().optional(),
  status: z.enum(projectStatusValues).optional(),
  dataSourceType: z.enum(dataSourceValues).optional(),
  riskLevel: z.enum(riskLevelValues).optional(),
  from: optionalDate,
  to: optionalDate,
}).strict();
