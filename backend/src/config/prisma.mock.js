// In-memory Prisma client mock for local testing and development
// Exposes CRUD operations and transactions matching Prisma API

import { hashPassword } from '../lib/crypto.js';

const mockState = { id: 'state-uuid-1', name: 'Maharashtra', code: 'MH' };
const mockDistrict = { id: 'district-uuid-1', name: 'Mumbai', code: 'MUM', stateId: 'state-uuid-1' };
const mockConstituency = { id: 'constituency-uuid-1', name: 'Mumbai South', code: 'MUMS', districtId: 'district-uuid-1' };
const mockAgency = { id: 'agency-uuid-1', name: 'Mhada', type: 'State' };
const mockMP = { id: 'mp-uuid-1', name: 'Rahul Gandhi', constituencyId: 'constituency-uuid-1' };

const mockRole = {
  id: 'role-uuid-1',
  name: 'ADMIN',
  createdAt: new Date(),
  updatedAt: new Date()
};

const roles = [mockRole];

const users = [
  {
    id: 'user-uuid-1',
    email: 'rahil@test.com',
    passwordHash: hashPassword('password123'),
    fullName: 'Rahil Sahu',
    roleId: 'role-uuid-1',
    role: mockRole,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const projects = [
  {
    id: 'project-uuid-1',
    externalId: 'EXT-1',
    title: 'Bridge Construction Mumbai',
    description: 'Constructing a new flyover bridge',
    projectType: 'INFRASTRUCTURE',
    status: 'IN_PROGRESS',
    sanctionedAmount: 50000000,
    estimatedCost: 60000000,
    totalExpenditure: 12000000,
    isSyntheticDemo: false,
    dataSourceType: 'OFFICIAL_MPLADS',
    stateId: 'state-uuid-1',
    state: mockState,
    districtId: 'district-uuid-1',
    district: mockDistrict,
    constituencyId: 'constituency-uuid-1',
    constituency: mockConstituency,
    agencyId: 'agency-uuid-1',
    agency: mockAgency,
    mpId: 'mp-uuid-1',
    mp: mockMP,
    createdAt: new Date(),
    updatedAt: new Date(),
    riskScores: [],
    anomalies: [],
    alerts: [],
    financialRecords: [],
    progressRecords: []
  }
];

const alerts = [
  {
    id: 'alert-uuid-1',
    alertId: 'ALT-1',
    projectId: 'project-uuid-1',
    anomalyId: 'anomaly-uuid-1',
    anomalyType: 'COST_OVERRUN',
    severity: 'HIGH',
    riskScore: 75,
    message: 'Cost overrun risk detected.',
    status: 'OPEN',
    createdAt: new Date(),
    resolvedAt: null
  }
];

const anomalies = [
  {
    id: 'anomaly-uuid-1',
    projectId: 'project-uuid-1',
    anomalyType: 'COST_OVERRUN',
    severity: 'HIGH',
    description: 'Expenditure exceeds budget pace',
    isConfirmed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const riskScores = [
  {
    id: 'risk-uuid-1',
    projectId: 'project-uuid-1',
    riskScore: 75,
    riskLevel: 'HIGH',
    reasons: ['Cost overrun risk detected.'],
    contributingSignals: {},
    modelVersion: 'rule-only',
    calculatedAt: new Date(),
    createdAt: new Date()
  }
];

// Link initial data
projects[0].alerts.push(alerts[0]);
projects[0].anomalies.push(anomalies[0]);
projects[0].riskScores.push(riskScores[0]);

function matchFilter(item, where) {
  if (!where) return true;
  for (const key of Object.keys(where)) {
    if (key === 'OR') {
      const orConditions = where[key];
      if (Array.isArray(orConditions)) {
        const matchesOr = orConditions.some(cond => {
          return Object.keys(cond).some(field => {
            const val = cond[field];
            if (val && typeof val === 'object' && 'contains' in val) {
              const term = val.contains.toLowerCase();
              return String(item[field] ?? '').toLowerCase().includes(term);
            }
            return item[field] === val;
          });
        });
        if (!matchesOr) return false;
      }
    } else if (key === 'project') {
      // Resolve project relation filter (for alerts etc)
      const projectItem = projects.find(p => p.id === item.projectId);
      if (!projectItem || !matchFilter(projectItem, where.project)) return false;
    } else if (item[key] !== undefined) {
      const val = where[key];
      if (val && typeof val === 'object') {
        if ('gte' in val) {
          if (new Date(item[key]) < new Date(val.gte)) return false;
        }
        if ('lte' in val) {
          if (new Date(item[key]) > new Date(val.lte)) return false;
        }
      } else {
        if (item[key] !== val) return false;
      }
    } else {
      // Field doesn't exist on item, filter doesn't match
      return false;
    }
  }
  return true;
}

export function createMockPrisma() {
  const modelOperation = (collection) => ({
    async count({ where } = {}) {
      return collection.filter(item => matchFilter(item, where)).length;
    },
    async findMany(args = {}) {
      const { where, skip = 0, take = 100, include } = args;
      let items = collection.filter(item => matchFilter(item, where));

      // Handle project relation inclusion
      if (include) {
        items = items.map(item => {
          const newItem = { ...item };
          if (include.project) {
            newItem.project = projects.find(p => p.id === item.projectId) || null;
          }
          if (include.anomaly) {
            newItem.anomaly = anomalies.find(a => a.id === item.anomalyId) || null;
          }
          if (include.role) {
            newItem.role = roles.find(r => r.id === item.roleId) || null;
          }
          if (include.state) newItem.state = mockState;
          if (include.district) newItem.district = mockDistrict;
          if (include.constituency) newItem.constituency = mockConstituency;
          if (include.agency) newItem.agency = mockAgency;
          if (include.mp) newItem.mp = mockMP;
          if (include.riskScores) {
            newItem.riskScores = riskScores.filter(r => r.projectId === item.id);
          }
          return newItem;
        });
      }
      return items.slice(skip, skip + take);
    },
    async findUnique(args = {}) {
      const { where, include } = args;
      const item = collection.find(i => {
        if (where.id !== undefined) return i.id === where.id;
        if (where.email !== undefined) return i.email === where.email;
        return false;
      });
      if (!item) return null;

      const newItem = { ...item };
      if (include) {
        if (include.project) {
          newItem.project = projects.find(p => p.id === item.projectId) || null;
        }
        if (include.anomaly) {
          newItem.anomaly = anomalies.find(a => a.id === item.anomalyId) || null;
        }
        if (include.role) {
          newItem.role = roles.find(r => r.id === item.roleId) || null;
        }
        if (include.state) newItem.state = mockState;
        if (include.district) newItem.district = mockDistrict;
        if (include.constituency) newItem.constituency = mockConstituency;
        if (include.agency) newItem.agency = mockAgency;
        if (include.mp) newItem.mp = mockMP;
        if (include.riskScores) {
          newItem.riskScores = riskScores.filter(r => r.projectId === item.id);
        }
        if (include.anomalies) {
          newItem.anomalies = anomalies.filter(a => a.projectId === item.id);
        }
        if (include.alerts) {
          newItem.alerts = alerts.filter(a => a.projectId === item.id);
        }
      }
      return newItem;
    },
    async findFirst(args = {}) {
      const { where } = args;
      return collection.find(item => matchFilter(item, where)) || null;
    },
    async create(args = {}) {
      const { data } = args;
      const id = data.id || `mock-id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newItem = {
        id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      collection.push(newItem);
      return newItem;
    },
    async update(args = {}) {
      const { where, data } = args;
      const index = collection.findIndex(i => i.id === where.id);
      if (index === -1) throw new Error('Record not found');
      collection[index] = {
        ...collection[index],
        ...data,
        updatedAt: new Date()
      };
      return collection[index];
    }
  });

  return {
    project: modelOperation(projects),
    alert: modelOperation(alerts),
    anomaly: modelOperation(anomalies),
    riskScore: modelOperation(riskScores),
    user: modelOperation(users),
    role: modelOperation(roles),

    async $transaction(queries) {
      return Promise.all(queries);
    }
  };
}
