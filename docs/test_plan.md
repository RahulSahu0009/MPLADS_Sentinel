# MPLADS Sentinel - Master Test Plan

## Overview
This document outlines the testing strategy, QA responsibilities, and data validation rules for the MPLADS Sentinel platform. It serves as the single source of truth for end-to-end quality assurance before any release to `main`.

**Owner**: Priyanka (Integration, testing, QA, data validation, release checks)

## 1. Testing Strategy

### 1.1 Contract-Driven Testing
Since the frontend, backend, and ML services are built in parallel, we rely on **Contract-Driven Testing**. 
- Backend tests will assert expected responses based on frozen API contracts.
- ML tests will assert the correct feature schema payload and prediction response shapes.
- Any change to the contract must be agreed upon by the cross-functional owners (Rahil, MJ, You).

### 1.2 Integration Testing
- **Backend API**: Endpoints tested via `Jest` and `Supertest` covering HTTP status codes, authentication constraints, input validation, and expected Prisma data shapes.
- **ML Service**: Tested via `pytest` and FastAPI's `TestClient` covering valid payloads, edge cases (missing features), and outlier bounds.
- **Data Validation**: `official` MoSPI data and `synthetic` scenarios tested against the Prisma schema to prevent malformed data ingestion.

### 1.3 End-to-End (E2E) Testing
Once all services expose stable interfaces:
- Frontend flows (Login, Admin restrictions, Project search, Risk dashboard, Alert lifecycle) will be tested against the live backend and ML pipeline.
- Validation includes ensuring a risk indicator triggered in the rule engine successfully routes through the DB and updates the React UI.

## 2. API Contract Assumptions

### Backend `Project` endpoints:
- `GET /api/projects`: Must support filtering (district, status, anomaly types) and return paginated data.
- `GET /api/projects/:id`: Must include relations to `FinancialRecord` and `ProgressRecord`.

### ML `Predict` endpoint:
- `POST /predict`:
  - **Input**: `ProjectFeatures` Pydantic model (budget, expenditure, duration, delay_days, cost_overrun_ratio, etc.).
  - **Output**: Anomaly score (float), boolean prediction flag, and feature attributions.

## 3. Data Validation Rules

### Official Data (`data/official`)
- Must contain all non-nullable Prisma fields (Title, SanctionedAmount, TotalExpenditure, Status).
- Financial fields must cleanly parse to PostgreSQL `DECIMAL`.
- Duplicate checks will run during ingestion based on external IDs or name similarity.

### Synthetic Data (`data/synthetic`)
- Diverse edge cases must be generated:
  - Normal, healthy projects (low risk).
  - Cost Overruns (high risk).
  - Delayed projects with low physical progress (high risk).
  - Incomplete/missing data scenarios (to test robust default behaviors).

## 4. Release Checklist (Definition of Done)
- [ ] Prisma migrations successfully applied locally.
- [ ] `npm test` passes for backend routes.
- [ ] `pytest ml-service/tests/` passes for the prediction service.
- [ ] No `.env` secrets or `console.log` leftovers found in commits.
- [ ] Full end-to-end integration verified using UI fixtures connecting to real endpoints.
- [ ] Defect list reviewed and signed off by module owners.
