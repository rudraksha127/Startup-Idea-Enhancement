# AgencyOS Master Plan — Index

**Programme:** Autonomous Agency OS → production-grade Agency-as-a-Service platform
**Stage:** A — Planning only (no implementation)
**Baseline commit:** `d1be2124df6075df9c6e4dac353d3b105497ae3c`
**Research date for external sources:** 17 November 2026
**Status of this corpus:** PROPOSED. Nothing in this folder has been implemented.
**Authorisation state:** Awaiting explicit founder approval for Stage B.

---

## 1. What this corpus is

47 numbered planning documents plus this index. Each document is written to be actionable by an engineer or operator without further interpretation, and each material claim carries an evidence label (see `01_METHOD_AND_EVIDENCE_STANDARD.md`).

Nothing here modifies application source, configuration, database schema, integrations, or deployment. All writes are confined to `planning-output/agencyos-master-plan/`.

---

## 2. Reading paths

| Reader | Path |
|---|---|
| **Founder, 20 minutes** | `00_EXECUTIVE_SUMMARY.md` → `FOUNDER_PRESENTATION.md` → `46_FINAL_RECOMMENDATIONS_AND_OPEN_DECISIONS.md` |
| **Founder, 2 hours** | Above, plus `03_VERIFICATION_RESULTS.md`, `14_SYNTHETIC_DATA_INTEGRITY_AUDIT.md`, `18_TECHNICAL_DEBT_REGISTER.md`, `39_COMPLIANCE_FRAMEWORK.md`, `42_ROADMAP_M0_M12.md`, `40_RISK_REGISTER.md` |
| **New engineer onboarding** | `04_CURRENT_ARCHITECTURE_AS_BUILT.md` → `05`/`06`/`07` → `26_DOMAIN_MODEL_AND_BOUNDED_CONTEXTS.md` → `27_TARGET_ARCHITECTURE.md` |
| **Engineering lead scoping M1** | `18_TECHNICAL_DEBT_REGISTER.md` → `27` → `28` → `34` → `35` → `43_TASK_BACKLOG.md` → `44_TESTING_AND_ACCEPTANCE_FRAMEWORK.md` |
| **AI/agent engineer** | `09_AGENT_ORCHESTRATION_AUDIT.md` → `29_AGENT_RUNTIME_DESIGN.md` → `31_LLM_GATEWAY_AND_MODEL_ROUTING.md` → `32_RAG_MEMORY_AND_KNOWLEDGE.md` → `37_OBSERVABILITY_EVALS_AI_QUALITY.md` |
| **Compliance / legal reviewer** | `13_SECURITY_PRIVACY_SECRETS_AUDIT.md` → `38_SECURITY_ARCHITECTURE_AND_THREAT_MODEL.md` → `39_COMPLIANCE_FRAMEWORK.md` |
| **Product / GTM** | `19_PRODUCT_VISION_AND_POSITIONING.md` → `20_CUSTOMER_SEGMENTS_AND_JOBS_TO_BE_DONE.md` → `21_SERVICE_CATALOG_AND_DELIVERY_MODEL.md` → `24_PRICING_AND_UNIT_ECONOMICS.md` |
| **Auditor / diligence** | `01` → `02` → `03` → `45_TRACEABILITY_MATRIX.md` |

---

## 3. Document map

### Part 0 — Orientation and evidence

| # | Document | Purpose |
|---|---|---|
| 00 | `00_EXECUTIVE_SUMMARY.md` | The whole finding and recommendation on two pages |
| 01 | `01_METHOD_AND_EVIDENCE_STANDARD.md` | Evidence-label taxonomy, verification method, limits of this audit |
| 02 | `02_REPOSITORY_BASELINE_AND_INVENTORY.md` | Exact baseline: commit, tree, file counts, tracked artefacts |
| 03 | `03_VERIFICATION_RESULTS.md` | Raw command results: typecheck, tests, build |

### Part I — The system as it actually exists

| # | Document | Purpose |
|---|---|---|
| 04 | `04_CURRENT_ARCHITECTURE_AS_BUILT.md` | What the code really deploys, versus what is described |
| 05 | `05_FRONTEND_AUDIT.md` | Route inventory, page health, static-only surfaces |
| 06 | `06_BACKEND_AND_API_AUDIT.md` | 42 routes, 209 backend files, contract quality |
| 07 | `07_DATA_MODEL_AND_PERSISTENCE_AUDIT.md` | Four model universes, ZCQL/Mongo duality, fallback chains |
| 08 | `08_AUTH_IDENTITY_TENANCY_AUDIT.md` | Auth bypasses, shared demo org, missing middleware |
| 09 | `09_AGENT_ORCHESTRATION_AUDIT.md` | 13 stub agents, fake runs, canned approvals |
| 10 | `10_N8N_WORKFLOW_AUDIT.md` | 25 generated workflows, licence exposure |
| 11 | `11_INTEGRATIONS_AUDIT.md` | Maps, email, WhatsApp, Stripe, CRM connectors |
| 12 | `12_LLM_PROVIDER_AUDIT.md` | Provider abstraction, mock returns, key handling |
| 13 | `13_SECURITY_PRIVACY_SECRETS_AUDIT.md` | Secrets, access control, data exposure |
| 14 | `14_SYNTHETIC_DATA_INTEGRITY_AUDIT.md` | Fabricated metrics, fake leads, trust damage inventory |
| 15 | `15_OBSERVABILITY_TESTING_CI_AUDIT.md` | What CI gates, what it only pretends to gate |
| 16 | `16_DEVOPS_BUILD_DEPLOY_AUDIT.md` | OpenNext/Workers, broken Dockerfiles, drift |
| 17 | `17_DOCUMENTATION_AND_ADR_CONTRADICTIONS.md` | ADR-004 vs ADR-005 vs reality |
| 18 | `18_TECHNICAL_DEBT_REGISTER.md` | 106 ranked debt items with severity and exit cost |

### Part II — Product definition

| # | Document | Purpose |
|---|---|---|
| 19 | `19_PRODUCT_VISION_AND_POSITIONING.md` | What the product is, and refuses to be |
| 20 | `20_CUSTOMER_SEGMENTS_AND_JOBS_TO_BE_DONE.md` | ICPs, jobs, anti-ICPs |
| 21 | `21_SERVICE_CATALOG_AND_DELIVERY_MODEL.md` | Service lines, deliverables, SLAs, human touchpoints |
| 22 | `22_CAPABILITY_MAP.md` | Capability → surface → status → milestone |
| 23 | `23_INFORMATION_ARCHITECTURE_AND_UX.md` | Navigation, workspace model, visual identity preservation |
| 24 | `24_PRICING_AND_UNIT_ECONOMICS.md` | Cost model, credit unit, margin floors — framework only |
| 25 | `25_OPERATING_MODEL_AND_SOP.md` | How a real agency runs on this system |
| 26 | `26_DOMAIN_MODEL_AND_BOUNDED_CONTEXTS.md` | Authoritative entity set, one status enum, invariants |

### Part III — Target architecture

| # | Document | Purpose |
|---|---|---|
| 27 | `27_TARGET_ARCHITECTURE.md` | The target system, boundaries, and migration shape |
| 28 | `28_DATA_PERSISTENCE_AND_CATALYST_STRATEGY.md` | Catalyst as system of record; where Postgres/Redis are legitimate |
| 29 | `29_AGENT_RUNTIME_DESIGN.md` | Real agent execution, tool contracts, budgets, determinism |
| 30 | `30_WORKFLOW_ENGINE_DECISION_TEMPORAL_VS_N8N.md` | Durable execution decision and blast-radius analysis |
| 31 | `31_LLM_GATEWAY_AND_MODEL_ROUTING.md` | Gateway, routing, cost caps, structured output |
| 32 | `32_RAG_MEMORY_AND_KNOWLEDGE.md` | Knowledge bases, retrieval, memory tiers |
| 33 | `33_INTEGRATION_HUB_AND_CONNECTOR_CONTRACTS.md` | Connector interface, idempotency, dry-run |
| 34 | `34_AUTH_TENANCY_PERMISSIONS.md` | Identity, org isolation, RBAC, RLS-equivalent |
| 35 | `35_APPROVAL_GATES_AND_POLICY.md` | Human-in-the-loop, policy engine, spend gates |
| 36 | `36_CREDITS_LEDGER_AND_BILLING_DESIGN.md` | Double-entry ledger on ZCQL's constraints |
| 37 | `37_OBSERVABILITY_EVALS_AI_QUALITY.md` | Traces, evals, regression gates |
| 38 | `38_SECURITY_ARCHITECTURE_AND_THREAT_MODEL.md` | Threat model, controls, incident response |

### Part IV — Compliance and risk

| # | Document | Purpose |
|---|---|---|
| 39 | `39_COMPLIANCE_FRAMEWORK.md` | Google Maps TOS, DPDP 2023 + Rules 2025, TRAI TCCCPR, WhatsApp |
| 40 | `40_RISK_REGISTER.md` | 42 risks, scored, with owners and kill criteria |

### Part V — Execution

| # | Document | Purpose |
|---|---|---|
| 41 | `41_TECHNOLOGY_EVALUATION.md` | Hermes, LangGraph, OpenHands, Temporal, n8n, Qdrant, LiteLLM, Langfuse, OPA/OpenFGA — adopt/reject with reasons |
| 42 | `42_ROADMAP_M0_M12.md` | 13 milestones, exit criteria, sequencing logic |
| 43 | `43_TASK_BACKLOG.md` | 148 tasks, sized, dependencies, acceptance |
| 44 | `44_TESTING_AND_ACCEPTANCE_FRAMEWORK.md` | Test pyramid, release gates, go/no-go |
| 45 | `45_TRACEABILITY_MATRIX.md` | Finding → risk → task → test → milestone |
| 46 | `46_FINAL_RECOMMENDATIONS_AND_OPEN_DECISIONS.md` | Recommendations and the 14 decisions only the founder can make |
| — | `FOUNDER_PRESENTATION.md` | 19-section decision deck |

---

## 4. Evidence label quick reference

| Label | Meaning |
|---|---|
| `SOURCE-VERIFIED` | Read directly from a repository file at the baseline commit |
| `TEST-VERIFIED` | Produced by an executed command whose output is recorded |
| `RUNTIME-VERIFIED` | Observed from a live process or external service response |
| `DOCUMENTED-ONLY` | Asserted in a doc but not corroborated by code |
| `INFERRED` | Reasoned conclusion from evidence; not directly observed |
| `PROPOSED` | A recommendation in this plan; nothing exists yet |
| `BLOCKED` | Could not be established; reason recorded |

---

## 5. Hard constraints this plan honours

1. Zoho Catalyst Data Store remains the authoritative business database. MongoDB does not silently replace it.
2. Cloudflare + Zoho Catalyst deployment targets are preserved. No static export. No silent hosting change.
3. Warm off-white / dark charcoal sidebar visual identity is preserved.
4. No live outbound email, WhatsApp, calls, ad spend, or production deploy without authorised gate clearance.
5. No Google Maps / Places scraping.
6. No invented market sizes, demand figures, test results, or security claims.
