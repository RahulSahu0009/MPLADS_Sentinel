# MPLADS Sentinel Team Assignment

This document is the execution plan for the current team. It assigns every major project area, identifies file ownership, and explains which work is blocked by another task.

## Team

| Member | Responsibility |
|---|---|
| You | Frontend and backend lead, API contracts, authentication, integration support |
| Arvind | Frontend UI and pages |
| Rahil | Backend services, controllers, routes, risk and rule engine |
| Anupam | PostgreSQL, Prisma schema, repositories, database configuration |
| Priyanka | Integration, testing, QA, ML integration validation |
| MJ | Python ML service, feature engineering, predictor, training workflow |

## Non-Negotiable Rules

- Frontend and backend code must remain JavaScript/JSX only.
- The database must remain PostgreSQL accessed through Prisma.
- MongoDB must not be introduced.
- The ML service remains Python/FastAPI and communicates with the backend through an API contract.
- Controllers must remain thin; database queries belong in repositories.
- Risk results must include understandable evidence and must not automatically claim fraud.
- `README.md` is protected and must not be modified as part of this work.

## Ownership Matrix

| Area | Primary owner | Supporting members | Reviewer |
|---|---|---|---|
| Frontend application shell and pages | Arvind | You | You |
| Frontend API and authentication client | You | Arvind | Rahil |
| Backend application bootstrap | You | Rahil | Anupam |
| Authentication and RBAC | You | Rahil, Anupam | Priyanka |
| PostgreSQL and Prisma | Anupam | You | Rahil |
| Backend repositories | Anupam | Rahil | You |
| Backend services | Rahil | You, Anupam | You |
| Controllers and routes | Rahil | You, Anupam | You |
| Rule engine | Rahil | You, MJ | Priyanka |
| Risk and analysis engine | Rahil | You, MJ, Anupam | Priyanka |
| Python ML service | MJ | Priyanka | You |
| Data preparation | MJ | Priyanka | Anupam |
| Integration and testing | Priyanka | Everyone | You |
| Documentation and presentation | You, Rahil | MJ, Priyanka | All leads |

## File and Folder Ownership

### You: frontend/backend lead

Own these files and folders:

- `frontend/src/App.jsx`
- `frontend/src/main.jsx`
- `frontend/src/services/api.js`
- `frontend/src/services/dashboardService.js`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/pages/AdminPage.jsx`
- `backend/src/app.js`
- `backend/src/server.js`
- `backend/src/config/env.js`
- `backend/src/middleware/auth.middleware.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/routes/auth.routes.js`
- `docs/`
- `docker-compose.yml`
- `.env.example`

Work to complete:

- Define stable frontend-to-backend API contracts.
- Configure the Express application and route mounting.
- Implement JWT authentication and role checks.
- Connect login state to protected frontend routes.
- Keep environment configuration consistent across services.
- Maintain architecture and setup documentation.

### Arvind: frontend implementation

Own these files and folders:

- `frontend/src/components/`
- `frontend/src/layouts/`
- `frontend/src/charts/`
- `frontend/src/pages/DashboardPage.jsx`
- `frontend/src/pages/ProjectsPage.jsx`
- `frontend/src/pages/ProjectDetailPage.jsx`
- `frontend/src/pages/AlertsPage.jsx`
- `frontend/src/pages/AnalyticsPage.jsx`
- `frontend/src/pages/StateAnalysisPage.jsx`
- `frontend/src/pages/DistrictAnalysisPage.jsx`

Work to complete:

- Build the shared layout, navigation, loading, empty, and error states.
- Build dashboard KPI and chart views.
- Build project list, filters, and project detail views.
- Build alert review and status display screens.
- Build analytics, state, and district screens.
- Consume only the API methods agreed with You.

### Rahil: backend domain lead

Own these files and folders:

- `backend/src/services/project.service.js`
- `backend/src/services/risk.service.js`
- `backend/src/services/analysis.service.js`
- `backend/src/services/alert.service.js`
- `backend/src/controllers/project.controller.js`
- `backend/src/controllers/risk.controller.js`
- `backend/src/controllers/alert.controller.js`
- `backend/src/controllers/analytics.controller.js`
- `backend/src/routes/project.routes.js`
- `backend/src/routes/risk.routes.js`
- `backend/src/routes/alert.routes.js`
- `backend/src/routes/analytics.routes.js`
- `backend/src/rules/`
- `docs/` backend sections

Work to complete:

- Implement project, risk, analysis, and alert orchestration.
- Implement cost-overrun, delay, utilization, compliance, and duplicate rules.
- Combine rule signals and ML signals into explainable risk results.
- Implement controllers that delegate to services.
- Define and expose project, risk, alert, and analytics routes.
- Enforce valid alert status transitions.

### Anupam: database and persistence lead

Own these files and folders:

- `backend/prisma/schema.prisma`
- `backend/src/config/prisma.js`
- `backend/src/repositories/project.repository.js`
- `backend/src/repositories/risk.repository.js`
- `backend/src/repositories/alert.repository.js`
- `backend/src/config/env.js` database settings
- `data/` database import support

Work to complete:

- Finalize PostgreSQL entities, relations, indexes, and constraints.
- Confirm project, financial, progress, risk, anomaly, alert, geography, user, and audit data models.
- Implement repository methods using Prisma only.
- Handle pagination, filtering, related records, and latest risk snapshots.
- Validate monetary and percentage fields with appropriate PostgreSQL types.
- Provide seed/import guidance for official and synthetic data.

### Priyanka: integration and QA lead

Own these files and folders:

- `ml-service/tests/`
- `backend` and `frontend` integration checks
- `data/official/` validation
- `data/synthetic/` validation
- Integration test documentation in `docs/`

Work to complete:

- Validate request and response contracts between all three services.
- Test authentication, authorization, projects, risk, alerts, and analytics.
- Test backend-to-ML prediction calls.
- Test frontend flows against backend responses.
- Verify error, empty, unauthorized, and forbidden states.
- Record defects and confirm fixes before final sign-off.

### MJ: Python and ML lead

Own these files and folders:

- `ml-service/app/api/routes.py`
- `ml-service/app/features/feature_engineering.py`
- `ml-service/app/models/`
- `ml-service/app/schemas/project_features.py`
- `ml-service/app/services/predictor.py`
- `ml-service/app/utils/helpers.py`
- `ml-service/training/`

Work to complete:

- Finalize the Pydantic project feature contract.
- Build deterministic feature engineering from project financial, progress, and schedule data.
- Implement the predictor service and normalized JSON output.
- Expose health and prediction endpoints through FastAPI.
- Define model artifact loading and versioning.
- Document training, validation, and inference workflow.
- Coordinate every payload change with You and Priyanka.

## Task Dependency Plan

## Complete File Coverage

The following files are also part of the assignment and must have an explicit owner:

| File | Owner | Reviewer | Responsibility |
|---|---|---|---|
| `frontend/package.json` | You | Priyanka | Frontend dependencies and scripts |
| `frontend/vite.config.js` | You | Arvind | Frontend build and development configuration |
| `backend/package.json` | You | Anupam | Backend dependencies and scripts |
| `ml-service/app/api/__init__.py` | MJ | Priyanka | ML API package initialization |
| `docs/git-workflow.md` | You | Rahil | Shared Git workflow documentation |
| `docs/implementation-order.md` | You | Rahil | Delivery sequence documentation |
| `docs/team-ownership.md` | You | All leads | Team ownership reference |
| `CONTRIBUTING.md` | You | All leads | Setup, contribution, and review rules |
| `assign.md` | You | All leads | Current task assignments and dependencies |
| `workAssign.md` | You | All leads | Detailed work allocation reference |
| `.gitignore` | You | Priyanka | Secret, build, and generated-file protection |
| `README.md` | Protected | No implementation owner | Must not be modified without team approval |

The currently empty folders `frontend/src/features`, `frontend/src/hooks`, `frontend/src/types`, `frontend/src/utils`, `backend/src/types`, `backend/src/utils`, `data/official`, and `data/synthetic` inherit ownership from their related module owners when files are added.

### File coverage result

Every currently existing project file is assigned above or in the owner sections before this plan. Empty folders are explicitly reserved for their related owners. New files must be added to this document or assigned in the pull request before implementation begins.

| ID | Task | Owner | Depends on | Can proceed further when |
|---|---|---|---|---|
| DB-01 | Finalize Prisma schema | Anupam | Existing architecture | Schema review passes |
| DB-02 | Configure PostgreSQL and Prisma client | Anupam, You | DB-01 | Database connection works |
| DB-03 | Implement repositories | Anupam | DB-02 | Repository queries return expected shapes |
| API-01 | Define backend API response contracts | You, Rahil | DB-01 | Frontend and ML payloads are agreed |
| BE-01 | Configure Express app and server | You | API-01 | Health endpoint responds |
| AUTH-01 | Implement JWT and RBAC | You | DB-02, BE-01 | Protected routes reject invalid access |
| BE-02 | Implement backend services | Rahil | DB-03, API-01 | Services can call repositories |
| RULE-01 | Define common rule result shape | Rahil, MJ | API-01 | All rules use the same result contract |
| RULE-02 | Implement individual risk rules | Rahil | RULE-01, DB-03 | Each rule returns evidence and severity |
| ML-01 | Finalize Pydantic feature schema | MJ | API-01 | Backend payload validates |
| ML-02 | Implement feature engineering | MJ | ML-01, data validation | Feature output is deterministic |
| ML-03 | Implement predictor and FastAPI route | MJ | ML-02 | `/predict` returns stable output |
| ML-04 | Connect backend ML client | You, MJ | ML-03, BE-02 | Node can call Python successfully |
| RISK-01 | Combine rules and ML output | Rahil | RULE-02, ML-04 | Risk score includes reasons and signals |
| BE-03 | Implement controllers and routes | Rahil | AUTH-01, BE-02, RISK-01 | API endpoints return domain responses |
| FE-01 | Build app shell and API client | You, Arvind | API-01, AUTH-01 | Frontend can authenticate and call API |
| FE-02 | Build dashboard and project pages | Arvind | FE-01, BE-03 | Pages render real API data |
| FE-03 | Build alerts and analytics pages | Arvind | FE-01, BE-03, RISK-01 | Review workflows are usable |
| INT-01 | Run cross-service integration | Priyanka | FE-02, FE-03, ML-04 | Main user journey works end to end |
| TEST-01 | Run regression and security checks | Priyanka | INT-01 | All critical defects are resolved |
| DOC-01 | Complete technical documentation | You, Rahil | Stable implementation | Docs match actual behavior |
| PRES-01 | Prepare presentation and demo | You, Rahil, MJ, Priyanka | INT-01, DOC-01 | Demo can run without manual fixes |

## What Can Run in Parallel

### Track A: Database

Anupam can work on the Prisma schema, PostgreSQL setup, and repository design. You and Rahil review model names and response shapes.

### Track B: ML service

MJ can work on the Pydantic schema, feature engineering, and predictor using agreed sample payloads. Priyanka can create route tests in parallel.

### Track C: Backend contracts

You and Rahil can define routes, status codes, authentication behavior, and response shapes while Anupam works on persistence.

### Track D: Frontend layout

Arvind can build page layouts, reusable components, charts, loading states, and empty states using temporary fixtures. Real API wiring waits for the API contract.

### Track E: Testing preparation

Priyanka can prepare test cases and integration checklists before implementation is complete, then execute them as each dependency becomes available.

## What Blocks Further Work

- Backend services are blocked by the finalized Prisma schema and repositories.
- Frontend API wiring is blocked by stable route and response contracts.
- Risk scoring is blocked by both the common rule output and ML prediction output.
- Backend ML integration is blocked by the FastAPI request/response contract.
- End-to-end testing is blocked until frontend, backend, database, and ML interfaces are connected.
- Presentation and final documentation are blocked until the integrated demo flow is stable.

## Recommended Execution Order

1. Anupam finalizes the Prisma schema and database contract.
2. You and Anupam configure PostgreSQL, Prisma, and environment values.
3. Anupam implements repositories.
4. You and Rahil finalize API, auth, and domain response contracts.
5. You implement Express bootstrap, authentication, and RBAC.
6. Rahil implements services, controllers, routes, and rule engine.
7. MJ finalizes the ML schema, features, predictor, and FastAPI routes.
8. You and MJ connect the backend ML client.
9. Rahil combines rule and ML signals into risk analysis.
10. Arvind and You connect the frontend and complete all pages.
11. Priyanka runs integration, API, ML, UI, and regression testing.
12. The team fixes review findings.
13. You, Rahil, MJ, and Priyanka complete documentation and presentation.

## Handoff Rules

- Every handoff must include the changed files, expected input shape, output shape, and a validation command.
- Do not silently change shared API fields. Announce contract changes to affected owners.
- A reviewer must check shared files before merging.
- A task is not complete when code merely parses; its acceptance criteria and behavior must be checked.
- Keep commits small and scoped to one task or dependency group.
- Use feature branches and merge into `develop` only after review.

## Definition of Done

A task is complete when:

- Its implementation matches the assigned responsibility.
- Its dependencies are satisfied.
- Its validation or tests pass.
- Its public contract is documented.
- The assigned reviewer approves it.
- It does not introduce TypeScript or MongoDB.
- It does not modify the protected `README.md`.

## Current Starting Point

The repository currently contains design scaffolds and implementation prompts. Begin with `DB-01`, `DB-02`, and `API-01`. Frontend fixture work and ML contract design may proceed in parallel, but production integration should wait for the shared contracts to be approved.
