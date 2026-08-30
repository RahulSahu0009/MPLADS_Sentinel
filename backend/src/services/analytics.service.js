/*
FILE: backend/src/services/analytics.service.js
PURPOSE:
Aggregate project, risk, and alert data into dashboard/state/district
analytics payloads, keeping this logic out of the controller.

NOTE ON ARCHITECTURE:
The rest of the codebase follows "controllers call services; services call
repositories" (see project.repository.js / risk.repository.js /
alert.repository.js). There is no analytics.repository.js yet — repositories
are Anupam's ownership area (backend/src/repositories). To unblock
analytics.controller.js this service queries `prisma` directly for now.
If/when an AnalyticsRepository is added, the query methods below
(fetchProjectsWithLatestRisk, countOpenAlerts, fetchRecentAnomalies,
fetchAnomalyTypeCounts) should move there and this service should call
that repository instead, matching every other domain in the app.
*/

import { prisma } from '../config/prisma.js';

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const emptyRiskDistribution = () => ({ LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0, UNSCORED: 0 });

const bucketRiskLevel = (distribution, level) => {
  const key = RISK_LEVELS.includes(level) ? level : 'UNSCORED';
  distribution[key] = (distribution[key] ?? 0) + 1;
};

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildProjectWhere = (filters = {}) => {
  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.stateId) where.stateId = filters.stateId;
  if (filters.districtId) where.districtId = filters.districtId;
  if (filters.constituencyId) where.constituencyId = filters.constituencyId;
  if (filters.agencyId) where.agencyId = filters.agencyId;
  if (filters.mpId) where.mpId = filters.mpId;
  if (filters.dataSourceType) where.dataSourceType = filters.dataSourceType;

  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = new Date(filters.from);
    if (filters.to) where.createdAt.lte = new Date(filters.to);
  }

  return where;
};

const projectAnalyticsSelect = {
  id: true,
  title: true,
  sanctionedAmount: true,
  totalExpenditure: true,
  status: true,
  dataSourceType: true,
  stateId: true,
  state: { select: { id: true, name: true } },
  districtId: true,
  district: { select: { id: true, name: true } },
  riskScores: {
    orderBy: { calculatedAt: 'desc' },
    take: 1,
    select: { riskLevel: true, riskScore: true },
  },
};

export class AnalyticsService {
  constructor({ prismaClient = prisma } = {}) {
    this.prisma = prismaClient;
  }

  async fetchProjectsWithLatestRisk(filters) {
    const where = buildProjectWhere(filters);
    const projects = await this.prisma.project.findMany({ where, select: projectAnalyticsSelect });

    // "Latest risk level" is computed per project (most recent RiskScore),
    // so an optional riskLevel filter has to be applied post-fetch rather
    // than as a plain Prisma where clause.
    if (!filters.riskLevel) return projects;

    return projects.filter((project) => (project.riskScores[0]?.riskLevel ?? null) === filters.riskLevel);
  }

  async countOpenAlerts(filters) {
    const projectWhere = buildProjectWhere(filters);
    return this.prisma.alert.count({
      where: {
        status: 'OPEN',
        project: projectWhere,
      },
    });
  }

  async fetchRecentAnomalies(filters, limit = 10) {
    const projectWhere = buildProjectWhere(filters);
    return this.prisma.anomaly.findMany({
      where: { project: projectWhere },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        projectId: true,
        anomalyType: true,
        severity: true,
        description: true,
        createdAt: true,
        project: { select: { title: true } },
      },
    });
  }

  async fetchAnomalyTypeCounts(filters) {
    const projectWhere = buildProjectWhere(filters);
    const anomalies = await this.prisma.anomaly.findMany({
      where: { project: projectWhere },
      select: { anomalyType: true },
    });

    return anomalies.reduce((counts, { anomalyType }) => {
      counts[anomalyType] = (counts[anomalyType] ?? 0) + 1;
      return counts;
    }, {});
  }

  async getDashboardStats(filters = {}, user = null) {
    const [projects, openAlerts, recentAnomalies] = await Promise.all([
      this.fetchProjectsWithLatestRisk(filters),
      this.countOpenAlerts(filters),
      this.fetchRecentAnomalies(filters),
    ]);

    const riskDistribution = emptyRiskDistribution();
    let totalSanctionedAmount = 0;
    let totalExpenditure = 0;

    for (const project of projects) {
      totalSanctionedAmount += toNumber(project.sanctionedAmount);
      totalExpenditure += toNumber(project.totalExpenditure);
      bucketRiskLevel(riskDistribution, project.riskScores[0]?.riskLevel ?? null);
    }

    const overallUtilizationRatio = totalSanctionedAmount > 0
      ? Number(((totalExpenditure / totalSanctionedAmount) * 100).toFixed(2))
      : 0;

    return {
      type: 'dashboard',
      filters,
      user: user?.id ?? null,
      data: {
        kpis: {
          totalProjects: projects.length,
          totalSanctionedAmount,
          totalExpenditure,
          overallUtilizationRatio,
          openAlerts,
        },
        riskDistribution,
        recentAnomalies: recentAnomalies.map((anomaly) => ({
          id: anomaly.id,
          projectId: anomaly.projectId,
          projectTitle: anomaly.project?.title ?? null,
          anomalyType: anomaly.anomalyType,
          severity: anomaly.severity,
          description: anomaly.description,
          createdAt: anomaly.createdAt,
        })),
      },
    };
  }

  async getGeographyAnalytics(filters, groupKey, user) {
    const projects = await this.fetchProjectsWithLatestRisk(filters);

    const groups = new Map();
    for (const project of projects) {
      const id = project[`${groupKey}Id`];
      const name = project[groupKey]?.name ?? 'Unassigned';
      const key = id ?? 'unassigned';

      if (!groups.has(key)) {
        groups.set(key, {
          id: id ?? null,
          name,
          totalProjects: 0,
          totalSanctionedAmount: 0,
          totalExpenditure: 0,
          riskDistribution: emptyRiskDistribution(),
        });
      }

      const group = groups.get(key);
      group.totalProjects += 1;
      group.totalSanctionedAmount += toNumber(project.sanctionedAmount);
      group.totalExpenditure += toNumber(project.totalExpenditure);
      bucketRiskLevel(group.riskDistribution, project.riskScores[0]?.riskLevel ?? null);
    }

    const data = Array.from(groups.values())
      .map((group) => ({
        ...group,
        utilizationRatio: group.totalSanctionedAmount > 0
          ? Number(((group.totalExpenditure / group.totalSanctionedAmount) * 100).toFixed(2))
          : 0,
      }))
      .sort((a, b) => b.totalProjects - a.totalProjects);

    return { type: groupKey, filters, user: user?.id ?? null, data };
  }

  async getStateAnalytics(filters = {}, user = null) {
    const result = await this.getGeographyAnalytics(filters, 'state', user);
    return { ...result, type: 'state' };
  }

  async getDistrictAnalytics(filters = {}, user = null) {
    const [result, anomalyDistribution] = await Promise.all([
      this.getGeographyAnalytics(filters, 'district', user),
      this.fetchAnomalyTypeCounts(filters),
    ]);

    return { ...result, type: 'district', anomalyDistribution };
  }
}
