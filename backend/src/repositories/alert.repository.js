/*
IMPLEMENTATION PROMPT
FILE: backend/src/repositories/alert.repository.js
PURPOSE:
Persist and retrieve alert records for project risk and anomaly review workflows.

PROJECT CONTEXT:
Alerts represent actionable review items derived from project anomalies and risk scores.

TECHNOLOGIES:
Node.js, JavaScript, Prisma, PostgreSQL

INPUTS:
- Alert creation and status update payloads
- Query filters for project or status-based listing

OUTPUTS:
- Alert row data and filtered alert lists

DEPENDENCIES:
- ../config/prisma.js

DATABASE DEPENDENCIES:
- Alert, Project, Anomaly

API DEPENDENCIES:
- Used by alert service and controller

BUSINESS RULES:
- Alert status transitions must remain valid
- Each alert should remain tied to its project and anomaly context

ERROR HANDLING:
- Surface database conflicts and update failures clearly

SECURITY REQUIREMENTS:
- Repository should not perform auth or UI enforcement logic

ACCEPTANCE CRITERIA:
- Alert records can be created, fetched, and updated consistently

WHAT NOT TO CHANGE:
- Do not bypass Prisma and database constraints
- Do not mix alert logic with business rules outside the service layer

IMPLEMENTATION NOTES:
- Keep filters flexible for dashboard review and triage experiences
*/

import { prisma } from '../config/prisma.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const normalizePagination = (filters = {}) => {
  const page = Math.max(toInt(filters.page, DEFAULT_PAGE), 1);
  const pageSize = Math.min(Math.max(toInt(filters.pageSize, DEFAULT_PAGE_SIZE), 1), MAX_PAGE_SIZE);
  return { page, pageSize, skip: (page - 1) * pageSize };
};

const normalizeSortDirection = (value) => (value === 'asc' ? 'asc' : 'desc');

export class AlertRepository {
  async create(alertData) {
    const { projectId, alertId, anomalyType, severity, riskScore, message } = alertData || {};

    if (!projectId) throw new Error('AlertRepository.create requires projectId');
    if (!alertId) throw new Error('AlertRepository.create requires alertId');
    if (!anomalyType) throw new Error('AlertRepository.create requires anomalyType');
    if (!severity) throw new Error('AlertRepository.create requires severity');
    if (!message) throw new Error('AlertRepository.create requires message');
    if (!Number.isFinite(Number(riskScore))) throw new Error('AlertRepository.create requires numeric riskScore');

    return prisma.alert.create({
      data: {
        ...alertData,
        riskScore: Math.round(Number(riskScore)),
      },
    });
  }

  async findMany(filters = {}) {
    const { page, pageSize, skip } = normalizePagination(filters);
    const where = {};

    if (filters.status) where.status = filters.status;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.severity) where.severity = filters.severity;
    if (filters.anomalyType) where.anomalyType = filters.anomalyType;

    const [total, items] = await prisma.$transaction([
      prisma.alert.count({ where }),
      prisma.alert.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: normalizeSortDirection(filters.sortDirection) },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
              state: { select: { id: true, name: true } },
              district: { select: { id: true, name: true } },
            },
          },
          anomaly: true,
        },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      },
    };
  }

  async findById(alertId) {
    if (!alertId) {
      throw new Error('AlertRepository.findById requires alertId');
    }

    return prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        anomaly: true,
      },
    });
  }

  async update(alertId, updates) {
    if (!alertId) {
      throw new Error('AlertRepository.update requires alertId');
    }

    const patch = { ...updates };
    if (patch.status && (patch.status === 'RESOLVED' || patch.status === 'FALSE_POSITIVE') && !patch.resolvedAt) {
      patch.resolvedAt = new Date();
    }

    return prisma.alert.update({
      where: { id: alertId },
      data: patch,
    });
  }
}
