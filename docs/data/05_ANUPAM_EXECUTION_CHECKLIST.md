# Anupam — Execution Checklist and Definition of Done

## Start Here

- [ ] Inspect repository structure.
- [ ] Inspect Prisma scaffold.
- [ ] Inspect backend/config files.
- [ ] Inspect official/synthetic data folders.
- [ ] Record existing implementation before changing anything.

## Data Contract

- [ ] Project fields agreed.
- [ ] Finance fields agreed.
- [ ] Progress/timeline fields agreed.
- [ ] Geography fields agreed.
- [ ] Duplicate-analysis fields agreed.
- [ ] Risk/evidence fields agreed.
- [ ] Provenance/audit fields agreed.
- [ ] Required vs optional fields agreed.
- [ ] Naming frozen with Rahul/Rahil.

## Prisma Schema

- [ ] Models implemented.
- [ ] Primary keys correct.
- [ ] Foreign keys correct.
- [ ] Relations correct.
- [ ] Enums reviewed.
- [ ] Indexes reviewed.
- [ ] Financial numeric types reviewed.
- [ ] Date/time types reviewed.
- [ ] Provenance included.
- [ ] Audit information included.
- [ ] Risk snapshot/evidence persistence supported.
- [ ] No MongoDB.

## PostgreSQL/Prisma

- [ ] PostgreSQL starts.
- [ ] `DATABASE_URL` is configured safely.
- [ ] Prisma client generates.
- [ ] Migration generates.
- [ ] Migration applies.
- [ ] Clean-database migration has been checked.
- [ ] Prisma client can query successfully.
- [ ] No secrets committed.

## Repositories

- [ ] Project repository implemented.
- [ ] Risk repository implemented.
- [ ] Alert repository implemented.
- [ ] Method contracts documented.
- [ ] Return shapes reviewed with Rahil.
- [ ] Pagination behavior reviewed.
- [ ] Not-found behavior reviewed.
- [ ] Transaction requirements reviewed.
- [ ] Repository tests/validation run.

## Official Data

- [ ] Required columns checked.
- [ ] Nulls checked.
- [ ] Numeric ranges checked.
- [ ] Date ranges checked.
- [ ] Provenance recorded.
- [ ] Import assumptions documented.

## Synthetic Data

- [ ] Normal project exists.
- [ ] Delayed project exists.
- [ ] Cost-overrun project exists.
- [ ] Duplicate/overlap candidate exists.
- [ ] Incomplete project exists.
- [ ] Unusual utilization case considered.
- [ ] Synthetic data clearly labeled.

## Handoffs

- [ ] Rahil received schema/repository contract.
- [ ] Rahul received DB/config assumptions.
- [ ] MJ received ML-relevant sample data.
- [ ] Priyanka received validation/data-quality cases.

## Reviews

- [ ] Data contract review complete.
- [ ] ML data review complete.
- [ ] Prisma schema review complete.
- [ ] DB/config review complete.
- [ ] Repository review complete.
- [ ] Data-quality review complete.
- [ ] Integration review complete.

## PR/Merge

- [ ] Focused branch used.
- [ ] PR targets `develop`.
- [ ] Correct reviewers assigned.
- [ ] No unrelated formatting/file changes.
- [ ] Schema PR merged before repository PR.
- [ ] Repository PR merged before dependent service work is finalized.
- [ ] Dependent branches rebased after prerequisite merges.

## Final Definition of Done

- [ ] Dependencies satisfied.
- [ ] Implementation matches assigned responsibility.
- [ ] Validation/tests pass.
- [ ] Public database/repository contracts documented.
- [ ] Assigned reviewers approve.
- [ ] No TypeScript, MongoDB, secrets or unrelated files introduced.
- [ ] Protected README untouched without team approval.
- [ ] Integrated demo works where applicable.
