/*
IMPLEMENTATION PROMPT
FILE: frontend/src/services/api.js
PURPOSE:
Create a central Axios instance for backend API requests, environment-aware base URL configuration, and request/response interceptors.

PROJECT CONTEXT:
This app uses a single backend API to provide dashboard, project, analytics, risk, and alert data.

TECHNOLOGIES:
Axios, React, Vite

INPUTS:
- Base URL from environment variables
- JWT token state, where applicable

OUTPUTS:
- Configured Axios instance with consistent request and error handling

DEPENDENCIES:
- Vite environment variables or a local default API base URL

DATABASE DEPENDENCIES:
- None directly

API DEPENDENCIES:
- All backend endpoints

BUSINESS RULES:
- Keep base configuration environment-specific
- Attach auth headers to protected requests only

ERROR HANDLING:
- Centralize API error handling so pages remain simpler

SECURITY REQUIREMENTS:
- Never expose tokens or secrets unnecessarily

ACCEPTANCE CRITERIA:
- A stable API client is available across all frontend services
- Error handling is consistent for unauthorized, validation, and server failures

WHAT NOT TO CHANGE:
- Do not place domain business logic in the API client
- Do not create multiple conflicting Axios instances

IMPLEMENTATION NOTES:
- Keep this file small and generic so feature-specific services can build on top of it
*/

import axios from 'axios';

const getToken = () => {
  // TODO: read auth token from a secure frontend storage layer
  return localStorage.getItem('mplads_token') || null;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // TODO: redirect to login or clear auth state
    }

    if (status === 403) {
      // TODO: handle authorization restrictions for restricted routes
    }

    return Promise.reject(error);
  }
);
