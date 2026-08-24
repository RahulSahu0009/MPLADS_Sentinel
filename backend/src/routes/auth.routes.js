/*
IMPLEMENTATION PROMPT
FILE: backend/src/routes/auth.routes.js
PURPOSE:
Expose authentication endpoints for login and token-based access.

PROJECT CONTEXT:
Role-based access to the MPLADS Sentinel platform requires secure authentication and authorization.

TECHNOLOGIES:
Express, JavaScript, JWT

INPUTS:
- Login credentials and optional refresh payload

OUTPUTS:
- JWT token and user session metadata

DEPENDENCIES:
- ../controllers/auth.controller.js
- ../validators/auth.validator.js
- ../middleware/auth.middleware.js

DATABASE DEPENDENCIES:
- User, Role

API DEPENDENCIES:
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

BUSINESS RULES:
- Passwords must be verified against hashed records only
- Role metadata must be encoded in the JWT payload

ERROR HANDLING:
- Return 401 for invalid credentials, 400 for malformed input

SECURITY REQUIREMENTS:
- Use environment-based secret management and never expose raw credentials

ACCEPTANCE CRITERIA:
- Login route returns a valid JWT for recognized users
- Protected routes enforce token validation

WHAT NOT TO CHANGE:
- Do not implement auth logic in the route file

IMPLEMENTATION NOTES:
- Keep auth flows logically distinct from project and risk logic
*/

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';

export const authRouter = Router();
const controller = new AuthController();

authRouter.post('/login', async (req, res) => {
  const result = await controller.login(req.body);
  res.json(result);
});

authRouter.post('/refresh', async (req, res) => {
  const result = await controller.refreshToken(req.body);
  res.json(result);
});

authRouter.post('/logout', async (req, res) => {
  const result = await controller.logout(req.body);
  res.json(result);
});
