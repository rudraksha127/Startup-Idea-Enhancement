# AgencyOS n8n Workflow Catalog

This catalog documents the background workflow pipelines scheduled and executed via n8n.

---

## 1. Workflows Inventory

| Workflow Name | Trigger | Destination | Retry Policy | Status |
|---|---|---|---|---|
| **Local Business Discovery** | Webhook / Cron (09:00 AM IST) | `POST /api/leads` | 3 retries (exponential backoff) | **Implemented** |
| **Website Performance Audit** | Lead status = `New` | `PATCH /api/leads/[leadId]` | 2 retries | **Implemented** |
| **Cold Outreach Drip** | Campaign Trigger | Resend API / Webhook | 1 retry | **Implemented (Dry-Run)** |
| **Inbound Reply Webhook** | Inbound Email Event | `POST /api/leads/[leadId]/outreach` | 3 retries | **Planned** |
| **Project Milestones Sync** | Project Milestone Completed | AgencyOS Dashboard | 2 retries | **Implemented** |

---

## 2. Execution & Error Handling

- **Credential Management:** Credentials are stored strictly in n8n's secure credential vault.
- **Dead Letter Queue (DLQ):** Unresolvable failures are logged to an error execution channel in n8n and trigger an operational notification on the founder dashboard.
- **Rate Limit Throttling:** Outbound requests to external APIs include intentional delays (minimum 500ms between calls) to prevent IP throttling or rate-limit penalties.

