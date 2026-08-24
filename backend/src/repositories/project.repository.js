/*
IMPLEMENTATION PROMPT
FILE: backend/src/repositories/project.repository.js
PURPOSE:
Encapsulate Prisma data access for project records, hierarchy, and linked financial/progress data.

PROJECT CONTEXT:
Projects are the authoritative domain record in PostgreSQL and are used across dashboard, risk, and alert workflows.

TECHNOLOGIES:
Node.js, JavaScript, Prisma, PostgreSQL

INPUTS:
- Project filters, IDs, and create/update payloads

OUTPUTS:
- Prisma results for project data and related metrics

DEPENDENCIES:
- ../config/prisma.js

DATABASE DEPENDENCIES:
- Project, FinancialRecord, ProgressRecord, DataSourceRecord, Agency, MP, State, District, Constituency

API DEPENDENCIES:
- None directly

BUSINESS RULES:
- Preserve normalized relationships and metadata
- Use explicit includes to avoid over-fetching and ensure predictable queries

ERROR HANDLING:
- Surface database exceptions with clear context and avoid swallowing them silently

SECURITY REQUIREMENTS:
- Repository methods should not include authorization checks

ACCEPTANCE CRITERIA:
- Queries support list, detail, create, and related record retrieval
- Database access remains clean and reusable

WHAT NOT TO CHANGE:
- Do not add direct MongoDB or non-Prisma logic
- Do not implement domain rules here

IMPLEMENTATION NOTES:
- Keep repository functions explicit and single-purpose
*/

export class ProjectRepository {
  async findMany(filters = {}) {
    // TODO: build Prisma query with filter normalization and pagination
    return [];
  }

  async findById(projectId) {
    // TODO: fetch a project with related records and geography metadata
    return { id: projectId };
  }

  async create(data) {
    // TODO: persist a new project via Prisma project model
    return { ...data, id: 'project-id' };
  }

  async update(projectId, data) {
    // TODO: update project details using Prisma and return updated row
    return { id: projectId, ...data };
  }
}
