/*
IMPLEMENTATION PROMPT
FILE: backend/src/config/prisma.js
PURPOSE:
Create and expose a singleton Prisma client for the backend services and repositories.

PROJECT CONTEXT:
The application uses PostgreSQL as its canonical store for projects, anomalies, alerts, risks, and audit trails.

TECHNOLOGIES:
Node.js, Express, JavaScript, Prisma, PostgreSQL

INPUTS:
- Prisma client generated from backend/prisma/schema.prisma

OUTPUTS:
- Shared `prisma` client instance used across the backend

DEPENDENCIES:
- @prisma/client
- ./env.js

DATABASE DEPENDENCIES:
- PostgreSQL database configured in DATABASE_URL

API DEPENDENCIES:
- None directly; services and repositories consume the client

BUSINESS RULES:
- Keep a single client instance to avoid connection churn

ERROR HANDLING:
- Log initialization failures and avoid silent fallback behavior

SECURITY REQUIREMENTS:
- Never expose DB credentials to client code

ACCEPTANCE CRITERIA:
- Prisma client exists as a shared singleton
- Database connection lifecycle is centralized

WHAT NOT TO CHANGE:
- Do not switch to MongoDB or direct SQL access for core app logic

IMPLEMENTATION NOTES:
- Keep this file lightweight and focused on client setup
*/

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
