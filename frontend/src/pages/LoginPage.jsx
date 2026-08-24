/*
IMPLEMENTATION PROMPT
FILE: frontend/src/pages/LoginPage.jsx
PURPOSE:
Implement the authentication screen for MPLADS Sentinel. This page allows the relevant roles to log in and receive a token-based session.

PROJECT CONTEXT:
Different stakeholder groups access different parts of the platform. The login view should support secure JWT-based authentication and role-aware user flows.

TECHNOLOGIES:
React, Axios, Tailwind CSS

INPUTS:
- Email and password from user input
- Backend auth endpoint result

OUTPUTS:
- Token storage and redirect to authorized page

DEPENDENCIES:
- services/authService.js
- hooks/useAuth.js

DATABASE DEPENDENCIES:
- None directly

API DEPENDENCIES:
- POST /api/auth/login

BUSINESS RULES:
- If authentication fails, show a clear error message
- Token storage must follow the chosen security pattern

ERROR HANDLING:
- Handle network issues, invalid credentials, and missing API responses gracefully

SECURITY REQUIREMENTS:
- Do not persist secrets in localStorage unless explicitly approved by project security design
- Protect routes after login

ACCEPTANCE CRITERIA:
- Users can sign in and access the right dashboard view
- The interface is consistent with the rest of the app and includes role-aware redirection

WHAT NOT TO CHANGE:
- Do not implement raw JWT validation in the frontend UI
- Do not add authentication business logic to other pages

IMPLEMENTATION NOTES:
- Keep auth UI simple and standard for a secure enterprise app
*/

export default function LoginPage() {
  return <div>Login page pending implementation</div>;
}
