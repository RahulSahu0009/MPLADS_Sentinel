# MPLADS Sentinel

## Overview

MPLADS Sentinel is a design and implementation blueprint for an AI-powered monitoring and anomaly-detection platform for the Members of Parliament Local Area Development Scheme (MPLADS). The repository is intentionally a BLUEPRINT repository: it defines the production architecture, module boundaries, database schema, ML design, API contracts, and file-level implementation prompts. No production business logic is implemented here.

## Problem Statement

The scheme involves large-scale public funds, multiple agencies, project execution bodies, and district/state administrative layers. The platform must help stakeholders identify trends, irregularities, duplicate works, delayed execution, unusual expenditure patterns, and compliance deviations without automatically labeling a project as fraudulent.

This solution distinguishes between:

- `data_source = OFFICIAL_MPLADS` for official MoSPI data
- `data_source = SYNTHETIC_DEMO` for generated demonstration data

## Architectural Summary

The system is a practical three-layer architecture:

1. Frontend: React + Vite + Tailwind CSS for dashboards, project views, risk screens, and alerts.
2. Backend: Node.js + Express + TypeScript + Prisma for APIs, orchestration, validations, rules, and persistence.
3. ML Service: Python + FastAPI + scikit-learn + Isolation Forest for feature engineering and anomaly scoring.

Core flow:

Official data or synthetic demo data -> ingestion/validation/normalization -> PostgreSQL persistence -> feature engineering -> rule engine + ML anomaly detection -> risk engine -> alerts + dashboard.

## System Architecture

```text
Users
  |
  v
React Frontend (Vite + Tailwind)
  |
  v
Node.js + Express API
  |----------------------------|
  |                            |
  v                            v
PostgreSQL (Prisma)         Python FastAPI
  |                            |
  |                    ML Feature Pipeline
  |                            |
  |                       Isolation Forest
  |                            |
  +------------> Rule Engine + Risk Engine + Alerts
                              |
                              +--> Dashboard / Reporting / Project Details
```

## Must-Have Modules

- Data ingestion
- Data normalization
- Data validation
- PostgreSQL persistence
- Project management
- Financial analysis
- Progress monitoring
- Rule engine
- Feature engineering
- ML anomaly detection
- Duplicate detection
- Risk scoring
- Alert generation
- Early warning
- Analytics
- Dashboard
- Project details
- Authentication and RBAC
- Audit logging
- Reporting
- Data provenance

## Should-Have Modules

- GIS/geo-aware analysis
- Comparative peer benchmarking
- Alert triage workflows
- Download/export reports
- Role-based dashboard personalization

## Optional / Wow Modules

- PostGIS spatial analysis
- Gemini API assisted summarization
- Advanced benchmarking
- Natural-language explanation layer

## Data Model Principles

- Financial values stored as PostgreSQL `DECIMAL` / `NUMERIC`
- Data source explicitly marked as `OFFICIAL_MPLADS` or `SYNTHETIC_DEMO`
- Every project must remain traceable to source and provenance metadata
- No inference that a project is fraudulent without supporting evidence and review

## ML Architecture

- Primary model: Isolation Forest
- Why: labeled fraud data is incomplete and sparse in this domain
- Training pipeline: data cleaning -> feature engineering -> validation -> model training -> versioning -> persistence
- Inference pipeline: same feature schema -> score -> anomaly metadata -> risk scoring
- Model versioning using model metadata and feature schema hash

## Rule Engine

A dedicated rule layer produces structured anomaly outputs with:

- `rule_id`
- `anomaly_type`
- `severity`
- `message`
- `evidence`
- `relevant_values`

Rules are kept separate from controllers, Prisma code, ML code, and frontend logic.

## Risk Engine

The risk engine combines:

- rule violations
- ML anomaly score
- cost deviation
- delay signals
- duplicate indicators
- compliance issues

and outputs:

- `risk_score` from 0 to 100
- `risk_level` in LOW / MEDIUM / HIGH / CRITICAL
- `reasons`
- `contributing_signals`
- `model_version`
- `calculated_at`

## Alert Architecture

Alerts carry:

- `alert_id`
- `project_id`
- `anomaly_type`
- `severity`
- `risk_score`
- `message`
- `status`
- `created_at`
- `resolved_at`

Statuses: `OPEN`, `UNDER_REVIEW`, `RESOLVED`, `FALSE_POSITIVE`

## Database Architecture

The canonical database is PostgreSQL using Prisma ORM. Core entities include:

- User
- Role
- State
- District
- Constituency
- MP
- Agency
- Project
- FinancialRecord
- ProgressRecord
- Anomaly
- RiskScore
- Alert
- AuditLog
- DataSource
- AggregateStatistic

Normalization and indexing are designed for analytical filtering and role-based access.

## API Architecture

The backend exposes REST APIs such as:

- GET /api/projects
- GET /api/projects/:id
- POST /api/projects
- POST /api/projects/:id/analyze
- GET /api/projects/:id/anomalies
- GET /api/projects/:id/risk
- GET /api/alerts
- PATCH /api/alerts/:id/status
- GET /api/dashboard/stats
- GET /api/analytics/state
- GET /api/analytics/district
- POST /api/risk/analyze
- POST /api/ml/predict

## Frontend Architecture

The frontend is organized into dashboards and role-aware views:

- Dashboard
- Projects
- Project Details
- Alerts
- Analytics
- State Analysis
- District Analysis
- Login
- Optional Admin

## Security

- JWT authentication for API access
- Role-based access control with Admin, Ministry Authority, State Authority, District Authority, and Analyst roles
- Protected routes enforced via middleware
- Authorization checked at controller/service layer
- Audit logging for sensitive actions

## Deployment

Suggested production deployment pattern:

- Frontend: Vercel or static hosting for SPA
- Backend: Render, Railway, or similar Node/Express host
- PostgreSQL: managed PostgreSQL provider
- ML service: containerized FastAPI deployment
- Environments: development, staging, production

## Testing

- Unit tests for validation and services
- API integration tests
- Database migration tests
- ML feature and inference tests
- Frontend component and dashboard tests
- End-to-end workflow tests covering project analysis to alert generation

## Development Workflow

Primary branches:

- main
- develop
- feature/frontend
- feature/backend
- feature/database
- feature/ml
- feature/risk-engine
- feature/integration

## Implementation Order

1. Project setup
2. PostgreSQL + Prisma
3. Data ingestion
4. Backend APIs
5. Rule engine
6. ML feature engineering
7. Isolation Forest
8. Risk engine
9. Alerts
10. Frontend dashboard
11. Integration
12. Testing
13. Deployment
14. Optional wow features

## Repository Status

This repository is a blueprint-only design repository. Future implementation work should read the embedded prompts in the relevant files and implement the code in the same structure.

## Files and Ownership

The repository is intentionally split so six team members can work in parallel:

- Member 1: Frontend
- Member 2: Backend
- Member 3: PostgreSQL + Prisma
- Member 4: AI/ML
- Member 5: Risk Engine + Analytics
- Member 6: Integration + Testing + DevOps

## Notes

- MongoDB is explicitly not used.
- The platform does not claim fraud automatically; it surfaces risk indicators and evidence.
- Synthetic demo data is clearly labeled and must never be mistaken for official government data.
- The system is designed for a hackathon-level MVP with practical data quality controls and explainable outputs.
