# Contributing to MPLADS Sentinel

This guide explains how team members should set up the project, work on assigned tasks, validate changes, and contribute safely.

Use [assign.md](assign.md) as the source of truth for ownership and dependencies.

## Architecture Rules

- Frontend and backend code must use JavaScript/JSX only.
- The database is PostgreSQL accessed through Prisma.
- MongoDB must not be added.
- The ML service uses Python and FastAPI.
- Business logic belongs in services and rules, not routes or UI components.
- Database queries belong in repositories.
- Risk results must remain explainable and evidence-based.
- Do not modify `README.md` as part of normal task work.
- Never commit passwords, API keys, tokens, `.env` files, or private data.

## Required Software

Install these tools before contributing:

- Git
- Node.js 18 or newer
- npm
- Python 3.11 or newer
- PostgreSQL 14 or newer, or Docker Desktop
- VS Code recommended

Check installations:

```bash
git --version
node --version
npm --version
python --version
psql --version
docker --version
```

## Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd MPLADS_Sentinel
```

If the repository is already available locally, do not clone it again. Make sure Git reports the project directory as the repository root:

```bash
git rev-parse --show-toplevel
```

The result should be the `MPLADS_Sentinel` directory, not `C:/` or another parent folder.

## Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

### ML service

Create and activate a virtual environment:

```bash
cd ../ml-service
python -m venv .venv
```

Git Bash on Windows:

```bash
source .venv/Scripts/activate
```

PowerShell on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

The ML dependencies are:

- fastapi
- pydantic
- pandas
- numpy
- scikit-learn
- uvicorn
- pytest

## Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

Update local values as needed. Never commit `.env`.

Typical values include:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mplads_sentinel
JWT_SECRET=replace-with-a-local-development-secret
ML_SERVICE_URL=http://localhost:8000
FRONTEND_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:4000/api
```

Use different secrets for development and production.

## Start PostgreSQL

### Option A: Docker Compose

From the project root:

```bash
docker compose up -d
```

Check running services:

```bash
docker compose ps
```

Stop services when finished:

```bash
docker compose down
```

### Option B: Local PostgreSQL

Create a database named `mplads_sentinel`, then make sure `DATABASE_URL` points to it in `.env`.

## Prisma Setup

From the backend directory:

```bash
cd backend
npx prisma validate
npx prisma generate
```

When the schema is ready for migration:

```bash
npx prisma migrate dev --name initial_schema
```

Do not change `backend/prisma/schema.prisma` without coordinating with Anupam and the assigned reviewer.

## Run the Services

Open separate terminals from the project root.

### Backend

```bash
cd backend
npm run dev
```

Expected health URL:

```text
http://localhost:4000/health
```

### Frontend

```bash
cd frontend
npm run dev
```

Expected URL:

```text
http://localhost:5173
```

### ML service

Activate the virtual environment, then run:

```bash
cd ml-service
uvicorn app.main:app --reload --port 8000
```

If `app.main` has not yet been added, run the available FastAPI entrypoint defined by the ML-service owner. Coordinate this with MJ before changing the service structure.

## Branch Workflow

Create a branch for each focused task:

```bash
git checkout -b feature/short-task-name
```

Examples:

```text
feature/prisma-schema
feature/project-repository
feature/risk-rules
feature/ml-predictor
feature/dashboard-ui
feature/integration-tests
```

Do not work directly on `main`.

## Before Coding

1. Open [assign.md](assign.md).
2. Confirm that you own the task or are an assigned contributor.
3. Check the task dependencies.
4. Coordinate any shared-file changes with the primary owner.
5. Confirm the input and output contract before implementation.
6. Keep the change limited to the assigned scope.

## File Ownership Rules

Shared files require coordination:

- `backend/prisma/schema.prisma`: Anupam owns changes.
- `backend/src/app.js`: You own route registration changes.
- `frontend/src/App.jsx`: Arvind owns page and route changes.
- `frontend/src/services/api.js`: You own shared API-client changes.
- `docker-compose.yml`: You own changes with Priyanka’s review.
- `.env.example`: You own changes with review before merge.

Do not overwrite another member’s work. Discuss contract or schema changes before editing shared files.

## Validation Commands

### Backend JavaScript syntax

From the project root:

```bash
find backend/src -type f -name "*.js" -print0 | xargs -0 -n1 node --check
```

### Frontend build

```bash
cd frontend
npm run build
```

### Prisma validation

```bash
cd backend
npx prisma validate
```

### Python compilation

```bash
python -m compileall ml-service
```

### ML tests

```bash
pytest ml-service/tests
```

Run the checks relevant to your task before opening a pull request. Priyanka runs the cross-service regression checks.

## Commit Guidelines

Use small, descriptive commits:

```bash
git add path/to/changed/files
git commit -m "feat(backend): add project repository"
```

Recommended prefixes:

- `feat`: new functionality
- `fix`: bug correction
- `test`: tests
- `docs`: documentation
- `refactor`: behavior-preserving restructuring
- `chore`: tooling or configuration

Do not commit generated files, dependency directories, `.env`, secrets, or unrelated formatting changes.

## Pull Request Steps

Before opening a pull request:

1. Run the relevant validation commands.
2. Review the diff:

```bash
git diff --check
git diff --stat
git status
```

3. Push your branch:

```bash
git push -u origin feature/short-task-name
```

4. Open a pull request into `develop`.
5. Add the reviewer listed in [assign.md](assign.md).
6. Describe the changed files, behavior, dependencies, and validation performed.
7. Mention any remaining blocker or follow-up task.

Do not merge directly into `main`.

## Pull Request Template

Include these sections in the pull request description:

```text
## What changed

## Assigned task ID

## Files changed

## Dependencies completed

## Validation performed

## Screenshots or API examples

## Remaining risks or blockers
```

## Handoff Format

When handing work to another teammate, provide:

- Task ID from `assign.md`
- Changed files
- Input contract
- Output contract
- Database or API changes
- Validation command and result
- Known limitations
- Next dependent task

Example:

```text
Task: ML-03
Changed: ml-service/app/features/feature_engineering.py
Input: ProjectFeatures payload
Output: sanitized feature vector
Validation: python -m compileall ml-service
Next: MJ hands the feature contract to Priyanka and You for ML-04
```

## Definition of Done

A contribution is complete when:

- The assigned task and dependencies are satisfied.
- The code follows the existing project architecture.
- Relevant tests or validation commands pass.
- API and database contracts are documented.
- The assigned reviewer approves the changes.
- No TypeScript, MongoDB, secrets, or unrelated files are introduced.
- The pull request is merged into `develop`.

## Recommended First Contributions

Start in this order:

1. Anupam: finalize Prisma schema and database configuration.
2. You and Anupam: agree on API and persistence contracts.
3. Anupam: implement repositories.
4. Rahil: implement backend services, rules, controllers, and routes.
5. MJ: implement the ML schema, feature engineering, predictor, and FastAPI contract.
6. You and MJ: connect the backend ML client.
7. Arvind and You: connect frontend pages to the agreed APIs.
8. Priyanka: run integration and regression testing.

This order allows frontend fixture work and ML contract work to proceed in parallel while preventing integration from starting before the shared contracts are stable.
