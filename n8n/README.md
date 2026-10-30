# AgencyOS n8n Workflow Automation & Multi-Agent Engine

This directory contains the production-ready n8n workflow definitions, sub-workflows, orchestration triggers, and deployment configurations powering AgencyOS's autonomous AI agent operations.

## Architecture

AgencyOS separates business data and authentication from workflow orchestration:
- **AgencyOS Backend (Express + TypeScript)**: Owns authentication, RBAC, customer CRM data in MongoDB, business rules, and API gateways.
- **MongoDB**: Authoritative business store for users, leads, clients, campaigns, and invoices.
- **n8n Orchestration Layer**: Manages asynchronous long-running AI tasks, web scraping, synthetic audits, and webhook dispatches.
- **n8n Internal PostgreSQL & Redis**: Dedicated execution database and queue manager for n8n workers.

## Workflows Catalog

### Canonical AI Agents (`n8n/workflows/agents/`)
1. `market-research`: Industry & demographic demand analysis
2. `prospect-discovery`: Google Maps & directory business candidate discovery
3. `lead-enrichment`: Domain, WHOIS, DNS & verified contact enrichment
4. `website-audit`: Automated Core Web Vitals, SEO & responsive audit
5. `lead-qualification`: Explainable rule-based scoring (0-100)
6. `outreach-strategy`: Personalized email/WhatsApp message sequence generator
7. `reply-classification`: Inbound intent classifier & objection handler
8. `meeting-coordination`: Calendar availability & slot reservation
9. `proposal-generation`: Scope-of-work (SOW) & pricing compiler
10. `client-onboarding`: Welcome sequence & credential collection tracker
11. `project-planning`: Agile task backlog & milestone scheduler
12. `website-qa`: Staging environment end-to-end regression audit
13. `maintenance`: Retainer SLA uptime & SSL certificate monitor

### Reusable Sub-Workflows (`n8n/workflows/sub-workflows/`)
- `data-validation`: Zod contract validation gate
- `deduplication`: Contact & business similarity engine
- `source-verification`: Data freshness & provenance checker
- `ai-generation`: LLM connector with retry & fallback
- `approval`: Human-in-the-loop approval gatekeeper
- `notification`: Multi-channel webhook/email dispatcher
- `error-handler`: Dead-letter queue & exception alerting

## CLI Lifecycle Commands

```bash
# Validate syntax and connections across all 24 workflows
npx tsx n8n/scripts/validate/validate-workflows.ts

# Import workflows to active n8n instance
npx tsx n8n/scripts/import/import-workflows.ts

# Deploy workflows to staging / production
npx tsx n8n/scripts/deploy/deploy-workflows.ts staging
```

## Running n8n Locally with Docker

```bash
docker compose -f n8n/docker/docker-compose.n8n.yml up -d
```
Access the n8n dashboard at `http://localhost:5678`.

