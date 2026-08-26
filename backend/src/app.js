/*
IMPLEMENTATION PROMPT
FILE: backend/src/app.js
PURPOSE:
Configure the Express application, global middleware, route registration, and centralized error handling.

PROJECT CONTEXT:
This is the Node/Express API layer for MPLADS Sentinel, serving dashboard, analytics, risk, project, and auth workflows.

TECHNOLOGIES:
Node.js, Express, JavaScript, CORS, JWT

INPUTS:
- Environment configuration
- Route modules
- Middleware modules

OUTPUTS:
- Express app instance ready to start from server.js

DEPENDENCIES:
- ./config/env.js
- ./routes/*.js
- ./middleware/*.js

DATABASE DEPENDENCIES:
- Prisma via ./config/prisma.js

API DEPENDENCIES:
- Frontend origin configuration for CORS

BUSINESS RULES:
- All API routes should be mounted under /api
- Auth middleware must protect sensitive endpoints

ERROR HANDLING:
- Use centralized error middleware with structured JSON responses

SECURITY REQUIREMENTS:
- Restrict CORS in production and validate incoming body sizes

ACCEPTANCE CRITERIA:
- App boots cleanly and exposes routes and health endpoint
- Global middleware is consistent and environment-aware

WHAT NOT TO CHANGE:
- Do not couple app configuration with business logic
- Do not add TypeScript syntax or dependencies

IMPLEMENTATION NOTES:
- Keep route mounting explicit and modular
*/

import express from 'express';
import cors from 'cors';
import { projectRouter } from './routes/project.routes.js';
import { alertRouter } from './routes/alert.routes.js';
import { analyticsRouter } from './routes/analytics.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { riskRouter } from './routes/risk.routes.js';

export const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mplads-sentinel-backend' });
});

app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/alerts', alertRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/risk', riskRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    issues: err.issues || undefined,
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});
