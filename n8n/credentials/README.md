# n8n Credentials Management & Security Policy

All credentials used within AgencyOS n8n workflows are strictly managed via logical references and n8n environment variables.

## Core Rules

1. **Never Commit Plaintext Secrets**: Workflow JSON files stored in `n8n/workflows/` must only contain logical credential names (e.g. `openAiApi`, `googleMapsApi`, `agencyOsBackendHmac`).
2. **Dedicated n8n Internal Store**: Production credentials are encrypted at rest using `N8N_ENCRYPTION_KEY` inside the PostgreSQL execution database.
3. **SSRF & Sandbox Protection**: Outbound HTTP requests from n8n are restricted to approved webhook targets and AgencyOS backend routes (`/api/v1/n8n/*`).
4. **Environment Isolation**: Staging and Production utilize separate API keys and webhook signing secrets.

