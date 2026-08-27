# Anupam Repository Method Contracts (Implemented Baseline)

This document reflects the repository methods now implemented in code and available for service integration.

## Project Repository

Source: [project.repository.js](C:/Users/rohan/Desktop/sih/MPLADS_Sentinel/backend/src/repositories/project.repository.js)

### `findMany(filters = {})`

- Input:
  - `filters.page`, `filters.pageSize`
  - optional filters: `status`, `stateId`, `districtId`, `constituencyId`, `agencyId`, `mpId`, `dataSourceType`, `isSyntheticDemo`, `search`
- Output:
  - `{ items, pagination }`
  - pagination shape: `{ page, pageSize, total, totalPages }`
- Behavior:
  - page defaults to 1, pageSize defaults to 25, max pageSize 100
  - returns latest risk snapshot (`riskScores` take 1) and core relation metadata

### `findById(projectId)`

- Input: `projectId` (required)
- Output: Project row with related state/district/constituency/agency/mp/dataSource plus recent financial/progress/anomaly/alert/risk records.
- Not-found: `null` from Prisma `findUnique`.

### `create(data)`

- Input: Prisma-compatible `Project` create payload
- Output: Created project row

### `update(projectId, data)`

- Input:
  - `projectId` (required)
  - Prisma-compatible update payload
- Output: Updated project row

## Risk Repository

Source: [risk.repository.js](C:/Users/rohan/Desktop/sih/MPLADS_Sentinel/backend/src/repositories/risk.repository.js)

### `create(riskPayload)`

- Required fields:
  - `projectId`
  - `riskScore` (0..100)
  - `riskLevel`
  - `reasons` (non-empty array)
- Optional fields:
  - `contributingSignals`
  - `modelVersion`
  - `calculatedAt`
- Output: Created `RiskScore` row

### `findLatestByProjectId(projectId)`

- Input: `projectId` (required)
- Output: Latest `RiskScore` by `calculatedAt desc` or `null`

## Alert Repository

Source: [alert.repository.js](C:/Users/rohan/Desktop/sih/MPLADS_Sentinel/backend/src/repositories/alert.repository.js)

### `create(alertData)`

- Required fields:
  - `projectId`
  - `alertId` (external/business identifier)
  - `anomalyType`
  - `severity`
  - `riskScore` (numeric)
  - `message`
- Output: Created `Alert` row

### `findMany(filters = {})`

- Input:
  - `filters.page`, `filters.pageSize`
  - optional filters: `status`, `projectId`, `severity`, `anomalyType`, `sortDirection`
- Output:
  - `{ items, pagination }`
- Includes:
  - linked project summary (`id`, `title`, `status`, `state`, `district`)
  - linked anomaly row

### `update(alertId, updates)`

- Input:
  - `alertId` (required)
  - update payload
- Behavior:
  - auto-sets `resolvedAt` when status transitions to `RESOLVED` or `FALSE_POSITIVE` and timestamp was not supplied
- Output: Updated `Alert` row
