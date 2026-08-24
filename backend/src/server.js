/*
IMPLEMENTATION PROMPT
FILE: backend/src/server.js
PURPOSE:
Start the Express HTTP server and bind the application to the configured port.

PROJECT CONTEXT:
This backend serves the MPLADS Sentinel API to the React frontend and orchestrates downstream ML analysis.

TECHNOLOGIES:
Node.js, Express, JavaScript

INPUTS:
- app.js
- environment configuration

OUTPUTS:
- Running HTTP server instance

DEPENDENCIES:
- ./app.js
- ./config/env.js

DATABASE DEPENDENCIES:
- Prisma initialization occurs during app startup

API DEPENDENCIES:
- ML service URL is loaded at runtime from env configuration

BUSINESS RULES:
- Keep startup logic simple and explicit

ERROR HANDLING:
- Report startup failure clearly and exit when required

SECURITY REQUIREMENTS:
- Do not expose debug secrets in runtime logs

ACCEPTANCE CRITERIA:
- Server binds successfully on the configured port and is ready for requests

WHAT NOT TO CHANGE:
- Do not add business logic or route definitions here

IMPLEMENTATION NOTES:
- Keep startup and environment concerns separate from domain logic
*/

import { app } from './app.js';
import { config } from './config/env.js';

const port = config.port;

app.listen(port, () => {
  console.log(`MPLADS Sentinel backend listening on port ${port}`);
});
