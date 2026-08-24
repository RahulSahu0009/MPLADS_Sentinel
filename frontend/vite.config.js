/*
IMPLEMENTATION PROMPT
FILE: frontend/vite.config.js
PURPOSE:
Configure Vite for the React frontend and define the local development server and build settings.

PROJECT CONTEXT:
This frontend is the dashboard and workflow UI for MPLADS risk monitoring.

TECHNOLOGIES:
React, Vite, JavaScript or TypeScript, Tailwind CSS

INPUTS:
- Local dev server configuration
- Optional proxy configuration to the backend API

OUTPUTS:
- Vite configuration object

DEPENDENCIES:
- React plugin for Vite

DATABASE DEPENDENCIES:
- None directly

API DEPENDENCIES:
- Backend service URL via VITE_API_BASE_URL or proxy configuration

BUSINESS RULES:
- Keep API base config explicit and environment-driven
- Limit local dev server port to avoid conflicts

ERROR HANDLING:
- Fail early on invalid config values

SECURITY REQUIREMENTS:
- Do not expose backend secrets to the frontend

ACCEPTANCE CRITERIA:
- Frontend starts locally and compiles correctly
- API calls can be routed through a dev proxy when configured

WHAT NOT TO CHANGE:
- Do not add backend code here
- Do not embed secrets in config files

IMPLEMENTATION NOTES:
- This file is intentionally minimal and should remain environment-safe
*/

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
