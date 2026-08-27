/*
IMPLEMENTATION PROMPT
FILE: backend/src/controllers/project.controller.js
PURPOSE:
Handle project listing, project retrieval, creation, and analysis orchestration.

PROJECT CONTEXT:
Project handling is the heart of MPLADS Sentinel. The controller coordinates validation and service calls while keeping the API contract consistent.

TECHNOLOGIES:
Node.js, Express, JavaScript, Prisma

INPUTS:
- Request params, queries, and body payloads

OUTPUTS:
- JSON API responses for project resources and analysis triggers

DEPENDENCIES:
- ../services/project.service.js
- ../repositories/project.repository.js
- ../validators/project.validator.js

DATABASE DEPENDENCIES:
- Project, FinancialRecord, ProgressRecord, RiskScore, Anomaly

API DEPENDENCIES:
- Downstream backend services for ML and risk analysis

BUSINESS RULES:
- Project source must be explicitly `OFFICIAL_MPLADS` or `SYNTHETIC_DEMO`
- Validate numeric values and status transitions

ERROR HANDLING:
- Use consistent 400, 404, 401, and 403 responses

SECURITY REQUIREMENTS:
- Role-guard mutation paths and sensitive view endpoints

ACCEPTANCE CRITERIA:
- Controller remains thin and delegates domain logic to the service layer
- API responses are consistent and structured

WHAT NOT TO CHANGE:
- Do not place Prisma queries directly in the controller
- Do not implement the ML model in this file

IMPLEMENTATION NOTES:
- Prefer typed-like JavaScript objects or JSDoc shapes for clarity when building future implementation
*/

import { ProjectService } from '../services/project.service.js';
import { projectAnalyzeSchema, projectCreateSchema, projectQuerySchema } from '../validators/project.validator.js';

const withStatus = (message, status, issues) => {
  const error = new Error(message);
  error.status = status;
  if (issues) {
    error.issues = issues;
  }

  return error;
};

export class ProjectController {
  constructor({ projectService = new ProjectService() } = {}) {
    this.projectService = projectService;
  }

  async listProjects(filters = {}, user = null) {
    const parsed = projectQuerySchema.safeParse(filters);
    if (!parsed.success) {
      throw withStatus('Invalid project query filters', 400, parsed.error.issues);
    }

    return this.projectService.listProjects(parsed.data);
  }

  async getProjectById(projectId, user = null) {
    return this.projectService.getProjectById(projectId);
  }

  async createProject(payload, user = null) {
    const parsed = projectCreateSchema.safeParse(payload);
    if (!parsed.success) {
      throw withStatus('Invalid project payload', 400, parsed.error.issues);
    }

    const created = await this.projectService.createProject(parsed.data);
    return { created: true, data: created };
  }

  async analyzeProject(projectId, payload = {}, user = null) {
    const parsed = projectAnalyzeSchema.safeParse(payload);
    if (!parsed.success) {
      throw withStatus('Invalid analyze payload', 400, parsed.error.issues);
    }

    return this.projectService.analyzeProject(projectId, parsed.data);
  }

  async getProjectAnomalies(projectId, user = null) {
    const anomalies = await this.projectService.getProjectAnomalies(projectId);
    return { projectId, anomalies };
  }

  async getProjectRisk(projectId, user = null) {
    const risk = await this.projectService.getProjectRisk(projectId);
    return { projectId, risk };
  }
}
