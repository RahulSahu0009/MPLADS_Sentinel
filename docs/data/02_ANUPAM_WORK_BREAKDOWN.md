# Anupam — Complete Work Breakdown

## Phase 0 — Repository Reconnaissance

### Tasks
- Inspect current repository structure.
- Identify existing Prisma files and backend scaffolds.
- Inspect current data files.
- Identify existing environment/configuration files.
- Check whether schema/repository stubs already exist.
- Record anything already implemented so work is not duplicated.

### Output
`ANUPAM_REPO_RECON.md`

## Phase 1 — Data Contract

### Tasks
- Extract all data fields required by the problem statement.
- Extract fields required by Rahil's services/rules.
- Extract fields required by MJ's feature engineering/ML contract.
- Extract fields needed by Priyanka's tests and data validation.
- Identify dashboard/query requirements affecting repository design.
- Mark each field as required, optional or future.
- Agree naming and ownership with Rahul and Rahil.

### Output
Approved data-field matrix.

## Phase 2 — Relationship Design

### Tasks
- Decide entity boundaries.
- Define primary keys.
- Define foreign keys and relation cardinality.
- Identify enums.
- Identify query-critical indexes.
- Define financial/numeric types.
- Define date/time handling.
- Define provenance and audit strategy.
- Define risk/evidence persistence strategy.

### Output
Schema design draft.

## Phase 3 — Schema Implementation

### File
`backend/prisma/schema.prisma`

### Tasks
- Implement normalized models.
- Implement relations.
- Add enums where appropriate.
- Add indexes.
- Add provenance/audit fields.
- Keep naming consistent with approved contract.
- Do not introduce MongoDB or TypeScript.

### Review
Rahul + Rahil.

## Phase 4 — PostgreSQL/Prisma Configuration

### Files
- `backend/src/config/prisma.js`
- Coordinated changes to `backend/src/config/env.js`
- `docker-compose.yml`
- `.env.example`

### Tasks
- Configure Prisma client lifecycle safely.
- Coordinate `DATABASE_URL` handling with Rahul.
- Validate PostgreSQL startup.
- Validate Prisma connection and client generation.
- Keep secrets out of version control.

### Review
Rahul + Priyanka as applicable.

## Phase 5 — Migration

### Tasks
- Generate migration.
- Review migration SQL.
- Apply migration locally.
- Verify relations/indexes.
- Re-run migration from clean database where practical.
- Document migration commands.

### Output
Stable PostgreSQL migration strategy.

## Phase 6 — Project Repository

### File
`backend/src/repositories/project.repository.js`

### Responsibilities
- Project filtering.
- Pagination.
- Project details.
- Create.
- Update.
- Required project retrieval methods.
- Query behavior that services depend on.

### Review
Rahil.

## Phase 7 — Risk Repository

### File
`backend/src/repositories/risk.repository.js`

### Responsibilities
- Persist risk snapshots.
- Retrieve latest risk snapshots.
- Persist/retrieve explainable evidence.
- Keep project linkage correct.

### Review
Rahil.

## Phase 8 — Alert Repository

### File
`backend/src/repositories/alert.repository.js`

### Responsibilities
- Persist alerts.
- Filter alerts.
- Update alert records.
- Maintain project linkage.
- Support valid lifecycle/state changes expected by the alert service.

### Review
Rahil.

## Phase 9 — Official Data

### Directory
`data/official`

### Tasks
- Verify required columns.
- Check nulls.
- Check numeric/date ranges.
- Record provenance.
- Document import assumptions.
- Identify data-quality issues.
- Never mislabel synthetic data as official.

### Review
Priyanka.

## Phase 10 — Synthetic Data

### Directory
`data/synthetic`

### Required scenarios
- Normal project.
- Delayed project.
- Cost-overrun project.
- Duplicate/overlap candidate.
- Incomplete project.

### Additional useful scenario
- Unusual fund-utilization project.

### Review
Priyanka + Rahil + MJ as applicable.

## Phase 11 — Repository Contract Documentation

For every repository method document:

- Method name
- Purpose
- Inputs
- Optional/required parameters
- Return shape
- Not-found behavior
- Filtering behavior
- Pagination behavior
- Transaction behavior
- Validation/error behavior
- Example response

### Output
Repository contract document for Rahil.

## Phase 12 — Team Handoffs

### To Rahil
- Approved schema.
- Repository methods.
- Exact return shapes.
- Query limitations.
- Migration status.

### To Rahul
- DB configuration assumptions.
- Environment variables.
- Prisma startup behavior.
- Shared-file changes.

### To MJ
- Representative project/financial data.
- ML-relevant source fields.
- Data cleaning assumptions.

### To Priyanka
- Data validation rules.
- Synthetic scenarios.
- Import assumptions.
- Migration/test commands.

## Phase 13 — Integration Validation

Validate:

Database
-> Repository
-> Service
-> Rule Engine
-> ML
-> Risk Engine
-> Alert
-> API
-> Dashboard

Focus on whether field names and meanings remain stable across layers.

## Phase 14 — Finalization

- Fix review findings.
- Re-run validation.
- Update contract documentation.
- Verify branches are rebased after prerequisite merges.
- Prepare demo-ready sample data.
- Confirm Definition of Done.
