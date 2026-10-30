# AgencyOS Automated Quality Assurance & Test Strategy

## 1. Principles

1. **Evidence-Based Progress**: No feature is marked complete without deterministic test output.
2. **Zero Fake Success**: Tests probe live runtime behavior or validated database mock boundaries.
3. **Multi-Layer Validation**: Coverage across Unit, Contract, Security, Integration, n8n Topology, and E2E journeys.

## 2. Test Architecture

```text
tests/
├── unit/             # Isolated unit tests for algorithms, services, and models
├── contract/         # Zod & OpenAPI schema contract compliance
├── security/         # Authentication, RBAC, tenant isolation, Helmet headers
├── n8n/              # Syntax and connection topology checks for all 24 n8n workflows
├── integration/      # Multi-module database and external gateway flows
├── e2e/              # Playwright browser end-to-end journey tests
└── fixtures/         # Deterministic multi-tenant test payloads
```

## 3. Test Execution Matrix

| Test Suite | File | Focus | Tests Count |
|---|---|---|:---:|
| Core Validation | `tests/unit/validations.test.ts` | Zod validators for leads, users, campaigns | 5 |
| Monorepo Packages | `tests/unit/packages.test.ts` | Multi-package contract bindings | 8 |
| Authentication | `tests/unit/auth.test.ts` | JWT hashing, bearer token verification | 3 |
| UI Components | `tests/unit/components.test.tsx` | React 19 UI component rendering | 3 |
| REST API | `tests/unit/express-api.test.ts` | Express endpoint contracts & probe | 5 |
| Google Maps Platform | `tests/unit/maps-integration.test.ts` | Places API & Location Intelligence | 5 |
| AI Agent Orchestrator | `tests/unit/agents-13.test.ts` | 13 System Agents via REST API | 6 |
| Backend Modules | `tests/unit/modules.test.ts` | Modular architecture & registry | 5 |
| Billing & Templates | `tests/unit/billing-templates.test.ts` | Invoices, metrics, template application | 6 |
| Integrations & Audit | `tests/unit/integrations-lead-audit.test.ts` | 7 Providers, Diagnostics, Webhook test | 6 |
| Stripe Webhook | `tests/unit/stripe-webhook.test.ts` | Webhook idempotency & state updates | 3 |
| n8n Bi-Directional Sync | `tests/unit/n8n-sync.test.ts` | Lead audit ingest, prospect sync, triggers | 4 |
| Multi-Tenant Teams | `tests/unit/teams.test.ts` | Member list, invite, update role, delete | 4 |
| n8n Workflow Topology | `tests/n8n/workflows.test.ts` | All 24 n8n workflows on disk | 3 |
| Security & RBAC | `tests/security/auth-boundaries.test.ts` | 401 unauth checks & Helmet headers | 2 |
| API Contracts | `tests/contract/api-contracts.test.ts` | Schema validations for core entities | 4 |
| **Total Automated** | | | **72** |

## 4. Running Tests

```bash
# Run all unit, security, contract, and n8n tests
npm test

# Run Playwright browser E2E workflows
npm run test:e2e

# Run backend TypeScript verification
npm run typecheck:api

# Run Next.js frontend TypeScript verification
npm run typecheck
```
