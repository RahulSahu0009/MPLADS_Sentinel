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

const buildProjectWhere = (filters = {}) => {
  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.stateId) where.stateId = filters.stateId;
  if (filters.districtId) where.districtId = filters.districtId;
  if (filters.constituencyId) where.constituencyId = filters.constituencyId;
  if (filters.agencyId) where.agencyId = filters.agencyId;
  if (filters.mpId) where.mpId = filters.mpId;
  if (filters.dataSourceType) where.dataSourceType = filters.dataSourceType;
  if (typeof filters.isSyntheticDemo === 'boolean') where.isSyntheticDemo = filters.isSyntheticDemo;

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { externalId: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
};

export class ProjectRepository {
  async findMany(filters = {}) {
    const { page, pageSize, skip } = normalizePagination(filters);
    const where = buildProjectWhere(filters);

    const [total, items] = await prisma.$transaction([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          state: true,
          district: true,
          constituency: true,
          agency: true,
          mp: true,
          dataSource: true,
          riskScores: {
            orderBy: { calculatedAt: 'desc' },
            take: 1,
          },
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

  async findById(projectId) {
    if (!projectId) {
      throw new Error('ProjectRepository.findById requires projectId');
    }

    return prisma.project.findUnique({
      where: { id: projectId },
      include: {
        state: true,
        district: true,
        constituency: true,
        agency: true,
        mp: true,
        dataSource: true,
        financialRecords: {
          orderBy: { recordDate: 'desc' },
          take: 24,
        },
        progressRecords: {
          orderBy: { recordDate: 'desc' },
          take: 24,
        },
        anomalies: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        riskScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async create(data) {
    return prisma.project.create({ data });
  }

  async update(projectId, data) {
    if (!projectId) {
      throw new Error('ProjectRepository.update requires projectId');
    }

    return prisma.project.update({
      where: { id: projectId },
      data,
    });
  }
}
