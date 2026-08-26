/*
IMPLEMENTATION PROMPT
FILE: backend/src/services/project.service.js
PURPOSE:
Manage project retrieval, creation, updates, and analysis orchestration. This is the main business service for the project domain.

PROJECT CONTEXT:
This service is the operational core for MPLADS Sentinel. It coordinates project records and downstream analysis tasks.

TECHNOLOGIES:
Node.js, JavaScript, Prisma

INPUTS:
- Project filters and payloads
- Optional analysis request metadata

OUTPUTS:
- Project records with linked data and analysis results

DEPENDENCIES:
- ../repositories/project.repository.js
- ./analysis.service.js
- ./risk.service.js

DATABASE DEPENDENCIES:
- Project, FinancialRecord, ProgressRecord, DataSourceRecord, RiskScore, Anomaly

API DEPENDENCIES:
- The service may call the ML service through a dedicated client, not directly from route code

BUSINESS RULES:
- Use explicit `OFFICIAL_MPLADS` or `SYNTHETIC_DEMO` source labels
- Validate numeric values and project status transitions

ERROR HANDLING:
- Fail clearly when required project IDs or payload fields are missing

SECURITY REQUIREMENTS:
- Enforce authorization before mutating project records

ACCEPTANCE CRITERIA:
- Service returns consistent project detail objects and analysis triggers
- Business logic remains separate from HTTP and repository layers

WHAT NOT TO CHANGE:
- Do not implement ML math here
- Do not add raw HTTP response handling

IMPLEMENTATION NOTES:
- Keep service methods reusable and focused on domain behavior
*/

import { ProjectRepository } from '../repositories/project.repository.js';
import { RiskService } from './risk.service.js';

const withStatus = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export class ProjectService {
  constructor({ projectRepository = new ProjectRepository(), riskService = new RiskService() } = {}) {
    this.projectRepository = projectRepository;
    this.riskService = riskService;
  }

  async listProjects(filters = {}) {
    const result = await this.projectRepository.findMany(filters);
    return {
      data: result.items,
      meta: result.pagination,
    };
  }

  async getProjectById(projectId) {
    if (!projectId) {
      throw withStatus('Project id is required', 400);
    }

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw withStatus('Project not found', 404);
    }

    return project;
  }

  async createProject(projectInput) {
    if (!projectInput?.title) {
      throw withStatus('Project title is required', 400);
    }

    if (projectInput.sanctionedAmount === undefined || projectInput.sanctionedAmount === null) {
      throw withStatus('sanctionedAmount is required', 400);
    }

    const isSyntheticDemo = projectInput.isSyntheticDemo ?? projectInput.dataSourceType === 'SYNTHETIC_DEMO';
    const dataSourceType = projectInput.dataSourceType ?? (isSyntheticDemo ? 'SYNTHETIC_DEMO' : 'OFFICIAL_MPLADS');

    return this.projectRepository.create({
      ...projectInput,
      dataSourceType,
      isSyntheticDemo,
      totalExpenditure: projectInput.totalExpenditure ?? 0,
    });
  }

  async updateProject(projectId, updates) {
    if (!projectId) {
      throw withStatus('Project id is required', 400);
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw withStatus('At least one update field is required', 400);
    }

    return this.projectRepository.update(projectId, updates);
  }

  async analyzeProject(projectId, options = {}) {
    const project = await this.getProjectById(projectId);
    const riskPayload = await this.riskService.computeRisk(
      project,
      options.ruleResults ?? [],
      options.mlResult ?? null
    );

    const shouldPersist = options.persist !== false;
    const persisted = shouldPersist
      ? await this.riskService.saveRiskSnapshot(riskPayload)
      : riskPayload;

    return {
      projectId,
      analysis: { status: shouldPersist ? 'completed' : 'computed' },
      risk: persisted,
    };
  }

  async getProjectAnomalies(projectId) {
    const project = await this.getProjectById(projectId);
    return project.anomalies ?? [];
  }

  async getProjectRisk(projectId) {
    await this.getProjectById(projectId);
    return this.riskService.getLatestRiskByProjectId(projectId);
  }
}
