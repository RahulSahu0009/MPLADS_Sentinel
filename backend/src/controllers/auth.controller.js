/*
IMPLEMENTATION PROMPT
FILE: backend/src/controllers/auth.controller.js
PURPOSE:
Handle authentication requests and token issuance for protected user journeys.

PROJECT CONTEXT:
The MPLADS Sentinel platform includes multiple stakeholder roles and must authenticate users through a secure JWT flow.

TECHNOLOGIES:
Node.js, Express, JavaScript, JWT

INPUTS:
- Login request body with email and password

OUTPUTS:
- JWT token and user metadata object

DEPENDENCIES:
- ../services/auth.service.js
- ../repositories/user.repository.js
- ../middleware/auth.middleware.js

DATABASE DEPENDENCIES:
- User, Role

API DEPENDENCIES:
- POST /api/auth/login
- POST /api/auth/refresh

BUSINESS RULES:
- Password verification must use hashed values only
- JWT payload must include user identity and role

ERROR HANDLING:
- Return 401 for invalid credentials and 400 for malformed payloads

SECURITY REQUIREMENTS:
- Never expose password hashes or raw internal session values

ACCEPTANCE CRITERIA:
- Auth controller returns a valid token payload for recognized users
- Protected routes validate the token before business logic

WHAT NOT TO CHANGE:
- Do not implement JWT logic in route files

IMPLEMENTATION NOTES:
- Keep the controller thin and delegate secure logic to service methods
*/

export class AuthController {
  async login(payload = {}) {
    // TODO: validate credentials and issue JWT
    return { token: null, user: { email: payload.email ?? null, role: 'GUEST' } };
  }

  async refreshToken(payload = {}) {
    // TODO: validate refresh token and issue a new access token
    return { token: null, refreshToken: payload.refreshToken ?? null };
  }

  async logout(payload = {}) {
    // TODO: invalidate refresh token or session metadata
    return { ok: true, payload };
  }
}
