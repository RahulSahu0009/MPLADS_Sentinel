/*
IMPLEMENTATION PROMPT
FILE: frontend/src/pages/ProjectDetailPage.jsx
PURPOSE:
Implement the single-project detail page that explains why a project was flagged and summarizes all operational and risk context.

PROJECT CONTEXT:
This page is the most important UI for user understanding: it should show project information, financial data, progress, timeline, anomalies, and explainable risk reasons.

TECHNOLOGIES:
React, Tailwind CSS, Axios

INPUTS:
- Project detail from GET /api/projects/:id
- Risk scores and anomaly data from GET /api/projects/:id/risk and GET /api/projects/:id/anomalies
- Similar projects from duplicate detection or analytics services

OUTPUTS:
- Full project evidence summary including why the project was flagged

DEPENDENCIES:
- components/RiskExplanationPanel.jsx
- components/AnomalyList.jsx
- services/projectService.js

DATABASE DEPENDENCIES:
- None directly

API DEPENDENCIES:
- GET /api/projects/:id
- GET /api/projects/:id/anomalies
- GET /api/projects/:id/risk

BUSINESS RULES:
- The UI must explain the reason for a flag in plain language based on evidence and model output
- It must distinguish current risk vs predicted / early-warning risk when present
- Synthetic demo data must be clearly labeled

ERROR HANDLING:
- Show a clear error if the project or its related risk data is not found

SECURITY REQUIREMENTS:
- Respect role-based access to project details and risk explanations

ACCEPTANCE CRITERIA:
- The page clearly explains each risk factor
- Users can review anomalies, rule violations, similar projects, and risk history in one screen

WHAT NOT TO CHANGE:
- Do not display raw database internals or unfiltered ML internals
- Do not hide evidence required for explainability

IMPLEMENTATION NOTES:
- Build this page around a clear evidence-first explanation model rather than a generic info card layout
*/

export default function ProjectDetailPage() {
  return <div>Project detail page pending implementation</div>;
}
