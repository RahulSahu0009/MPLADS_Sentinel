// NOTE: All data in this file is SYNTHETIC_DEMO fixture data.
// These fixtures are used because the backend API is not yet implemented.
// Pages using this data are marked with [FIXTURE] in their data source.
// Replace with real API calls once backend contracts are confirmed.

export const FIXTURE_DASHBOARD_STATS = {
  totalProjects: 1248,
  totalSanctionedAmount: 4820000000,
  totalExpenditure: 3105000000,
  utilizationRate: 64.4,
  projectsByStatus: {
    COMPLETED: 412,
    IN_PROGRESS: 587,
    NOT_STARTED: 189,
    STALLED: 60,
  },
  projectsByRisk: {
    LOW: 698,
    MEDIUM: 342,
    HIGH: 158,
    CRITICAL: 50,
  },
  openAlerts: 87,
  recentHighRiskProjects: [
    { id: 'p1', name: 'Rural Road Construction - Varanasi', state: 'Uttar Pradesh', riskLevel: 'CRITICAL', riskScore: 91, status: 'STALLED' },
    { id: 'p2', name: 'Community Hall - Patna Rural', state: 'Bihar', riskLevel: 'CRITICAL', riskScore: 88, status: 'IN_PROGRESS' },
    { id: 'p3', name: 'Drinking Water Supply - Nagpur', state: 'Maharashtra', riskLevel: 'HIGH', riskScore: 79, status: 'IN_PROGRESS' },
    { id: 'p4', name: 'School Building - Jaipur North', state: 'Rajasthan', riskLevel: 'HIGH', riskScore: 76, status: 'STALLED' },
    { id: 'p5', name: 'Drainage System - Lucknow East', state: 'Uttar Pradesh', riskLevel: 'HIGH', riskScore: 74, status: 'IN_PROGRESS' },
  ],
  dataSource: 'SYNTHETIC_DEMO',
};

export const FIXTURE_PROJECTS = [
  { id: 'p1', name: 'Rural Road Construction - Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', constituency: 'Varanasi', type: 'ROAD', status: 'STALLED', sanctionedAmount: 5000000, expenditure: 4800000, riskLevel: 'CRITICAL', riskScore: 91, dataSource: 'SYNTHETIC_DEMO', createdAt: '2023-04-01' },
  { id: 'p2', name: 'Community Hall - Patna Rural', state: 'Bihar', district: 'Patna', constituency: 'Patna Sahib', type: 'BUILDING', status: 'IN_PROGRESS', sanctionedAmount: 3000000, expenditure: 2900000, riskLevel: 'CRITICAL', riskScore: 88, dataSource: 'SYNTHETIC_DEMO', createdAt: '2023-05-15' },
  { id: 'p3', name: 'Drinking Water Supply - Nagpur', state: 'Maharashtra', district: 'Nagpur', constituency: 'Nagpur', type: 'WATER', status: 'IN_PROGRESS', sanctionedAmount: 8000000, expenditure: 3200000, riskLevel: 'HIGH', riskScore: 79, dataSource: 'SYNTHETIC_DEMO', createdAt: '2023-03-10' },
  { id: 'p4', name: 'School Building - Jaipur North', state: 'Rajasthan', district: 'Jaipur', constituency: 'Jaipur North', type: 'BUILDING', status: 'STALLED', sanctionedAmount: 4500000, expenditure: 1200000, riskLevel: 'HIGH', riskScore: 76, dataSource: 'SYNTHETIC_DEMO', createdAt: '2023-06-20' },
  { id: 'p5', name: 'Drainage System - Lucknow East', state: 'Uttar Pradesh', district: 'Lucknow', constituency: 'Lucknow East', type: 'DRAINAGE', status: 'IN_PROGRESS', sanctionedAmount: 6000000, expenditure: 5800000, riskLevel: 'HIGH', riskScore: 74, dataSource: 'SYNTHETIC_DEMO', createdAt: '2023-02-28' },
  { id: 'p6', name: 'Primary Health Centre - Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', constituency: 'Bhopal', type: 'HEALTH', status: 'COMPLETED', sanctionedAmount: 7000000, expenditure: 6950000, riskLevel: 'MEDIUM', riskScore: 45, dataSource: 'SYNTHETIC_DEMO', createdAt: '2022-11-01' },
  { id: 'p7', name: 'Anganwadi Centre - Pune Rural', state: 'Maharashtra', district: 'Pune', constituency: 'Pune Rural', type: 'BUILDING', status: 'COMPLETED', sanctionedAmount: 2000000, expenditure: 1980000, riskLevel: 'LOW', riskScore: 18, dataSource: 'SYNTHETIC_DEMO', createdAt: '2022-09-15' },
  { id: 'p8', name: 'Village Road - Hyderabad Rural', state: 'Telangana', district: 'Hyderabad', constituency: 'Hyderabad Rural', type: 'ROAD', status: 'IN_PROGRESS', sanctionedAmount: 3500000, expenditure: 1750000, riskLevel: 'MEDIUM', riskScore: 52, dataSource: 'SYNTHETIC_DEMO', createdAt: '2023-07-01' },
  { id: 'p9', name: 'Solar Street Lights - Chennai South', state: 'Tamil Nadu', district: 'Chennai', constituency: 'Chennai South', type: 'ELECTRICITY', status: 'COMPLETED', sanctionedAmount: 1500000, expenditure: 1490000, riskLevel: 'LOW', riskScore: 12, dataSource: 'SYNTHETIC_DEMO', createdAt: '2022-12-01' },
  { id: 'p10', name: 'Irrigation Canal - Kolkata North', state: 'West Bengal', district: 'Kolkata', constituency: 'Kolkata North', type: 'IRRIGATION', status: 'NOT_STARTED', sanctionedAmount: 9000000, expenditure: 0, riskLevel: 'MEDIUM', riskScore: 38, dataSource: 'SYNTHETIC_DEMO', createdAt: '2023-08-10' },
  { id: 'p11', name: 'Panchayat Bhawan - Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', constituency: 'Ahmedabad East', type: 'BUILDING', status: 'IN_PROGRESS', sanctionedAmount: 2500000, expenditure: 1200000, riskLevel: 'LOW', riskScore: 22, dataSource: 'SYNTHETIC_DEMO', createdAt: '2023-04-20' },
  { id: 'p12', name: 'Flood Protection Wall - Guwahati', state: 'Assam', district: 'Kamrup', constituency: 'Guwahati', type: 'FLOOD_PROTECTION', status: 'IN_PROGRESS', sanctionedAmount: 12000000, expenditure: 4000000, riskLevel: 'MEDIUM', riskScore: 61, dataSource: 'SYNTHETIC_DEMO', createdAt: '2023-01-15' },
];

export const FIXTURE_PROJECT_DETAIL = {
  id: 'p1',
  name: 'Rural Road Construction - Varanasi',
  description: 'Construction of 4.2 km rural road connecting Rampur village to NH-56 under MPLADS scheme.',
  state: 'Uttar Pradesh',
  district: 'Varanasi',
  constituency: 'Varanasi',
  mp: 'Demo MP Name',
  agency: 'District Rural Development Agency',
  type: 'ROAD',
  status: 'STALLED',
  sanctionedAmount: 5000000,
  expenditure: 4800000,
  startDate: '2023-04-01',
  expectedCompletionDate: '2023-10-01',
  actualCompletionDate: null,
  progressPercent: 62,
  dataSource: 'SYNTHETIC_DEMO',
  riskScore: 91,
  riskLevel: 'CRITICAL',
  riskReasons: [
    'Expenditure (96%) significantly exceeds physical progress (62%) — possible cost overrun',
    'Project stalled for 4+ months with no progress update recorded',
    'Sanctioned amount utilization rate is anomalously high relative to completion stage',
  ],
  anomalies: [
    { id: 'a1', type: 'COST_OVERRUN', severity: 'HIGH', message: 'Expenditure-to-progress ratio is 1.55x above expected range', evidence: 'Expected ratio ≤ 1.0 at this stage; actual ratio = 1.55', ruleId: 'RULE_COST_PROGRESS_RATIO' },
    { id: 'a2', type: 'STALL_DETECTION', severity: 'HIGH', message: 'No progress update in 120+ days', evidence: 'Last progress record: 2023-08-15; current date gap exceeds threshold', ruleId: 'RULE_STALL_DETECTION' },
    { id: 'a3', type: 'EXPENDITURE_SPIKE', severity: 'MEDIUM', message: 'Expenditure increased by 38% in a single reporting period', evidence: 'Period: Jul–Aug 2023; increase: ₹13.2L in one cycle', ruleId: 'RULE_EXPENDITURE_SPIKE' },
  ],
  financialRecords: [
    { period: 'Apr 2023', sanctioned: 5000000, released: 2000000, expenditure: 1200000 },
    { period: 'Jun 2023', sanctioned: 5000000, released: 3500000, expenditure: 2800000 },
    { period: 'Aug 2023', sanctioned: 5000000, released: 5000000, expenditure: 4800000 },
  ],
  progressRecords: [
    { date: '2023-05-01', progressPercent: 20, remarks: 'Site preparation complete' },
    { date: '2023-07-01', progressPercent: 45, remarks: 'Base layer laid' },
    { date: '2023-08-15', progressPercent: 62, remarks: 'Surface work in progress' },
  ],
};

export const FIXTURE_ALERTS = [
  { id: 'al1', projectId: 'p1', projectName: 'Rural Road Construction - Varanasi', anomalyType: 'COST_OVERRUN', severity: 'CRITICAL', riskScore: 91, message: 'Expenditure-to-progress ratio critically high. Immediate review recommended.', status: 'OPEN', createdAt: '2023-12-01T10:00:00Z', resolvedAt: null },
  { id: 'al2', projectId: 'p2', projectName: 'Community Hall - Patna Rural', anomalyType: 'DUPLICATE_WORK', severity: 'HIGH', riskScore: 88, message: 'Possible duplicate work detected with project p14 in same constituency.', status: 'UNDER_REVIEW', createdAt: '2023-11-28T09:00:00Z', resolvedAt: null },
  { id: 'al3', projectId: 'p3', projectName: 'Drinking Water Supply - Nagpur', anomalyType: 'STALL_DETECTION', severity: 'HIGH', riskScore: 79, message: 'Project stalled for 90+ days. No progress update received.', status: 'OPEN', createdAt: '2023-11-25T14:00:00Z', resolvedAt: null },
  { id: 'al4', projectId: 'p4', projectName: 'School Building - Jaipur North', anomalyType: 'DELAY', severity: 'HIGH', riskScore: 76, message: 'Project is 6 months past expected completion date with only 27% progress.', status: 'OPEN', createdAt: '2023-11-20T11:00:00Z', resolvedAt: null },
  { id: 'al5', projectId: 'p5', projectName: 'Drainage System - Lucknow East', anomalyType: 'EXPENDITURE_SPIKE', severity: 'HIGH', riskScore: 74, message: 'Expenditure spike of 38% in single reporting period detected.', status: 'UNDER_REVIEW', createdAt: '2023-11-15T08:00:00Z', resolvedAt: null },
  { id: 'al6', projectId: 'p6', projectName: 'Primary Health Centre - Bhopal', anomalyType: 'COMPLIANCE', severity: 'MEDIUM', riskScore: 45, message: 'Utilization certificate not submitted within required timeline.', status: 'RESOLVED', createdAt: '2023-10-10T10:00:00Z', resolvedAt: '2023-11-01T10:00:00Z' },
  { id: 'al7', projectId: 'p12', projectName: 'Flood Protection Wall - Guwahati', anomalyType: 'COST_OVERRUN', severity: 'MEDIUM', riskScore: 61, message: 'Cost deviation of 18% above sanctioned estimate detected.', status: 'FALSE_POSITIVE', createdAt: '2023-10-05T09:00:00Z', resolvedAt: '2023-10-20T09:00:00Z' },
];

export const FIXTURE_STATE_ANALYTICS = [
  { state: 'Uttar Pradesh', totalProjects: 210, sanctionedAmount: 850000000, expenditure: 620000000, avgRiskScore: 58, highRiskCount: 42, completedCount: 68 },
  { state: 'Bihar', totalProjects: 145, sanctionedAmount: 520000000, expenditure: 310000000, avgRiskScore: 62, highRiskCount: 38, completedCount: 41 },
  { state: 'Maharashtra', totalProjects: 132, sanctionedAmount: 680000000, expenditure: 490000000, avgRiskScore: 41, highRiskCount: 18, completedCount: 72 },
  { state: 'Rajasthan', totalProjects: 118, sanctionedAmount: 430000000, expenditure: 280000000, avgRiskScore: 49, highRiskCount: 22, completedCount: 55 },
  { state: 'Madhya Pradesh', totalProjects: 105, sanctionedAmount: 390000000, expenditure: 260000000, avgRiskScore: 44, highRiskCount: 15, completedCount: 48 },
  { state: 'Tamil Nadu', totalProjects: 98, sanctionedAmount: 360000000, expenditure: 310000000, avgRiskScore: 28, highRiskCount: 8, completedCount: 71 },
  { state: 'West Bengal', totalProjects: 92, sanctionedAmount: 340000000, expenditure: 195000000, avgRiskScore: 51, highRiskCount: 19, completedCount: 38 },
  { state: 'Gujarat', totalProjects: 88, sanctionedAmount: 320000000, expenditure: 240000000, avgRiskScore: 32, highRiskCount: 10, completedCount: 62 },
  { state: 'Telangana', totalProjects: 76, sanctionedAmount: 280000000, expenditure: 190000000, avgRiskScore: 38, highRiskCount: 12, completedCount: 44 },
  { state: 'Assam', totalProjects: 68, sanctionedAmount: 250000000, expenditure: 140000000, avgRiskScore: 55, highRiskCount: 16, completedCount: 28 },
];

export const FIXTURE_DISTRICT_ANALYTICS = [
  { district: 'Varanasi', state: 'Uttar Pradesh', totalProjects: 28, sanctionedAmount: 112000000, expenditure: 89000000, avgRiskScore: 64, highRiskCount: 8, completedCount: 9 },
  { district: 'Patna', state: 'Bihar', totalProjects: 24, sanctionedAmount: 96000000, expenditure: 58000000, avgRiskScore: 68, highRiskCount: 9, completedCount: 7 },
  { district: 'Nagpur', state: 'Maharashtra', totalProjects: 22, sanctionedAmount: 88000000, expenditure: 64000000, avgRiskScore: 42, highRiskCount: 4, completedCount: 14 },
  { district: 'Jaipur', state: 'Rajasthan', totalProjects: 20, sanctionedAmount: 80000000, expenditure: 52000000, avgRiskScore: 51, highRiskCount: 5, completedCount: 11 },
  { district: 'Lucknow', state: 'Uttar Pradesh', totalProjects: 19, sanctionedAmount: 76000000, expenditure: 61000000, avgRiskScore: 59, highRiskCount: 6, completedCount: 8 },
  { district: 'Bhopal', state: 'Madhya Pradesh', totalProjects: 18, sanctionedAmount: 72000000, expenditure: 48000000, avgRiskScore: 44, highRiskCount: 3, completedCount: 10 },
  { district: 'Chennai', state: 'Tamil Nadu', totalProjects: 17, sanctionedAmount: 68000000, expenditure: 58000000, avgRiskScore: 26, highRiskCount: 2, completedCount: 13 },
  { district: 'Ahmedabad', state: 'Gujarat', totalProjects: 16, sanctionedAmount: 64000000, expenditure: 46000000, avgRiskScore: 33, highRiskCount: 2, completedCount: 10 },
  { district: 'Kamrup', state: 'Assam', totalProjects: 15, sanctionedAmount: 60000000, expenditure: 32000000, avgRiskScore: 57, highRiskCount: 4, completedCount: 5 },
  { district: 'Hyderabad', state: 'Telangana', totalProjects: 14, sanctionedAmount: 56000000, expenditure: 38000000, avgRiskScore: 39, highRiskCount: 3, completedCount: 8 },
];

export const formatCurrency = (amount) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const RISK_LEVEL_CONFIG = {
  LOW: { label: 'Low', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', dot: 'bg-green-500' },
  MEDIUM: { label: 'Medium', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  HIGH: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200', dot: 'bg-orange-500' },
  CRITICAL: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200', dot: 'bg-red-500' },
};

export const STATUS_CONFIG = {
  COMPLETED: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-100' },
  NOT_STARTED: { label: 'Not Started', color: 'text-gray-600', bg: 'bg-gray-100' },
  STALLED: { label: 'Stalled', color: 'text-red-700', bg: 'bg-red-100' },
};

export const ALERT_SEVERITY_CONFIG = {
  CRITICAL: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' },
  HIGH: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300' },
  MEDIUM: { label: 'Medium', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  LOW: { label: 'Low', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300' },
};

export const ALERT_STATUS_CONFIG = {
  OPEN: { label: 'Open', color: 'text-red-700', bg: 'bg-red-50' },
  UNDER_REVIEW: { label: 'Under Review', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  RESOLVED: { label: 'Resolved', color: 'text-green-700', bg: 'bg-green-50' },
  FALSE_POSITIVE: { label: 'False Positive', color: 'text-gray-600', bg: 'bg-gray-50' },
};
