/*
IMPLEMENTATION PROMPT
FILE: backend/src/repositories/risk.repository.js
PURPOSE:
Persist and retrieve risk score records and explainability metadata from PostgreSQL.

PROJECT CONTEXT:
The risk engine stores risk scores, reasons, and model version for every project analysis.

TECHNOLOGIES:
Node.js, JavaScript, Prisma, PostgreSQL

INPUTS:
- Risk result payload and project ID

OUTPUTS:
- Stored `RiskScore` rows and retrieval methods

DEPENDENCIES:
- ../config/prisma.js

DATABASE DEPENDENCIES:
- RiskScore, Project

API DEPENDENCIES:
- Called by risk service and analytics flows

BUSINESS RULES:
- Risk scores must be persisted with reasons and model metadata
- Timestamp and score range must be valid according to the project contract

ERROR HANDLING:
- Validate the score range before writing and surface database errors clearly

SECURITY REQUIREMENTS:
- Keep repository functions limited to data access only

ACCEPTANCE CRITERIA:
- Risk score reads and writes are supported for the most recent score per project

WHAT NOT TO CHANGE:
- Do not implement scoring logic here
- Do not skip `RiskScore` schema requirements

IMPLEMENTATION NOTES:
- Include a method to fetch the latest project risk score for detail and dashboard workflows
*/

export class RiskRepository {
  async create(riskPayload) {
    // TODO: insert risk snapshot into Prisma RiskScore model
    return riskPayload;
  }

  async findLatestByProjectId(projectId) {
    // TODO: fetch most recent risk score for a project
    return { projectId, riskScore: 0 };
  }
}
