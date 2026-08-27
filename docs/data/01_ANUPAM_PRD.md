# Anupam — PostgreSQL, Prisma & Repository PRD

## Project
AI-powered MPLADS Risk Monitoring Platform

## Owner
Anupam

## Role
PostgreSQL, Prisma schema, repositories, database configuration, official/synthetic data preparation and database-side validation.

## 1. Purpose

Build and maintain the PostgreSQL + Prisma data layer that provides a stable, validated and explainable data contract for the entire MPLADS monitoring system.

The platform analyzes MPLADS project and financial data to identify cost overruns, abnormal fund utilization, project delays, duplicate/overlapping works, compliance violations, statistical anomalies and other potential risks. The system must produce explainable risk signals and support alerts, dashboards and human investigation.

## 2. Scope of Anupam's Work

### In scope
- `backend/prisma/schema.prisma`
- PostgreSQL migration strategy and migration files
- `backend/src/config/prisma.js`
- Database-related environment/configuration coordination
- `backend/src/repositories/project.repository.js`
- `backend/src/repositories/risk.repository.js`
- `backend/src/repositories/alert.repository.js`
- `data/official`
- `data/synthetic`
- Seed/import guidance
- Repository method contracts and sample response objects
- Database validation and data-quality checks
- Provenance and audit data design

### Out of scope unless explicitly assigned
- Frontend pages/components
- Express controllers/routes
- Business rules owned by Rahil
- Python/FastAPI ML implementation owned by MJ
- Full integration/release ownership owned by Priyanka/Rahul

## 3. Project Constraints

- PostgreSQL + Prisma is the only database architecture.
- MongoDB must not be introduced.
- Frontend/backend remain JavaScript/JSX.
- ML service uses Python + FastAPI.
- Controllers call services; services call repositories or pure domain rules.
- Risk output must contain explainable evidence and must not automatically claim fraud.
- Never commit `.env`, credentials, tokens, private data, `node_modules`, `.venv` or generated build files.
- README.md is protected and must not be modified without team approval.

## 4. Business/Data Requirements

The database must support the data required for:

### Project analysis
- Project identity
- Work/project description
- State
- District
- Constituency
- Location
- Asset/work type
- Implementing agency
- Start date
- Expected completion date
- Actual completion date
- Status and progress

### Financial analysis
- Estimated cost
- Sanctioned cost
- Actual expenditure
- Available funds
- Utilization-related values

### Duplicate/overlap analysis
- Work description
- Location
- Cost
- Implementing agency
- Date
- Asset type

### Risk/ML support
The data layer must provide reliable values for features such as expenditure, sanctioned amount, estimated cost, fund utilization, duration, progress and historical deviation.

### Explainability/audit
Support storage/retrieval of risk snapshots, evidence, provenance and audit information required by the project architecture.

## 5. Objectives

1. Freeze an approved domain/data contract.
2. Build a normalized Prisma schema with correct relations and indexes.
3. Establish safe PostgreSQL/Prisma configuration.
4. Implement stable repository interfaces for project, risk and alert data.
5. Prepare representative official/synthetic data and import guidance.
6. Give Rahil stable repository contracts so services do not guess database behavior.
7. Give MJ representative clean data for ML features.
8. Give Priyanka data-quality cases and validation evidence.

## 6. Success Criteria

The work is successful when:

- The Prisma schema is approved by Rahul and Rahil.
- PostgreSQL starts and Prisma connects successfully.
- Migrations run successfully.
- Repository methods pass their validation tests.
- Financial values are handled with appropriate numeric precision.
- Required project, finance, progress, risk, alert, provenance and audit information is represented.
- Repository input/output contracts are documented.
- Synthetic scenarios cover normal, delayed, overrun, duplicate-candidate and incomplete projects.
- Rahil can build services without changing repository assumptions.
- Review findings are resolved before merge.

## 7. Key Dependencies

### Anupam depends on
- Rahil for rule/service field requirements
- Rahul for environment/configuration and API consistency
- MJ for ML feature/input requirements
- Priyanka for validation/data-quality requirements

### Team depends on Anupam
- Rahil depends on stable repository methods and return shapes.
- MJ depends on representative project/financial data.
- Priyanka depends on data validation and import assumptions.
- Rahul depends on coordinated database/environment configuration.

## 8. High-Level Data Flow

MPLADS Data
-> Data Processing
-> Feature Engineering
-> Rule Engine + Isolation Forest
-> Risk Engine
-> Risk Score + Alerts
-> Dashboard
-> High-Risk Cases
-> Human Investigation

## 9. Primary Deliverables

1. Approved data-field specification
2. `schema.prisma`
3. Prisma/PostgreSQL migrations
4. `prisma.js`
5. Coordinated database environment configuration
6. Project repository
7. Risk repository
8. Alert repository
9. Official-data validation
10. Synthetic data
11. Seed/import guidance
12. Repository contract documentation
13. Validation evidence
14. Handoff notes

## 10. Non-Goals

- Automatically declaring fraud from one anomaly
- Replacing PostgreSQL with MongoDB
- Building business logic inside repositories
- Putting ML training logic inside database or API handlers
- Silently renaming shared fields or routes

## 11. Approval Gates

### Gate 1 — Data Contract
Anupam + Rahul + Rahil agree on fields, relations, required/optional values and naming.

### Gate 2 — Schema
Rahul + Rahil approve the Prisma schema and migration strategy.

### Gate 3 — Repository Contract
Anupam + Rahil approve repository method names, parameters and return shapes.

### Gate 4 — Data Quality
Anupam + Priyanka validate official/synthetic data assumptions.

### Gate 5 — Integration
Anupam + Rahul + Rahil + MJ + Priyanka validate end-to-end data behavior.

## 12. Definition of Done

- Dependencies satisfied.
- Approved schema implemented.
- PostgreSQL and Prisma validated.
- Migrations validated.
- Repository methods validated.
- Financial numeric handling verified.
- Provenance/audit requirements addressed.
- Contracts documented.
- Required reviewers approve.
- No secrets or protected/unrelated files changed.
- PR merged into `develop`.
- Dependent branches rebase from latest `develop`.
