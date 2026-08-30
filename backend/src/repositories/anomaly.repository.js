/*
IMPLEMENTATION PROMPT
FILE: backend/src/repositories/anomaly.repository.js
PURPOSE:
Persist and retrieve anomaly records for project risk workflows.
*/

import { prisma } from '../config/prisma.js';

export class AnomalyRepository {
  async create(anomalyData) {
    if (!anomalyData.projectId) throw new Error('AnomalyRepository.create requires projectId');
    if (!anomalyData.anomalyType) throw new Error('AnomalyRepository.create requires anomalyType');
    if (!anomalyData.severity) throw new Error('AnomalyRepository.create requires severity');
    if (!anomalyData.description) throw new Error('AnomalyRepository.create requires description');

    return prisma.anomaly.create({
      data: anomalyData,
    });
  }

  async findRecentByProject(projectWhere, limit = 10) {
    return prisma.anomaly.findMany({
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

  async countByType(projectWhere) {
    const anomalies = await prisma.anomaly.findMany({
      where: { project: projectWhere },
      select: { anomalyType: true },
    });

    return anomalies.reduce((counts, { anomalyType }) => {
      counts[anomalyType] = (counts[anomalyType] ?? 0) + 1;
      return counts;
    }, {});
  }
}
