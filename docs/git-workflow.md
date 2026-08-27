# Git Workflow

## Branch Strategy

- main: protected branch for production-ready stable code
- develop: integration branch for all new development
- feature/frontend: frontend screens, hooks, services, UI logic
- feature/backend: API routes, controllers, middleware, core services
- feature/database: Prisma schema, migrations, repository layer
- feature/ml: ML service, feature engineering, model training
- feature/risk-engine: rules, duplicate detection, scoring, early warnings
- feature/integration: environment wiring, API integration, tests, deployment

## Merge Strategy

1. Each feature branch starts from `develop`
2. Keep PRs scoped to one ownership domain
3. Require code review and passing checks
4. Merge to `develop` only after relevant tests pass
5. Release from `develop` to `main` after UAT and regression checks

## Ownership Boundary

- Frontend work must not modify backend Prisma schema or Python model code
- Database changes must be reviewed by Member 3 and Member 2
- ML model changes must be reviewed by Member 4 and Member 5
- Risk logic changes require input from Member 5
- Integration changes require Member 6 review

## Suggested Commit Hygiene

- keep commits atomic
- include file-domain prefixes in branch names
- avoid mixing feature work with infrastructure edits unless they are tightly coupled
