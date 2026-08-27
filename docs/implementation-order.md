# Implementation Order

This document summarizes the recommended implementation sequence for the MPLADS Sentinel blueprint.

## Phase 1: Project setup
- Files: root README, .env.example, backend/package.json, frontend/package.json, ml-service/requirements.txt
- Dependencies: none
- Expected output: repository scaffolding and developer environment
- Completion criteria: all team members can run local environment and dependency installation

## Phase 2: PostgreSQL + Prisma
- Files: backend/prisma/schema.prisma, backend/src/config/prisma.ts, backend/src/config/env.ts
- Dependencies: PostgreSQL service
- Expected output: database schema and migration baseline
- Completion criteria: Prisma client generates successfully and schema relations are valid

## Phase 3: Data ingestion
- Files: data/official/*.py, data/synthetic/*.py, backend/src/services/project.service.ts, backend/src/repositories/project.repository.ts
- Dependencies: PostgreSQL and data-source rules
- Expected output: ingestion and validation pipeline definitions
- Completion criteria: official and synthetic sources can be normalized into the canonical format

## Phase 4: Backend APIs
- Files: backend/src/routes/*.ts, backend/src/controllers/*.ts, backend/src/validators/*.ts
- Dependencies: Prisma and services
- Expected output: REST API contracts and service orchestration
- Completion criteria: API routes exist for projects, alerts, analytics, and ML trigger endpoints

## Phase 5: Rule engine
- Files: backend/src/rules/*.ts, backend/src/services/analysis.service.ts
- Dependencies: PostgreSQL and project model
- Expected output: structured rule outputs for anomaly detection
- Completion criteria: rules operate independently from controllers and ML code

## Phase 6: ML feature engineering
- Files: ml-service/app/features/*.py, ml-service/app/schemas/*.py
- Dependencies: clean project data and feature schema
- Expected output: feature matrix for training and inference
- Completion criteria: feature names, definitions, and types match the model contract

## Phase 7: Isolation Forest
- Files: ml-service/app/models/*.py, training/train_isolation_forest.py
- Dependencies: feature engineering output
- Expected output: trained model artifact and version metadata
- Completion criteria: model version is persisted and can be loaded for prediction

## Phase 8: Risk engine
- Files: backend/src/services/risk.service.ts, backend/src/repositories/risk.repository.ts
- Dependencies: rules, ML output, alert data
- Expected output: explainable project risk scores
- Completion criteria: risk scores, reasons, and levels are persisted and retrievable

## Phase 9: Alerts
- Files: backend/src/services/alert.service.ts, backend/src/controllers/alert.controller.ts, backend/src/routes/alert.routes.ts
- Dependencies: risk engine and anomaly data
- Expected output: alert lifecycle management
- Completion criteria: alert statuses and resolution flows are available

## Phase 10: Frontend dashboard
- Files: frontend/src/pages/*.tsx, frontend/src/components/*.tsx, frontend/src/charts/*.tsx
- Dependencies: backend APIs
- Expected output: dashboard and detail pages for monitoring risk
- Completion criteria: all required metrics and charts are rendered for the MVP

## Phase 11: Integration
- Files: backend/src/services/ml-client.service.ts, frontend/src/services/*.ts
- Dependencies: backend + frontend + ML service
- Expected output: end-to-end operational data flow
- Completion criteria: project create/analyze/alert/dashboard cycle works

## Phase 12: Testing
- Files: backend/tests/**, ml-service/tests/**, frontend/src/**/*.test.*
- Dependencies: implementation-ready environment
- Expected output: regression coverage and verification suite
- Completion criteria: key user flows and API contracts pass

## Phase 13: Deployment
- Files: docker-compose.yml, .env.example, infra documentation
- Dependencies: stable application build
- Expected output: local and cloud deployment blueprint
- Completion criteria: environment variables and production config are documented

## Phase 14: Optional wow features
- Files: docs, additional spatial / AI summarization modules
- Dependencies: core MVP
- Expected output: high-value advanced monitoring features
- Completion criteria: optional enhancements do not block the MVP
