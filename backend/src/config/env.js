/*
IMPLEMENTATION PROMPT
FILE: backend/src/config/env.js
PURPOSE:
Load and validate environment variables for the Node.js Express backend.

PROJECT CONTEXT:
MPLADS Sentinel uses PostgreSQL, JWT auth, and a Python FastAPI ML service. The application must remain JavaScript-only and environment driven.

TECHNOLOGIES:
Node.js, Express, JavaScript, Prisma, JWT

INPUTS:
- process.env values from the host environment or .env file

OUTPUTS:
- A config object containing required runtime settings

DEPENDENCIES:
- Node.js environment variables

DATABASE DEPENDENCIES:
- PostgreSQL connection URL specified in DATABASE_URL

API DEPENDENCIES:
- ML_SERVICE_URL
- FRONTEND_ORIGIN

BUSINESS RULES:
- Production must fail fast on missing critical values
- Local dev may apply safe defaults only when explicitly acceptable

ERROR HANDLING:
- Throw clear startup errors for missing secrets or invalid runtime values

SECURITY REQUIREMENTS:
- Do not log secret values in plain text

ACCEPTANCE CRITERIA:
- The config object exposes the required keys used across the backend
- Startup fails clearly on invalid production config

WHAT NOT TO CHANGE:
- Do not hardcode production secrets
- Do not add TypeScript or TypeScript-only tooling

IMPLEMENTATION NOTES:
- Keep the file minimal and focused on runtime config
*/

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/mplads_sentinel',
  jwtSecret: process.env.JWT_SECRET ?? 'development-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  mlServiceUrl: process.env.ML_SERVICE_URL ?? 'http://localhost:8000',
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
};
