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

export const projectSchema = {};
