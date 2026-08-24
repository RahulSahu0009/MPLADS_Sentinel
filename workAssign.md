# MPLADS Sentinel Team Work Assignment

This document is the single source of truth for implementation ownership. It explains every team member's working directories, files, responsibilities, dependencies, handoffs, conflict risks, and merge order.

## Project Rules

- Frontend and backend code must remain JavaScript/JSX only.
- PostgreSQL with Prisma is the only database architecture.
- MongoDB must not be introduced.
- The ML service uses Python and FastAPI.
- Controllers call services; services call repositories or pure domain rules.
- Risk results must contain explainable evidence and must not automatically claim fraud.
- Never commit `.env`, credentials, tokens, private data, `node_modules`, `.venv`, or generated build files.
- `README.md` is protected and must not be modified without team approval.

## Team Summary

| Member | Primary responsibility | Final reviewer focus |
|---|---|---|
| You | Frontend/backend lead, contracts, authentication, configuration, documentation | Cross-module consistency |
| Arvind | Frontend pages, components, layouts, charts, and UI behavior | Usability and API consumption |
| Rahil | Backend services, controllers, routes, validators, rules, and risk engine | Domain correctness |
| Anupam | PostgreSQL, Prisma schema, repositories, and database configuration | Data integrity and query correctness |
| Priyanka | Integration, testing, QA, data validation, and release checks | End-to-end behavior |
| MJ | Python ML service, features, prediction, and training workflow | Model contract and reproducibility |

## You: Frontend and Backend Lead

### Working directories

- [frontend/src](frontend/src)
- [backend/src](backend/src)
- [docs](docs)
- Project root configuration

### Files and exact work

| File | Work to complete | Depends on | Handoff or review |
|---|---|---|---|
| [frontend/src/App.jsx](frontend/src/App.jsx) | Configure frontend routes, public pages, protected pages, and role-aware route structure | Auth and route contract | Arvind reviews page integration |
| [frontend/src/main.jsx](frontend/src/main.jsx) | Configure React entry point and global providers | App structure | Arvind verifies startup |
| [frontend/src/services/api.js](frontend/src/services/api.js) | Create one Axios client, base URL handling, token attachment, and common error behavior | Backend API and auth contract | Arvind consumes it; Rahil reviews contract |
| [frontend/src/services/dashboardService.js](frontend/src/services/dashboardService.js) | Implement dashboard, state, district, and risk-summary API methods | Analytics route contract | Arvind wires dashboards |
| [frontend/src/pages/LoginPage.jsx](frontend/src/pages/LoginPage.jsx) | Implement login form, validation, token/session handling, and error states | Auth API | Priyanka tests invalid and valid login |
| [frontend/src/pages/AdminPage.jsx](frontend/src/pages/AdminPage.jsx) | Implement role-protected administrative view | RBAC contract | Priyanka tests role restrictions |
| [backend/src/app.js](backend/src/app.js) | Configure Express middleware, health endpoint, route mounting, and error middleware | Route modules and environment | Rahil checks mounted domain routes |
| [backend/src/server.js](backend/src/server.js) | Start server using validated configuration and safe startup logging | App and environment | Anupam checks DB startup assumptions |
| [backend/src/config/env.js](backend/src/config/env.js) | Load, validate, and expose backend environment settings | `.env.example` | Anupam reviews database settings |
| [backend/src/middleware/auth.middleware.js](backend/src/middleware/auth.middleware.js) | Verify JWT signature/expiration and enforce allowed roles | Auth contract and JWT secret | Priyanka performs auth tests |
| [backend/src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js) | Delegate login, refresh, and logout to an auth service | Auth service and validators | Rahil reviews controller thinness |
| [backend/src/routes/auth.routes.js](backend/src/routes/auth.routes.js) | Define login, refresh, and logout endpoints | Auth controller | Priyanka tests HTTP behavior |
| [frontend/package.json](frontend/package.json) | Maintain frontend dependencies and scripts | Frontend needs | Priyanka checks reproducible install |
| [frontend/vite.config.js](frontend/vite.config.js) | Maintain Vite and React build configuration | Frontend structure | Arvind verifies build |
| [backend/package.json](backend/package.json) | Maintain backend dependencies and scripts | Backend implementation | Anupam checks Prisma commands |
| [docker-compose.yml](docker-compose.yml) | Coordinate PostgreSQL and local service configuration | Environment contracts | Priyanka validates startup |
| [.env.example](.env.example) | Document variable names without real secrets | All service configuration | Priyanka reviews completeness |
| [.gitignore](.gitignore) | Ignore secrets, dependencies, caches, builds, and local environments | Repository policy | Priyanka checks accidental-file protection |
| [docs](docs) | Maintain architecture, setup, API, and delivery documentation | Stable behavior | All leads review their sections |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Maintain setup, branch, validation, and PR instructions | Team workflow | All leads review |
| [assign.md](assign.md) | Maintain concise file coverage and assignment reference | Team ownership | All leads review |
| [workAssign.md](workAssign.md) | Maintain detailed ownership, dependency, and merge plan | Team feedback | All leads review |

### Deliverables

- Stable API request/response contracts
- Working Express bootstrap and authentication boundary
- Frontend API client and login integration
- Environment and local-development setup
- Updated technical documentation

### Dependencies and handoffs

- Receive schema and repository shapes from Anupam.
- Agree domain endpoint contracts with Rahil.
- Receive prediction payload contract from MJ.
- Give Arvind stable frontend API methods before real data wiring.
- Give Priyanka startup commands and expected health responses.

## Arvind: Frontend Developer

### Working directories

- [frontend/src/pages](frontend/src/pages)
- [frontend/src/components](frontend/src/components)
- [frontend/src/layouts](frontend/src/layouts)
- [frontend/src/charts](frontend/src/charts)
- [frontend/src/features](frontend/src/features)
- [frontend/src/hooks](frontend/src/hooks)
- [frontend/src/types](frontend/src/types)
- [frontend/src/utils](frontend/src/utils)

### Files and exact work

| File or directory | Work to complete | Depends on | Handoff or review |
|---|---|---|---|
| [frontend/src/pages/DashboardPage.jsx](frontend/src/pages/DashboardPage.jsx) | Build KPI cards, risk summary, charts, filters, loading, empty, and error states | Dashboard API contract | You reviews service usage |
| [frontend/src/pages/ProjectsPage.jsx](frontend/src/pages/ProjectsPage.jsx) | Build project list, search, filters, pagination, and navigation | Project list API | Priyanka tests filters and errors |
| [frontend/src/pages/ProjectDetailPage.jsx](frontend/src/pages/ProjectDetailPage.jsx) | Display project metadata, finance, progress, risk, anomalies, and analysis action | Project detail and risk APIs | Rahil validates displayed fields |
| [frontend/src/pages/AlertsPage.jsx](frontend/src/pages/AlertsPage.jsx) | Build alert queue, evidence view, and status update controls | Alert lifecycle API | Priyanka tests status flow |
| [frontend/src/pages/AnalyticsPage.jsx](frontend/src/pages/AnalyticsPage.jsx) | Build portfolio-level charts and summaries | Analytics API | You reviews payload mapping |
| [frontend/src/pages/StateAnalysisPage.jsx](frontend/src/pages/StateAnalysisPage.jsx) | Build state comparison and filtering view | State analytics API | Priyanka tests filter behavior |
| [frontend/src/pages/DistrictAnalysisPage.jsx](frontend/src/pages/DistrictAnalysisPage.jsx) | Build district comparison and risk view | District analytics API | Rahil validates domain labels |
| [frontend/src/components](frontend/src/components) | Create reusable tables, cards, badges, forms, feedback, and navigation components | App design | You reviews shared component API |
| [frontend/src/layouts](frontend/src/layouts) | Create authenticated layout, public layout, sidebar, and header | Route structure | You reviews protected layout |
| [frontend/src/charts](frontend/src/charts) | Create reusable chart components with safe empty and loading states | Analytics payloads | Priyanka checks rendering states |
| [frontend/src/features](frontend/src/features) | Organize feature-specific UI state and operations | Page boundaries | You reviews ownership boundaries |
| [frontend/src/hooks](frontend/src/hooks) | Add reusable data-loading or auth hooks where necessary | API client | Priyanka tests state transitions |
| [frontend/src/types](frontend/src/types) | Store JavaScript constants or documented data shapes only; do not add TypeScript | API contracts | You reviews no-TypeScript rule |
| [frontend/src/utils](frontend/src/utils) | Add date, amount, percentage, risk, and error formatting helpers | Domain display rules | Rahil validates risk labels |

### Deliverables

- Complete navigable frontend shell
- Dashboard, project, alert, and analytics workflows
- Responsive and reusable UI components
- Correct loading, empty, error, unauthorized, and forbidden states

### Dependencies and handoffs

- Fixture-based UI can proceed while backend work is pending.
- Real API wiring begins after You and Rahil approve endpoint shapes.
- Do not change shared API methods without coordinating with You.
- Report any missing backend field immediately to You and Rahil.

## Rahil: Backend and Risk Engine Lead

### Working directories

- [backend/src/services](backend/src/services)
- [backend/src/controllers](backend/src/controllers)
- [backend/src/routes](backend/src/routes)
- [backend/src/rules](backend/src/rules)
- [backend/src/validators](backend/src/validators)

### Files and exact work

| File | Work to complete | Depends on | Handoff or review |
|---|---|---|---|
| [backend/src/services/project.service.js](backend/src/services/project.service.js) | Normalize filters, enforce domain rules, call repository, and return project results | Repository contract | Anupam reviews repository usage |
| [backend/src/services/risk.service.js](backend/src/services/risk.service.js) | Calculate weighted score, risk level, reasons, evidence, and early-warning signals | Rule and ML contracts | You and Priyanka review output |
| [backend/src/services/analysis.service.js](backend/src/services/analysis.service.js) | Orchestrate project retrieval, rules, ML call, risk scoring, persistence, and alerts | Repositories, rules, ML client | Priyanka tests end-to-end flow |
| [backend/src/services/alert.service.js](backend/src/services/alert.service.js) | Create traceable alerts and enforce valid status transitions | Risk/anomaly contract | Anupam reviews persistence assumptions |
| [backend/src/controllers/project.controller.js](backend/src/controllers/project.controller.js) | Validate request context and delegate project operations | Project service | You reviews HTTP response shape |
| [backend/src/controllers/risk.controller.js](backend/src/controllers/risk.controller.js) | Delegate analysis and risk retrieval without domain logic | Risk/analysis services | Priyanka tests errors |
| [backend/src/controllers/alert.controller.js](backend/src/controllers/alert.controller.js) | Delegate alert listing and status updates | Alert service | You reviews status codes |
| [backend/src/controllers/analytics.controller.js](backend/src/controllers/analytics.controller.js) | Return stable chart-ready analytics responses | Analysis/repository contracts | Arvind consumes response |
| [backend/src/routes/project.routes.js](backend/src/routes/project.routes.js) | Define authenticated project endpoints and mutation roles | Controllers and auth middleware | You reviews route names |
| [backend/src/routes/risk.routes.js](backend/src/routes/risk.routes.js) | Define risk analysis and retrieval routes | Risk controller and validator | MJ checks ML trigger contract |
| [backend/src/routes/alert.routes.js](backend/src/routes/alert.routes.js) | Define alert list and status routes | Alert controller and RBAC | Priyanka tests lifecycle |
| [backend/src/routes/analytics.routes.js](backend/src/routes/analytics.routes.js) | Define dashboard, state, and district analytics routes | Analytics controller | Arvind wires frontend |
| [backend/src/rules/base-rule.js](backend/src/rules/base-rule.js) | Define common serializable result with ID, type, severity, message, evidence, values | Risk contract | Priyanka builds contract tests |
| [backend/src/rules/cost-overrun.rule.js](backend/src/rules/cost-overrun.rule.js) | Detect expenditure above sanctioned or approved thresholds | Base rule and financial fields | Anupam validates source fields |
| [backend/src/rules/delay.rule.js](backend/src/rules/delay.rule.js) | Detect schedule slippage and delayed status | Base rule and progress fields | MJ checks feature alignment |
| [backend/src/rules/utilization-anomaly.rule.js](backend/src/rules/utilization-anomaly.rule.js) | Detect abnormal utilization/progress combinations | Base rule and finance fields | Priyanka tests edge cases |
| [backend/src/rules/compliance-rule.js](backend/src/rules/compliance-rule.js) | Detect missing or inconsistent compliance indicators | Base rule and project data | Anupam checks available fields |
| [backend/src/rules/duplicate-rule.js](backend/src/rules/duplicate-rule.js) | Detect credible duplicate candidates using project metadata | Base rule and normalized records | MJ coordinates similarity features |
| [backend/src/validators/project.validator.js](backend/src/validators/project.validator.js) | Validate project filters and create/update payloads | Prisma field contract | You reviews API behavior |
| [backend/src/validators/risk.validator.js](backend/src/validators/risk.validator.js) | Validate project ID, analysis options, and thresholds | Risk contract | Priyanka tests malformed payloads |

### Deliverables

- Domain services separated from HTTP and persistence
- Complete rule engine with evidence
- Explainable risk and early-warning pipeline
- Project, risk, alert, and analytics API surfaces

### Dependencies and handoffs

- Do not finalize repository calls before Anupam confirms return shapes.
- Freeze endpoint names and response structures with You.
- Coordinate feature names and ML outputs with MJ.
- Give Arvind stable response examples before frontend integration.

## Anupam: PostgreSQL and Prisma Lead

### Working directories

- [backend/prisma](backend/prisma)
- [backend/src/repositories](backend/src/repositories)
- [backend/src/config](backend/src/config)
- [data](data)

### Files and exact work

| File or directory | Work to complete | Depends on | Handoff or review |
|---|---|---|---|
| [backend/prisma/schema.prisma](backend/prisma/schema.prisma) | Define normalized PostgreSQL models, relations, enums, indexes, provenance, and audit data | Domain requirements | You and Rahil approve contract |
| [backend/src/config/prisma.js](backend/src/config/prisma.js) | Initialize and export Prisma client with safe lifecycle handling | DATABASE_URL | You reviews environment integration |
| [backend/src/config/env.js](backend/src/config/env.js) | Review database-related settings with You | Environment plan | One coordinated PR only |
| [backend/src/repositories/project.repository.js](backend/src/repositories/project.repository.js) | Implement project filtering, pagination, details, create, and update queries | Final schema | Rahil integrates services |
| [backend/src/repositories/risk.repository.js](backend/src/repositories/risk.repository.js) | Persist and retrieve latest risk snapshots and evidence | Risk models | Rahil validates output shape |
| [backend/src/repositories/alert.repository.js](backend/src/repositories/alert.repository.js) | Persist, filter, and update alert records with project linkage | Alert models | Rahil integrates alert service |
| [data/official](data/official) | Validate official MPLADS columns, provenance, and import assumptions | Data contract | Priyanka checks quality |
| [data/synthetic](data/synthetic) | Prepare safe representative data for tests and demos | Schema and risk fields | MJ uses samples for ML |

### Deliverables

- Valid Prisma schema
- PostgreSQL migration strategy
- Stable repository method contracts
- Data import and seed guidance
- Correct numeric handling for financial values

### Dependencies and handoffs

- Confirm required fields with Rahil before migration.
- Provide sample repository response objects to You and Arvind.
- Coordinate schema changes before Rahil's service PR is merged.
- Never replace PostgreSQL with another database.

## Priyanka: Integration and Testing Lead

### Working directories

- [ml-service/tests](ml-service/tests)
- [data/official](data/official)
- [data/synthetic](data/synthetic)
- Backend integration-test area
- Frontend integration-test area
- [docs](docs)

### Files and exact work

| File or area | Work to complete | Depends on | Handoff or review |
|---|---|---|---|
| [ml-service/tests/test_predict_route.py](ml-service/tests/test_predict_route.py) | Test ML health, valid prediction, invalid payload, and response shape | MJ's API contract | MJ fixes ML defects |
| Backend integration tests | Test auth, roles, projects, risk, alerts, analytics, validation, and errors | Backend endpoints | You receives defect report |
| Frontend integration tests | Test navigation, login, API states, and role restrictions | Arvind's UI and You's client | Arvind fixes UI defects |
| ML integration checks | Validate backend request to Python response mapping | You and MJ's client contract | Rahil checks risk usage |
| [data/official](data/official) | Check required columns, nulls, ranges, and provenance | Anupam's schema | Anupam fixes import assumptions |
| [data/synthetic](data/synthetic) | Cover normal, delayed, overrun, duplicate, and incomplete projects | Rule and ML fields | Rahil/MJ review scenarios |
| [docs](docs) | Record test plan, defects, regression results, and release evidence | All module handoffs | You approves release status |

### Deliverables

- Test plan before integration
- Contract tests for ML and APIs
- End-to-end test report
- Regression and release sign-off
- Defect list with owner and severity

### Dependencies and handoffs

- Test contracts can be prepared before implementation.
- Execute full integration only after all services expose stable interfaces.
- Use real behavior and representative data, not incomplete mocks.
- Report blockers immediately to the relevant owner and You.

## MJ: Python and ML Lead

### Working directories

- [ml-service/app/api](ml-service/app/api)
- [ml-service/app/features](ml-service/app/features)
- [ml-service/app/models](ml-service/app/models)
- [ml-service/app/schemas](ml-service/app/schemas)
- [ml-service/app/services](ml-service/app/services)
- [ml-service/app/utils](ml-service/app/utils)
- [ml-service/training](ml-service/training)

### Files and exact work

| File or directory | Work to complete | Depends on | Handoff or review |
|---|---|---|---|
| [ml-service/app/api/__init__.py](ml-service/app/api/__init__.py) | Initialize the API package and exports | ML package layout | Priyanka checks import behavior |
| [ml-service/app/api/routes.py](ml-service/app/api/routes.py) | Expose health and prediction endpoints with validation | Schema and predictor | You connects backend client |
| [ml-service/app/features/feature_engineering.py](ml-service/app/features/feature_engineering.py) | Build deterministic, sanitized features from finance, progress, schedule, and delay data | Feature schema and data samples | Rahil maps features to risk |
| [ml-service/app/models/__init__.py](ml-service/app/models/__init__.py) | Organize model loading, artifact version, and fallback behavior | Training plan | Priyanka tests missing-artifact behavior |
| [ml-service/app/schemas/project_features.py](ml-service/app/schemas/project_features.py) | Validate project feature fields, ranges, and optional values | Backend payload contract | You and Priyanka approve schema |
| [ml-service/app/services/predictor.py](ml-service/app/services/predictor.py) | Return normalized anomaly score, prediction label, model version, and evidence-safe features | Feature engineering and model strategy | You maps response in Node |
| [ml-service/app/utils/helpers.py](ml-service/app/utils/helpers.py) | Add safe numeric, missing-value, and serialization helpers | Feature rules | Priyanka tests edge cases |
| [ml-service/training/README.md](ml-service/training/README.md) | Document training inputs, validation, artifacts, versioning, and limitations | Final ML design | Rahil reviews risk explanation |

### Deliverables

- Stable Pydantic input contract
- Deterministic feature vector
- FastAPI health and prediction endpoints
- Predictor response contract
- Training and model-version documentation

### Dependencies and handoffs

- Agree input/output JSON with You and Rahil before changing fields.
- Use representative data from Anupam and Priyanka.
- Provide endpoint examples to Priyanka for tests.
- Do not put training logic in API route handlers.

## Dependency Order

| Stage | Work | Owner(s) | Required output |
|---|---|---|---|
| 1 | Freeze domain fields and Prisma schema | Anupam, Rahil, You | Approved data contract |
| 2 | Configure PostgreSQL, Prisma, and environment | Anupam, You | Working DB/client configuration |
| 3 | Implement and validate repositories | Anupam | Stable persistence methods |
| 4 | Freeze backend, frontend, and ML API contracts | You, Rahil, MJ | Request/response examples |
| 5 | Implement authentication and RBAC | You | Protected-route behavior |
| 6 | Implement backend validators, rules, and services | Rahil | Domain analysis behavior |
| 7 | Implement ML schema, features, predictor, and routes | MJ | Working `/health` and `/predict` contract |
| 8 | Connect Node backend to Python ML service | You, MJ | Successful service-to-service call |
| 9 | Combine rule and ML signals into risk results | Rahil | Explainable risk score and reasons |
| 10 | Implement controllers and domain routes | Rahil | Usable backend API |
| 11 | Build frontend shell, pages, and real API wiring | You, Arvind | Usable frontend workflows |
| 12 | Run integration and regression testing | Priyanka | Test report and defect status |
| 13 | Fix review findings and finalize documentation | All owners, You | Approved implementation |
| 14 | Prepare presentation and demo | You, Rahil, MJ, Priyanka | Repeatable final demonstration |

## Work That Can Run in Parallel

- Anupam can design the schema while Rahil documents service and rule contracts.
- MJ can define ML schemas and feature engineering using agreed sample payloads.
- Arvind can build layouts, components, and fixture-based pages.
- Priyanka can prepare test cases and data-quality checks before integration.
- You can define API contracts, authentication, and local configuration while schema work proceeds.

Parallel work must stop and be rebased when a shared contract changes.

## Blocking Dependencies

- Repository implementation is blocked by the finalized Prisma schema.
- Backend services are blocked by repository method names and return shapes.
- Frontend real-data wiring is blocked by stable backend routes and response shapes.
- Risk scoring is blocked by both rule-result and ML-result contracts.
- Backend ML integration is blocked by the FastAPI payload contract.
- End-to-end testing is blocked until frontend, backend, database, and ML services run together.
- Presentation and release approval are blocked by unresolved critical integration defects.

## Pull Requests Most Likely to Conflict

| PRs | Files likely to overlap | Why conflict happens | Safe merge method |
|---|---|---|---|
| Anupam + Rahil | `schema.prisma`, repositories, services | Services assume fields or relation names that schema changes | Merge schema first; Rahil rebases and updates service calls |
| You + Anupam | `env.js`, `prisma.js`, `docker-compose.yml`, `.env.example` | Both change startup or database configuration | Coordinate one configuration PR and review together |
| You + Rahil | `app.js`, auth routes, route contracts | Bootstrap and domain route registration can overlap | You owns bootstrap/auth; Rahil owns domain routes |
| You + Arvind | `App.jsx`, `api.js`, `dashboardService.js`, route names | UI navigation and API methods change together | Freeze route names; Arvind consumes shared API methods |
| You + MJ | `ml-client.service.js`, Python schemas/routes | Request or response fields change independently | Approve JSON examples before either PR |
| Rahil + MJ | `analysis.service.js`, rules, feature names | Risk engine expects ML fields that are renamed | Use a versioned ML response contract |
| Rahil + Anupam | repositories and service orchestration | Query return shapes or transaction behavior differ | Repository PR merges before service PR |
| Priyanka + everyone | Tests and shared fixtures | Tests are edited while behavior is still changing | Prefer separate test files; merge feature PR before regression PR |
| Any member + docs owner | `docs/`, `assign.md`, `workAssign.md` | Several people edit the same tables or sections | One owner merges documentation changes |

## Shared File Protection

| Shared file | Primary owner | Required coordination |
|---|---|---|
| [backend/prisma/schema.prisma](backend/prisma/schema.prisma) | Anupam | Rahil and You approve field/relation changes |
| [backend/src/config/env.js](backend/src/config/env.js) | You | Anupam approves database variables |
| [backend/src/config/prisma.js](backend/src/config/prisma.js) | Anupam | You approves startup integration |
| [backend/src/app.js](backend/src/app.js) | You | Rahil approves domain route mounting |
| [frontend/src/App.jsx](frontend/src/App.jsx) | Arvind | You approves route and auth changes |
| [frontend/src/services/api.js](frontend/src/services/api.js) | You | Arvind and Priyanka validate consumer behavior |
| [docker-compose.yml](docker-compose.yml) | You | Anupam and Priyanka validate services |
| [.env.example](.env.example) | You | Never add real credentials |
| [docs](docs) | You | Domain owners provide updates for their sections |
| [README.md](README.md) | Protected | No changes without full-team approval |

## Safe Merge Sequence

1. Anupam opens the Prisma schema and PostgreSQL configuration PR.
2. You, Rahil, and Anupam review and merge the schema contract.
3. Anupam opens the repository PR; Rahil rebases after schema merge.
4. You opens the environment, Express bootstrap, and authentication PR.
5. Rahil opens validators, rules, and backend services PR.
6. Rahil opens controllers and domain routes PR.
7. MJ opens the ML schema, features, predictor, and FastAPI PR.
8. You and MJ open or merge the backend-to-ML integration PR after contract tests pass.
9. Rahil merges risk and analysis integration after rule and ML outputs are stable.
10. Arvind opens frontend layouts and page implementation PR.
11. You and Arvind merge API/auth wiring after backend endpoints are available.
12. Priyanka opens integration and regression testing PR.
13. The team fixes review findings and updates documentation.
14. The team rehearses the final demo and approves release to `main`.

After every prerequisite merge, dependent branches must update from the latest `develop` branch before continuing.

## Branch and Handoff Rules

- Use one focused branch per task or dependency group.
- Open pull requests into `develop`, not directly into `main`.
- Assign reviewers according to the ownership above.
- Every handoff must include changed files, input contract, output contract, validation command/result, limitations, and next dependent task.
- Do not silently rename API fields, database fields, routes, enums, or ML features.
- Keep commits small and avoid unrelated formatting changes.

## Definition of Done

A task is complete only when:

- Its dependencies are satisfied.
- Its implementation matches the assigned responsibility.
- Relevant tests or validation commands pass.
- Public API, database, or ML contracts are documented.
- The assigned reviewer approves the pull request.
- No TypeScript, MongoDB, secrets, or unrelated files are introduced.
- The change does not modify the protected README.
- The feature works in the integrated demo when applicable.

## Current Starting Point

The repository currently contains design scaffolds and implementation prompts. The recommended first tasks are:

1. Anupam: finalize and validate the Prisma schema.
2. You and Rahil: freeze API contracts.
3. MJ: freeze the ML request/response contract.
4. Arvind: build fixture-based layouts and pages.
5. Priyanka: prepare contract and integration tests.

Once these contracts are approved, implementation can proceed without team members guessing about ownership or changing each other's assumptions.
