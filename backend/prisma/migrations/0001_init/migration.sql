-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('OFFICIAL_MPLADS', 'SYNTHETIC_DEMO');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'FALSE_POSITIVE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'SANCTIONED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AnomalyType" AS ENUM ('COST_OVERRUN', 'FUND_UTILIZATION_ANOMALY', 'PROJECT_DELAY', 'POTENTIAL_DUPLICATE', 'EXPENDITURE_ANOMALY', 'COMPLIANCE_DEVIATION', 'DATA_INCONSISTENCY', 'POTENTIAL_IRREGULARITY');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MINISTRY_AUTHORITY', 'STATE_AUTHORITY', 'DISTRICT_AUTHORITY', 'ANALYST');

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "roleId" TEXT NOT NULL,
    "stateId" TEXT,
    "districtId" TEXT,
    "constituencyId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "stateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Constituency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "districtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Constituency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MP" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "constituencyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSourceRecord" (
    "id" TEXT NOT NULL,
    "sourceType" "DataSource" NOT NULL,
    "sourceUrl" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refreshVersion" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,

    CONSTRAINT "DataSourceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "projectType" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNED',
    "sanctionedAmount" DECIMAL(18,2) NOT NULL,
    "estimatedCost" DECIMAL(18,2),
    "totalExpenditure" DECIMAL(18,2) NOT NULL,
    "workOrderDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "expectedCompletionDate" TIMESTAMP(3),
    "actualCompletionDate" TIMESTAMP(3),
    "progressPercentage" DECIMAL(5,2),
    "districtId" TEXT,
    "constituencyId" TEXT,
    "stateId" TEXT,
    "agencyId" TEXT,
    "mpId" TEXT,
    "dataSourceId" TEXT,
    "dataSourceType" "DataSource" NOT NULL DEFAULT 'OFFICIAL_MPLADS',
    "isSyntheticDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialRecord" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "recordDate" TIMESTAMP(3) NOT NULL,
    "sanctionedAmount" DECIMAL(18,2),
    "expenditure" DECIMAL(18,2),
    "utilizationRatio" DECIMAL(10,4),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressRecord" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "recordDate" TIMESTAMP(3) NOT NULL,
    "progressPercentage" DECIMAL(5,2),
    "physicalProgress" DECIMAL(5,2),
    "financialProgress" DECIMAL(5,2),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anomaly" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "anomalyType" "AnomalyType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "ruleId" TEXT,
    "description" TEXT NOT NULL,
    "evidence" JSONB,
    "relevantValues" JSONB,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anomaly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskScore" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "reasons" JSONB NOT NULL,
    "contributingSignals" JSONB,
    "modelVersion" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "anomalyId" TEXT,
    "alertId" TEXT NOT NULL,
    "anomalyType" "AnomalyType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "actorId" TEXT,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AggregateStatistic" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "stateName" TEXT,
    "districtName" TEXT,
    "year" INTEGER,
    "month" INTEGER,
    "totalProjects" INTEGER,
    "totalSanctionedAmount" DECIMAL(18,2),
    "totalExpenditure" DECIMAL(18,2),
    "meanUtilizationRatio" DECIMAL(10,4),
    "highRiskCount" INTEGER,
    "criticalRiskCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AggregateStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_stateId_idx" ON "User"("stateId");

-- CreateIndex
CREATE INDEX "User_districtId_idx" ON "User"("districtId");

-- CreateIndex
CREATE INDEX "User_constituencyId_idx" ON "User"("constituencyId");

-- CreateIndex
CREATE UNIQUE INDEX "State_name_key" ON "State"("name");

-- CreateIndex
CREATE UNIQUE INDEX "State_code_key" ON "State"("code");

-- CreateIndex
CREATE INDEX "State_name_idx" ON "State"("name");

-- CreateIndex
CREATE INDEX "District_stateId_idx" ON "District"("stateId");

-- CreateIndex
CREATE INDEX "District_name_idx" ON "District"("name");

-- CreateIndex
CREATE UNIQUE INDEX "District_stateId_name_key" ON "District"("stateId", "name");

-- CreateIndex
CREATE INDEX "Constituency_districtId_idx" ON "Constituency"("districtId");

-- CreateIndex
CREATE INDEX "Constituency_name_idx" ON "Constituency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Constituency_districtId_name_key" ON "Constituency"("districtId", "name");

-- CreateIndex
CREATE INDEX "MP_constituencyId_idx" ON "MP"("constituencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_name_key" ON "Agency"("name");

-- CreateIndex
CREATE INDEX "Agency_name_idx" ON "Agency"("name");

-- CreateIndex
CREATE INDEX "DataSourceRecord_sourceType_idx" ON "DataSourceRecord"("sourceType");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_stateId_idx" ON "Project"("stateId");

-- CreateIndex
CREATE INDEX "Project_districtId_idx" ON "Project"("districtId");

-- CreateIndex
CREATE INDEX "Project_constituencyId_idx" ON "Project"("constituencyId");

-- CreateIndex
CREATE INDEX "Project_agencyId_idx" ON "Project"("agencyId");

-- CreateIndex
CREATE INDEX "Project_mpId_idx" ON "Project"("mpId");

-- CreateIndex
CREATE INDEX "Project_dataSourceType_idx" ON "Project"("dataSourceType");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "Project_expectedCompletionDate_idx" ON "Project"("expectedCompletionDate");

-- CreateIndex
CREATE INDEX "Project_status_createdAt_idx" ON "Project"("status", "createdAt");

-- CreateIndex
CREATE INDEX "FinancialRecord_projectId_recordDate_idx" ON "FinancialRecord"("projectId", "recordDate");

-- CreateIndex
CREATE INDEX "FinancialRecord_recordDate_idx" ON "FinancialRecord"("recordDate");

-- CreateIndex
CREATE INDEX "ProgressRecord_projectId_recordDate_idx" ON "ProgressRecord"("projectId", "recordDate");

-- CreateIndex
CREATE INDEX "ProgressRecord_recordDate_idx" ON "ProgressRecord"("recordDate");

-- CreateIndex
CREATE INDEX "Anomaly_projectId_idx" ON "Anomaly"("projectId");

-- CreateIndex
CREATE INDEX "Anomaly_anomalyType_idx" ON "Anomaly"("anomalyType");

-- CreateIndex
CREATE INDEX "Anomaly_severity_idx" ON "Anomaly"("severity");

-- CreateIndex
CREATE INDEX "Anomaly_createdAt_idx" ON "Anomaly"("createdAt");

-- CreateIndex
CREATE INDEX "RiskScore_projectId_idx" ON "RiskScore"("projectId");

-- CreateIndex
CREATE INDEX "RiskScore_riskLevel_idx" ON "RiskScore"("riskLevel");

-- CreateIndex
CREATE INDEX "RiskScore_calculatedAt_idx" ON "RiskScore"("calculatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_alertId_key" ON "Alert"("alertId");

-- CreateIndex
CREATE INDEX "Alert_projectId_idx" ON "Alert"("projectId");

-- CreateIndex
CREATE INDEX "Alert_status_idx" ON "Alert"("status");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_event_idx" ON "AuditLog"("event");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_projectId_idx" ON "AuditLog"("projectId");

-- CreateIndex
CREATE INDEX "AggregateStatistic_stateName_idx" ON "AggregateStatistic"("stateName");

-- CreateIndex
CREATE INDEX "AggregateStatistic_districtName_idx" ON "AggregateStatistic"("districtName");

-- CreateIndex
CREATE INDEX "AggregateStatistic_year_month_idx" ON "AggregateStatistic"("year", "month");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "Constituency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Constituency" ADD CONSTRAINT "Constituency_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MP" ADD CONSTRAINT "MP_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "Constituency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "Constituency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_mpId_fkey" FOREIGN KEY ("mpId") REFERENCES "MP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSourceRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialRecord" ADD CONSTRAINT "FinancialRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressRecord" ADD CONSTRAINT "ProgressRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anomaly" ADD CONSTRAINT "Anomaly_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskScore" ADD CONSTRAINT "RiskScore_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_anomalyId_fkey" FOREIGN KEY ("anomalyId") REFERENCES "Anomaly"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AggregateStatistic" ADD CONSTRAINT "AggregateStatistic_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSourceRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

