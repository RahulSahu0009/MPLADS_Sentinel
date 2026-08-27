MPLADS Sentinel — Cross-team Codebase Guide

Purpose

This guide provides a concise, practical handoff for frontend, backend, and ML engineers working on MPLADS Sentinel. It explains repository layout, how to get the system running locally, database/migrations/seeding, API contract touchpoints, ML integration points, and an onboarding checklist for the next developer.

Quick links

- Prisma schema: backend/prisma/schema.prisma
- Initial migration SQL: backend/prisma/migrations/0001_init/migration.sql
- Backend entrypoint: backend/src/server.js
- Express app and error handling: backend/src/app.js
- Repositories (DB access): backend/src/repositories/
- Services (domain logic): backend/src/services/
- Controllers: backend/src/controllers/
- Routes: backend/src/routes/
- Validators (Zod): backend/src/validators/
- Sample data: data/official/official_sample.csv and data/synthetic/synthetic_scenarios.csv

Repository layout (high level)

- backend/: Express API server, Prisma client, business logic and routes
  - src/config: runtime config and Prisma client singleton
  - src/lib: shared helpers (async handler, http error, pagination)
  - src/constants: RBAC and shared enums
  - src/repositories: thin persistence layer that returns plain JS objects to services
  - src/services: domain orchestration (risk scoring, alert lifecycle, ML client wiring)
  - src/controllers: adapter between services and HTTP layer
  - src/routes: request validation, auth middleware usage, and router definitions
  - prisma/: schema and migrations
- data/: sample CSVs and README to drive seeding or feature engineering
- docs/: architecture notes, repository contracts, guides

Local quickstart (developer)

1. Ensure Docker is installed.
2. Copy .env.example -> .env and set DATABASE_URL and JWT_SECRET. (Production: do NOT use defaults.)
3. Start Postgres: docker-compose up -d postgres
4. From backend/: npm install
5. Generate Prisma client: npx prisma generate
6. Apply migration: npx prisma migrate deploy  (or run the migration SQL in backend/prisma/migrations/0001_init/migration.sql)
7. Seed initial data (a quick script or psql import using CSVs in data/). There is no automated seeder yet — use the CSVs in data/synthetic for local testing.
8. Run backend in dev: npm run dev
9. Smoke test: curl http://localhost:4000/health and GET /api/projects

Environment variables (most important)

- DATABASE_URL: Postgres connection string (required in production)
- PORT: server port (defaults to 4000)
- JWT_SECRET: HMAC secret for JWT tokens (required in production)
- ML_SERVICE_URL: URL of the external ML scoring service
- FRONTEND_ORIGIN: frontend host for CORS

Auth and RBAC

- Auth middleware is implemented but uses a placeholder for role extraction. Implement a JWT verification in backend/src/middleware/auth.middleware.js and map token claims to req.user with role values.
- Role constants are in backend/src/constants/rbac.js. Use WRITE_ROLES for mutation endpoints that require elevated privileges.

Database, migrations, and seeding

- Prisma schema is authoritative: backend/prisma/schema.prisma.
- An initial SQL migration exists at backend/prisma/migrations/0001_init/migration.sql — apply via npx prisma migrate deploy or psql.
- Add a seed script (recommended) to import CSVs from data/synthetic/ and data/official/ into the DB for local and CI tests.

ML Integration points

- Services should call backend/src/services/ml-client.service.js (placeholder) to send features and receive model results.
- RiskService (backend/src/services/risk.service.js) merges rule-based scores with ML signals. The ML contract must provide: modelScore (0-100), explainability metadata, and confidence.
- Define and freeze the ML API schema before production integration. The repo currently defaults to a basic weighting (60% rules / 40% ML) — this is configurable in RiskService.

Testing and CI

- There are no tests yet. Add unit tests for repositories and services, and integration tests that run against a disposable Postgres (Docker) instance.
- Suggested targets:
  - unit: repository methods and risk scoring logic
  - integration: start server and call key endpoints against a seeded DB

Handoff checklist for next backend engineer

- Implement robust JWT middleware and integrate with the frontend's auth provider.
- Harden env.js to fail fast on missing production secrets (partial helper exists already).
- Add a database seed script and integrate it into CI (or use prisma db seed pattern).
- Finalize ML service contract and implement ml-client.service.js with retries and timeouts.
- Add tests and a GitHub Actions workflow to run unit + integration tests.
- Review and merge the branch: feature/database-anupam-kickoff (includes Prisma schema and repository wiring).

Handoff checklist for frontend engineer

- Confirm API shapes in docs/data/ANUPAM_REPOSITORY_METHOD_CONTRACTS.md and adjust frontend service layer accordingly.
- For mutation endpoints, ensure the client sends an Authorization header with a JWT containing a role claim (e.g., { role: 'ADMIN' }).
- Implement pagination parameters per backend/src/lib/pagination.js conventions.

Handoff checklist for ML engineer

- Provide an OpenAPI or JSON schema for the ML endpoint including example request/response.
- Ensure the model returns modelScore (0-100), confidence, and a minimal explanation object (list of top features and their contributions).
- Work with backend to add a test ML container to docker-compose for local testing.

Operational notes

- For production, do not run Prisma in development pooling mode without connection pooling (PGBouncer) — consider Prisma Data Proxy or pgbouncer for serverless deployments.
- Monitor DB connection counts when scaling workers.

Where to start (recommended minimal path)

1. Make sure CI runs a DB (Docker) and seeds data for tests.
2. Implement JWT middleware and add a smoke test requiring auth.
3. Finalize ML contract and implement the ML client.
4. Add seed scripts and at least one integration test that covers POST /api/projects and POST /api/risk/analyze.

Contact

For implementation context ask the author of the feature branch: Anupam (check Git history) or the repository owner. This document will be updated as the ML contract and auth choices are finalized.
