# AgencyOS Asynchronous Worker Pipeline

This module documents the background queue and asynchronous job processing architecture for **AgencyOS**.

---

## 1. Responsibilities

The background worker pipeline manages high-latency, multi-step asynchronous agency workflows:

1. **Website Performance & SEO Audits:**
   - Evaluates mobile responsiveness, SSL health, load speeds, and OpenGraph/schema markup.
   - Computes deterministic Opportunity Scores using `@agencyos/utils`.
2. **AI Agent Batch Dispatchers:**
   - Research Agent: Autonomous company background profiling.
   - Outreach Agent: Template personalization with strict `dry_run = true` compliance.
   - Follow-up Agent: Schedule management and lead reminder alerts.
3. **Daily Action Cap & Spend Budget Enforcement:**
   - Enforces rate limits per organization (e.g. 150 daily actions cap).
   - Monitors credit balances against plan quotas.

---

## 2. Infrastructure Patterns

### Option A: Self-Hosted BullMQ + Redis
Used in containerized or private VPC deployments:
- Queues: `audit-queue`, `outreach-queue`, `agent-run-queue`
- Worker concurrency: `5` concurrent tasks per worker instance
- Automatic exponential backoff: 3 retries with jitter

### Option B: Zoho Catalyst Cron / Event Listeners
Used in serverless Catalyst deployments:
- Catalyst Scheduled Functions execute periodically (e.g. every hour) to poll pending tasks and dispatch them safely.

---

## 3. Strict Deterministic Safety Invariants

1. **Dry-Run Enforcement:**
   All outbound dispatch jobs must check `campaign.dryRunMode !== false && org.settings.dryRunMode !== false`. If true, the worker creates an `OutreachMessage` record with status `"Sent [Dry-Run]"` and avoids invoking live SMTP, SendGrid, or WhatsApp Business APIs.
2. **No Google Maps Scraping:**
   Lead enrichment operates exclusively on provided URLs or compliant search providers. Web scraping against Google Maps endpoints is strictly rejected per Section 3.2.3 of Google Maps TOS and the Indian DPDP Act 2023.
3. **Job Idempotency:**
   Every queued task utilizes an `idempotencyKey` formatted as `leadId:campaignId:stepNumber` to prevent accidental duplicate messaging.

