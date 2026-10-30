#!/usr/bin/env bash
set -e

ENV_TARGET="${1:-staging}"
echo "[Deploy] Initiating AgencyOS production deployment pipeline for $ENV_TARGET..."

# 1. Typecheck and Test
npm run typecheck:api
npm test

# 2. Build Backend
npm run build:api

# 3. Build Frontend
npm run build

# 4. Deploy n8n Workflows
npx tsx n8n/scripts/deploy/deploy-workflows.ts "$ENV_TARGET"

echo "[Deploy] AgencyOS deployment pipeline completed successfully."

