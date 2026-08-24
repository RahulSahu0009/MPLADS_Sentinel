/*
IMPLEMENTATION PROMPT
FILE: backend/src/middleware/auth.middleware.js
PURPOSE:
Validate JWTs and attach auth state to the request for protected routes.

PROJECT CONTEXT:
The platform includes multiple roles that determine access to project data, analytics, alerts, and admin functions.

TECHNOLOGIES:
Node.js, Express, JavaScript, JWT

INPUTS:
- Authorization header with bearer token

OUTPUTS:
- req.user object and access control flow

DEPENDENCIES:
- ../config/env.js
- ../services/auth.service.js

DATABASE DEPENDENCIES:
- User, Role

API DEPENDENCIES:
- JWT-bearing frontend requests

BUSINESS RULES:
- Reject invalid or expired tokens
- Support role-based access checks downstream from this middleware

ERROR HANDLING:
- Return 401 for invalid token and 403 for forbidden access

SECURITY REQUIREMENTS:
- Verify token signature and expiration before trusted access is granted

ACCEPTANCE CRITERIA:
- Protected routes cannot proceed without valid auth
- Request context contains user identity and role metadata

WHAT NOT TO CHANGE:
- Do not implement route-specific business logic here
- Do not trust unverified client-supplied role values

IMPLEMENTATION NOTES:
- Add reusable authorization helpers for role checks
*/

export const requireAuth = (req, res, next) => {
  // TODO: extract bearer token from Authorization header
  // TODO: verify JWT signature and expiration
  // TODO: attach req.user = { id, email, role } after verification
  req.user = req.user || { id: null, email: null, role: 'GUEST' };
  next();
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    // TODO: ensure req.user exists and role is included in allowedRoles
    const role = req.user?.role || 'GUEST';

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role permissions' });
    }

    next();
  };
};
