/*
IMPLEMENTATION PROMPT
FILE: frontend/src/main.jsx
PURPOSE:
Bootstrap the React application and render the application shell with router and global providers.

PROJECT CONTEXT:
The frontend is the UI layer for MPLADS Sentinel and provides role-aware views for dashboard, analytics, projects, alerts, and auth.

TECHNOLOGIES:
React, Vite, React Router

INPUTS:
- Browser environment
- Route definitions
- Global app settings

OUTPUTS:
- Mounted React app with route tree and top-level providers

DEPENDENCIES:
- App.jsx
- routes or route definitions
- auth context (when implemented)

DATABASE DEPENDENCIES:
- None directly

API DEPENDENCIES:
- Backend API service calls are handled by feature modules and hooks

BUSINESS RULES:
- Protected routes must require authentication checks in route guards
- Public routes should cover login and landing pages

ERROR HANDLING:
- Catch rendering issues and show a graceful fallback route if needed

SECURITY REQUIREMENTS:
- Do not store JWT tokens in insecure global state without a defined security plan

ACCEPTANCE CRITERIA:
- App renders without runtime errors
- Router and page structure are ready for feature development

WHAT NOT TO CHANGE:
- Do not implement domain logic here
- Do not directly connect to PostgreSQL or ML service

IMPLEMENTATION NOTES:
- Keep the bootstrap file minimal and focused on mount-time setup
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
