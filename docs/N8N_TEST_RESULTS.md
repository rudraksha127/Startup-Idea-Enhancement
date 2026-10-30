# AgencyOS n8n Workflow Test & Validation Report

**Report Date**: 30 October 2026  
**Validator**: `n8n/scripts/validate/validate-workflows.ts` & `tests/n8n/workflows.test.ts`  
**Total Workflows Inspected**: 24  
**Validation Verdict**: **100% VALID (0 Errors, 0 Warnings)**  

---

## 1. Automated Workflow Topology Audit

```text
[n8n Validator] Scanning workflows in n8n/workflows...
[n8n Validator] Found 24 workflow definitions.
[n8n Validator] Summary: 24 valid, 0 errors.
```

### Inspected Canonical Agent Workflows (13 Total)

| Workflow | File Path | Nodes Count | Connections Check | Output Contract | Status |
|---|---|:---:|:---:|:---:|:---:|
| Market Research | `n8n/workflows/agents/market-research/workflow.json` | 4 | Verified | Valid JSON | ✅ PASS |
| Prospect Discovery | `n8n/workflows/agents/prospect-discovery/workflow.json` | 4 | Verified | Valid JSON | ✅ PASS |
| Lead Enrichment | `n8n/workflows/agents/lead-enrichment/workflow.json` | 4 | Verified | Valid JSON | ✅ PASS |
| Website Audit | `n8n/workflows/agents/website-audit/workflow.json` | 4 | Verified | Valid JSON | ✅ PASS |
| Lead Qualification | `n8n/workflows/agents/lead-qualification/workflow.json` | 4 | Verified | Valid JSON | ✅ PASS |
| Outreach Strategy | `n8n/workflows/agents/outreach-strategy/workflow.json` | 4 | Verified | Valid JSON | ✅ PASS |
| Reply Classification | `n8n/workflows/agents/reply-classification/workflow.json` | 4 | Verified | Valid JSON | ✅ PASS |
| Meeting Coordination | `n8n/workflows/agents/meeting-coordination/workflow.json` | 4 | Verified | Valid JSON | ✅ PASS |
| Proposal Generation | `n8n/workflows/agents/proposal-generation/workflow.json` | 4 | Verified | Valid JSON | ✅ PASS |
| Client Onboarding | `n8n/workflows/agents/client-onboarding/workflow.json` | 4 | Verified | Valid JSON | ✅ PASS |
| Project Planning | `n8n/workflows/agents/project-planning/workflow.json` | 4 | Verified | Valid JSON | ✅ PASS |
| Website QA | `n8n/workflows/agents/website-qa/workflow.json` | 4 | Verified | Valid JSON | ✅ PASS |
| Maintenance Agent | `n8n/workflows/agents/maintenance/workflow.json` | 4 | Verified | Valid JSON | ✅ PASS |

---

## 2. Reusable Sub-Workflows Audit (7 Total)

| Sub-Workflow | File Path | Nodes Count | Function | Status |
|---|---|:---:|---|:---:|
| `data-validation` | `n8n/workflows/sub-workflows/data-validation/workflow.json` | 2 | Zod & JSON schema validation gate | ✅ PASS |
| `deduplication` | `n8n/workflows/sub-workflows/deduplication/workflow.json` | 2 | Contact duplicate detector | ✅ PASS |
| `source-verification` | `n8n/workflows/sub-workflows/source-verification/workflow.json` | 2 | Domain freshness & DNS check | ✅ PASS |
| `ai-generation` | `n8n/workflows/sub-workflows/ai-generation/workflow.json` | 2 | Multi-model invocation & token logging | ✅ PASS |
| `approval` | `n8n/workflows/sub-workflows/approval/workflow.json` | 2 | Human gatekeeper for high-stakes actions | ✅ PASS |
| `notification` | `n8n/workflows/sub-workflows/notification/workflow.json` | 2 | Multi-channel dispatch (In-App/Email) | ✅ PASS |
| `error-handler` | `n8n/workflows/sub-workflows/error-handler/workflow.json` | 2 | Dead-letter queue & exception tracking | ✅ PASS |

---

## 3. Central System Orchestrations (4 Total)

| Workflow | File Path | Role | Status |
|---|---|---|:---:|
| `WF-AGENT-DISPATCHER` | `n8n/workflows/triggers/agent-dispatcher.json` | Receives backend request & invokes target agent | ✅ PASS |
| `WF-DAILY-SUMMARY` | `n8n/workflows/scheduled/daily-summary.json` | Midnight cron compilation of KPI brief | ✅ PASS |
| `WF-AGENT-RESULT-CALLBACK` | `n8n/workflows/webhooks/result-callback.json` | Ingests verified agent execution output | ✅ PASS |
| `WF-INTEGRATION-HEALTH-CHECK` | `n8n/workflows/system/health-check.json` | 15-minute synthetic system telemetry check | ✅ PASS |
