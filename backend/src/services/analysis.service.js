/*
IMPLEMENTATION PROMPT
FILE: backend/src/services/analysis.service.js
PURPOSE:
Orchestrate the full analysis flow for a single project or aggregate dataset, including rules, ML prediction, risk score generation, and alert creation.

PROJECT CONTEXT:
This service is the integration layer between project data, the rule engine, the Python ML service, and the risk engine.

TECHNOLOGIES:
Node.js, JavaScript, Prisma

INPUTS:
- Project object or project ID
- Optional time-range filters and request metadata

OUTPUTS:
- Combined analysis result with anomalies, score summary, and warnings

DEPENDENCIES:
- ../rules/*.js
- ./risk.service.js
- ./alert.service.js
- ./ml-client.service.js

DATABASE DEPENDENCIES:
- Project, FinancialRecord, ProgressRecord, RiskScore, Anomaly, Alert

API DEPENDENCIES:
- Called by project controller and analytics flows
- Calls the Python ML API via the dedicated client

BUSINESS RULES:
- Analysis should return both rule-based and model-based findings
- Differentiate current risk from early-warning risk when both outputs exist
- Preserve data provenance and explainability

ERROR HANDLING:
- Handle partial failure states without corrupting stored results

SECURITY REQUIREMENTS:
- Ensure only authorized flows trigger analysis actions

ACCEPTANCE CRITERIA:
- Service produces a structured result object that is used by risk engine and dashboard
- Data source and provenance remain intact

WHAT NOT TO CHANGE:
- Do not implement the ML algorithm in JavaScript
- Do not write controller logic here

IMPLEMENTATION NOTES:
- Prefer a clear orchestrator pattern for future batch job support
*/

import { CostOverrunRule } from '../rules/cost-overrun.rule.js';
import { DelayRule } from '../rules/delay.rule.js';
import { UtilizationAnomalyRule } from '../rules/utilization-anomaly.rule.js';
import { ComplianceRule } from '../rules/compliance-rule.js';
import { DuplicateRule } from '../rules/duplicate-rule.js';
import { MlClientService } from './ml-client.service.js';
import { RiskService } from './risk.service.js';
import { AlertService } from './alert.service.js';
import { ProjectRepository } from '../repositories/project.repository.js';

const withStatus = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// Anomalies at these severities get turned into actionable alerts.
// LOW/MEDIUM signals stay visible in the risk `reasons` array but don't
// spawn a triage-queue alert on their own.
const ALERTABLE_SEVERITIES = new Set(['HIGH', 'CRITICAL']);

const buildMlFeatures = (project) => ({
  projectId: project.id,
  sanctionedAmount: project.sanctionedAmount ?? null,
  estimatedCost: project.estimatedCost ?? null,
  totalExpenditure: project.totalExpenditure ?? null,
  progressPercentage: project.progressPercentage ?? null,
  status: project.status ?? null,
  workOrderDate: project.workOrderDate ?? null,
  startDate: project.startDate ?? null,
  expectedCompletionDate: project.expectedCompletionDate ?? null,
  actualCompletionDate: project.actualCompletionDate ?? null,
  projectType: project.projectType ?? null,
});

export class AnalysisService {
  constructor({
    projectRepository = new ProjectRepository(),
    mlClientService = new MlClientService(),
    riskService = new RiskService(),
    alertService = new AlertService(),
    rules = [
      new CostOverrunRule(),
      new DelayRule(),
      new UtilizationAnomalyRule(),
      new ComplianceRule(),
      new DuplicateRule(),
    ],
  } = {}) {
    this.projectRepository = projectRepository;
    this.mlClientService = mlClientService;
    this.riskService = riskService;
    this.alertService = alertService;
    this.rules = rules;
  }

  /**
   * Run every rule against the project. Rules receive `context` so
   * DB-dependent rules (currently DuplicateRule) can be given pre-fetched
   * candidates without breaking the "rules don't touch the DB" contract.
   */
  runRules(project, context = {}) {
    const results = [];
    for (const rule of this.rules) {
      try {
        const result = rule.run(project, context);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        // A single failing rule shouldn't take down the whole analysis;
        // record it as a low-confidence data-inconsistency signal instead.
        results.push({
          ruleId: rule.constructor?.name ?? 'UNKNOWN_RULE',
          anomalyType: 'DATA_INCONSISTENCY',
          severity: 'LOW',
          message: `Rule ${rule.constructor?.name ?? 'unknown'} failed to evaluate: ${error.message}`,
          reason: `Rule evaluation error: ${error.message}`,
          description: `Rule evaluation error: ${error.message}`,
          evidence: {},
          relevantValues: {},
        });
      }
    }
    return results;
  }

  async fetchDuplicateCandidates(project) {
    if (!project.districtId) return [];

    try {
      const { items } = await this.projectRepository.findMany({
        districtId: project.districtId,
        pageSize: 25,
      });
      return items.filter((candidate) => candidate.id !== project.id);
    } catch {
      // Candidate lookup is best-effort; duplicate detection just skips
      // if we can't fetch a comparison set.
      return [];
    }
  }

  async callMlClient(project) {
    try {
      return await this.mlClientService.predict(buildMlFeatures(project));
    } catch (error) {
      // ML failures should never block rule-based analysis (business rule:
      // "Network failures should be recoverable and not crash API requests").
      return {
        anomalyScore: 0,
        prediction: 'UNAVAILABLE',
        modelVersion: 'unavailable',
        error: error.message,
      };
    }
  }

  async raiseAlerts(project, riskPayload, ruleResults) {
    const alerts = [];
    const alertable = ruleResults.filter((signal) => ALERTABLE_SEVERITIES.has(signal.severity));

    for (const signal of alertable) {
      const alert = await this.alertService.createAlert(project.id, {
        anomalyType: signal.anomalyType,
        severity: signal.severity,
        riskScore: riskPayload.riskScore,
        message: signal.message,
      });
      alerts.push(alert);
    }

    return alerts;
  }

  /**
   * Full pipeline: rules -> ML -> risk scoring -> (optional) persistence -> alerts.
   * Accepts either a hydrated project object or a project ID.
   */
  async analyzeProject(projectOrId, options = {}) {
    const project = typeof projectOrId === 'string'
      ? await this.projectRepository.findById(projectOrId)
      : projectOrId;

    if (!project?.id) {
      throw withStatus('AnalysisService.analyzeProject requires a project or a valid project id', 400);
    }

    const candidates = await this.fetchDuplicateCandidates(project);
    const ruleResults = this.runRules(project, { candidates });
    const mlResult = await this.callMlClient(project);

    const risk = await this.riskService.computeRisk(project, ruleResults, mlResult);

    const shouldPersist = options.persist !== false;
    const persistedRisk = shouldPersist ? await this.riskService.saveRiskSnapshot(risk) : risk;
    const alerts = shouldPersist ? await this.raiseAlerts(project, persistedRisk, ruleResults) : [];

    return {
      projectId: project.id,
      generatedAt: new Date().toISOString(),
      ruleResults,
      mlResult,
      risk: persistedRisk,
      alerts,
      warnings: mlResult?.prediction === 'UNAVAILABLE' ? ['ML service unavailable; risk based on rule signals only.'] : [],
      options,
    };
  }

  async analyzeProjectById(projectId, options = {}) {
    return this.analyzeProject(projectId, options);
  }

  /**
   * Batch analysis across a filtered set of projects. Runs sequentially to
   * avoid hammering the DB/ML service with concurrent bursts — this is
   * meant for demo/reporting use, not a hot request path.
   */
  async analyzeDataset(filters = {}) {
    const { items } = await this.projectRepository.findMany({ ...filters, pageSize: filters.pageSize ?? 100 });

    const results = [];
    const riskLevelCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    const anomalyTypeCounts = {};

    for (const project of items) {
      const result = await this.analyzeProject(project, { persist: filters.persist !== false });
      results.push(result);

      riskLevelCounts[result.risk.riskLevel] = (riskLevelCounts[result.risk.riskLevel] ?? 0) + 1;
      for (const signal of result.ruleResults) {
        anomalyTypeCounts[signal.anomalyType] = (anomalyTypeCounts[signal.anomalyType] ?? 0) + 1;
      }
    }

    return {
      totalProjects: items.length,
      summary: { riskLevelCounts, anomalyTypeCounts },
      filters,
      results,
    };
  }
}
