/*
IMPLEMENTATION PROMPT
FILE: backend/src/validators/auth.validator.js
PURPOSE:
Validate login and auth payloads before they are used for token generation or credential verification.

PROJECT CONTEXT:
JWT authentication is required for the MPLADS Sentinel platform. Validation must ensure that malformed input is rejected early.

TECHNOLOGIES:
JavaScript, Zod

INPUTS:
- Email and password
- Optional refresh token body

OUTPUTS:
- Validated auth payload object

DEPENDENCIES:
- zod

DATABASE DEPENDENCIES:
- User, Role

API DEPENDENCIES:
- Auth route contract

BUSINESS RULES:
- Email must be structurally valid
- Password must meet the minimum requirements defined by the project security policy

ERROR HANDLING:
- Return descriptive 400 errors for invalid payloads

SECURITY REQUIREMENTS:
- Reject empty or malicious input before verification

ACCEPTANCE CRITERIA:
- Invalid payloads fail before hitting the auth service or DB layer

WHAT NOT TO CHANGE:
- Do not implement password hashing or JWT creation here

IMPLEMENTATION NOTES:
- Keep validators limited to structure validation and support wider service logic
*/

export const loginSchema = {};
