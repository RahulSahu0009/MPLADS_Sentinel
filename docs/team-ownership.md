# Six-Member Ownership Matrix

## Member 1: Frontend
- Modules: dashboard, project pages, analytics UI, authentication screens
- Primary files: frontend/src/pages/**, frontend/src/components/**, frontend/src/charts/**
- Deliverables: dashboard, project details, alert UI, analytics charts
- Integration points: backend REST API and auth middleware

## Member 2: Backend
- Modules: Express API, routes, controllers, validation, service orchestration
- Primary files: backend/src/routes/**, backend/src/controllers/**, backend/src/services/**
- Deliverables: API contracts, application orchestration, middleware, error handling
- Integration points: Prisma, ML service, auth, rules engine

## Member 3: PostgreSQL + Prisma
- Modules: Prisma schema, migrations, seed scripts, query optimization, indexes
- Primary files: backend/prisma/schema.prisma, backend/src/repositories/**, backend/src/config/prisma.js
- Deliverables: normalized database and stable queries
- Integration points: backend, analytics, risk services

## Member 4: AI/ML
- Modules: feature engineering, training pipeline, model persistence, inference API
- Primary files: ml-service/app/**, ml-service/training/**
- Deliverables: feature schema, Isolation Forest model, prediction API
- Integration points: backend risk engine and analytics modules

## Member 5: Risk Engine + Analytics
- Modules: rule engine, risk scoring, duplicate detection, early warning, dashboard metrics
- Primary files: backend/src/rules/**, backend/src/services/risk.service.js, backend/src/services/analysis.service.js
- Deliverables: explainable risk engine and analytical outputs
- Integration points: ML service, PostgreSQL, alerts

## Member 6: Integration + Testing + DevOps
- Modules: integration flows, e2e tests, deployment, environment configuration
- Primary files: docker-compose.yml, .env.example, ml-service/tests/**, backend test files, frontend test files, docs/**
- Deliverables: CI/CD readiness, environment setup, release validation
- Integration points: all components

## Git workflow

- main: production-ready baseline
- develop: integration branch for feature merges
- feature/frontend, feature/backend, feature/database, feature/ml, feature/risk-engine, feature/integration

Each member should work only on their owned files to reduce merge conflicts.
