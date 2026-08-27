# Anupam — Reviews, Collaboration and Handoffs

## 1. Review Calendar/Sequence

### Review 1 — Data Contract Review

**Participants:** Anupam, Rahul, Rahil

**Agenda:**
- Project fields
- Finance fields
- Progress/timeline fields
- Geographic fields
- Duplicate-analysis fields
- Risk/evidence fields
- Provenance/audit fields
- Required vs optional values
- Naming

**Exit condition:** Approved field/relation contract.

### Review 2 — ML Data Review

**Participants:** Anupam, MJ, Rahil, Rahul as needed

**Agenda:**
- ML input features
- Numeric fields
- Missing values
- Feature source fields
- Sample payloads
- Versioning/field stability

**Exit condition:** Stable data inputs for MJ.

### Review 3 — Prisma Schema Review

**Participants:** Anupam, Rahul, Rahil

**Agenda:**
- `schema.prisma`
- Relations
- Indexes
- Enums
- Numeric types
- Provenance/audit
- Risk/evidence persistence
- Migration strategy

**Exit condition:** Schema approved.

### Review 4 — PostgreSQL/Config Review

**Participants:** Anupam, Rahul, Priyanka

**Agenda:**
- `prisma.js`
- `DATABASE_URL`
- `env.js`
- `docker-compose.yml`
- `.env.example`
- Startup behavior

**Exit condition:** One agreed DB/configuration approach.

### Review 5 — Repository Contract Review

**Participants:** Anupam, Rahil

**Agenda:**
- Method names
- Parameters
- Query behavior
- Return shapes
- Pagination
- Error behavior
- Transactions
- Risk snapshot/evidence behavior
- Alert persistence behavior

**Exit condition:** Rahil accepts repository contract.

### Review 6 — Data Quality Review

**Participants:** Anupam, Priyanka

**Agenda:**
- Official columns
- Nulls
- Ranges
- Dates
- Financial values
- Provenance
- Import assumptions
- Synthetic scenarios

**Exit condition:** QA accepts dataset assumptions.

### Review 7 — Integration Review

**Participants:** Anupam, Rahul, Rahil, MJ, Priyanka

**Agenda:**
- DB migration
- Repository calls
- Service calls
- Rule/ML inputs
- Risk persistence
- Alert persistence
- API responses
- Frontend data availability

**Exit condition:** End-to-end data contract remains consistent.

## 2. Questions for Rahil

1. Which project fields are required by `project.service.js`?
2. Which fields do cost-overrun, delay, utilization, compliance and duplicate rules require?
3. Which filters must the repository support?
4. What should repository methods return?
5. Which operations need transactions?
6. What risk evidence must be stored?
7. How should the latest risk snapshot be retrieved?
8. What alert persistence/status behavior is required?

## 3. Questions for Rahul

1. What is the agreed `DATABASE_URL` strategy?
2. How should Prisma startup integrate with the Express backend?
3. Which environment variables belong in `env.js`?
4. Which DB configuration changes should be bundled into one PR?
5. What API response shapes depend on repository results?

## 4. Questions for MJ

1. Which database fields become ML features?
2. Which fields must be numeric?
3. Which missing values are allowed?
4. What sample records are required?
5. What request payload will the ML endpoint accept?
6. Which values must remain stable across versions?

## 5. Questions for Priyanka

1. What database validation tests are needed?
2. Which fields cannot be null?
3. What financial/date values are invalid?
4. Which official-data checks are mandatory?
5. Which synthetic cases must be present?
6. What evidence must be recorded for release testing?

## 6. Handoff Template

### Handoff To
Rahil / Rahul / MJ / Priyanka

### Changed Files
List exact files.

### Input Contract
List accepted fields/parameters.

### Output Contract
List exact return fields and shapes.

### Validation
List commands/checks and results.

### Known Limitations
List assumptions, missing data or deferred work.

### Next Dependent Task
State the next task and owner.

## 7. Collaboration Rules

- Freeze shared contracts before dependent implementation.
- Do not silently rename database fields.
- Do not change shared return shapes without discussion.
- Keep commits focused.
- Rebase dependent branches after prerequisite merges.
- Open PRs into `develop`, not directly into `main`.
- Use one coordinated PR for overlapping DB/environment configuration.

## 8. Conflict Management

### Anupam + Rahil
Main risk: schema/repository/service assumptions drift.

Resolution: schema first -> repository second -> service third.

### Anupam + Rahul
Main risk: shared configuration files diverge.

Resolution: coordinate one DB/config PR and review together.

### Anupam + Priyanka
Main risk: import assumptions differ from test expectations.

Resolution: agree validation rules before final data handoff.

### Anupam + MJ
Main risk: ML expects fields with different names, units or null behavior.

Resolution: freeze feature-source fields and sample payloads before integration.

