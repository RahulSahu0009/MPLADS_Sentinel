# Anupam — Repository Contract Specification

## 1. Purpose

Define the interface between Anupam's PostgreSQL/Prisma layer and Rahil's backend service/risk layer.

The repository is the persistence boundary. Business rules belong in services/rules, not in repository code.

## 2. Project Repository

### File
`backend/src/repositories/project.repository.js`

### Required capabilities
- Filter projects
- Paginate projects
- Retrieve project details
- Create project records where required
- Update project records where required
- Support stable service-layer queries

### Contract template

#### Method: `findProjects`
**Purpose:** Return projects matching approved filters.

**Inputs:**
- Filter object defined by approved API/domain contract
- Pagination input

**Outputs:**
- Project collection
- Pagination metadata

**Rules:**
- Do not perform HTTP concerns.
- Do not perform risk scoring.
- Do not silently rename fields.

#### Method: `findProjectById`
**Purpose:** Retrieve a project and the approved related information required by the service.

**Input:** Project identifier.

**Output:** Project record or approved not-found result.

#### Method: `createProject`
**Purpose:** Persist an approved project create payload.

#### Method: `updateProject`
**Purpose:** Persist an approved project update payload.

## 3. Risk Repository

### File
`backend/src/repositories/risk.repository.js`

### Required capabilities
- Persist a risk snapshot.
- Retrieve the latest risk snapshot.
- Persist/retrieve explainable evidence.
- Maintain project relationship.

### Important persisted concepts
- Project reference
- Risk score/level as approved by the risk contract
- Evidence/reasons
- Supporting values/features where required
- Timestamp/version metadata where required

## 4. Alert Repository

### File
`backend/src/repositories/alert.repository.js`

### Required capabilities
- Create/persist alerts.
- Filter/list alerts.
- Update alert status as allowed by domain rules.
- Maintain project linkage.

## 5. Repository Design Rules

- Repositories are persistence adapters.
- Do not put risk scoring into repositories.
- Do not call external ML services from repositories.
- Keep Prisma details inside the repository/config layer.
- Return stable domain-friendly shapes.
- Preserve numeric precision for financial fields.
- Use transactions where the approved domain contract requires atomicity.
- Document any assumptions.

## 6. Return Shape Review

Before Rahil implements a service call, Anupam and Rahil must agree on:

- field names
- nested relations
- nullability
- collection format
- pagination format
- timestamps
- error/not-found behavior

## 7. Example Contract Format

```text
Method: findProjects
Input:
  filters: approved project filter object
  pagination: { page, pageSize }

Output:
  {
    items: [...],
    pagination: {
      page,
      pageSize,
      total
    }
  }

Not Found:
  Empty collection for list query; single-record behavior agreed separately.

Validation:
  Invalid filter input is rejected at the approved validator/service boundary.
```

The actual final JSON/object shape must be frozen with Rahul/Rahil before implementation.

## 8. Contract Acceptance Checklist

- [ ] Method name agreed
- [ ] Inputs agreed
- [ ] Required/optional fields agreed
- [ ] Return shape agreed
- [ ] Not-found behavior agreed
- [ ] Pagination agreed
- [ ] Transaction behavior agreed
- [ ] Error handling agreed
- [ ] Example response shared with Rahil
