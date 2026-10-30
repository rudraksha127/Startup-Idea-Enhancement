# AI Governance Policy — AgencyOS
**Last Updated:** 2026-10-30  
**Owner:** CTO / CPO  
**Status:** DRAFT — Active

---

## 1. Purpose

This document establishes the governance framework for all AI agent capabilities within AgencyOS. It defines autonomy levels, permission boundaries, audit requirements, and risk controls to ensure responsible, bounded AI automation.

---

## 2. Autonomy Level Definitions

| Level | Name | Description | Human-in-Loop Required? |
|-------|------|-------------|------------------------|
| L0 | **Read-Only** | Agent can only read data, generate reports, surface insights | No |
| L1 | **Supervised** | Agent can prepare actions (drafts, proposals) but cannot execute without explicit human approval | **YES — for every action** |
| L2 | **Semi-Autonomous** | Agent can execute within a predefined boundary; logs all actions for async human review | Yes — async review within 24h |
| L3 | **Autonomous** | Agent executes independently within hard policy limits; retrospective audit only | No — policy limits enforced programmatically |

**Policy:** New agents always start at L1 (Supervised). Promotion to L2/L3 requires explicit Founder approval and documented justification.

---

## 3. Current Agent Registry

| Agent | Type | Autonomy Level | Enabled | Scope |
|-------|------|----------------|---------|-------|
| Lead Discovery Agent | Discovery | L1 Supervised | Configurable | Read-only web research |
| Source Verifier | Verification | L1 Supervised | Configurable | URL validation, no data mutation |
| Website Auditor | Audit | L1 Supervised | Configurable | Passive HTTP requests only |
| Lead Qualifier | Qualification | L1 Supervised | Configurable | Scores leads, no outbound actions |
| Outreach Composer | Outreach | L1 Supervised | ❌ Disabled | Composes messages; `dry_run=true` always |
| Reply Handler | CRM | L1 Supervised | ❌ Disabled | Reads inbound only; no automated replies |

**Rule:** No agent may send outbound communications (email, WhatsApp, SMS) in production without:
1. `dry_run = false` explicitly set by Founder role
2. Suppression list check passing
3. Audit record written before action

---

## 4. Permission Matrix

| Action | Founder | Admin | Member | AI Agent |
|--------|---------|-------|--------|----------|
| View leads | ✅ | ✅ | ✅ | ✅ (read) |
| Create/edit leads | ✅ | ✅ | ✅ | L2+ only |
| View campaigns | ✅ | ✅ | ✅ | ✅ (read) |
| Create campaign | ✅ | ✅ | ❌ | L2+ only |
| Set `dry_run=false` | ✅ | ❌ | ❌ | ❌ NEVER |
| Trigger agent run | ✅ | ✅ | ❌ | N/A |
| Promote agent to L2+ | ✅ | ❌ | ❌ | ❌ NEVER |
| View audit logs | ✅ | ✅ | ❌ | ❌ |
| Change settings | ✅ | ✅ | ❌ | ❌ |
| Export data | ✅ | ✅ | ❌ | ❌ |

---

## 5. Hard Policy Limits (Cannot Be Overridden by AI)

These constraints are enforced in code, not configuration:

1. **No outbound communications** without explicit human enablement
2. **No Google Maps/Places API scraping** — ever (TOS Section 3.2.3)
3. **No data export** to external services without Founder approval
4. **No credential access** — agents receive only scoped API keys, never database credentials
5. **No self-modification** — agents cannot change their own autonomy level or permissions
6. **Budget cap** — agent runs deduct from `Organization.credits`; runs halt when credits = 0

---

## 6. Audit Requirements

All agent runs must produce an audit record containing:
- `agentId`, `agentType`, `autonomyLevel`
- `triggeredBy` (userId or "system")
- `timestamp`
- `action` (what the agent attempted)
- `outcome` (success/failure/dry-run-queued)
- `inputSummary` (what data was processed — no PII in logs)
- `outputSummary` (what was produced)

**Retention:** Audit records retained for 90 days minimum (DPDP Act 2023 compliance).

---

## 7. Incident Response for AI Failures

| Scenario | Response |
|----------|----------|
| Agent sends message without dry_run check | Immediate halt, incident report, audit review |
| Agent produces incorrect lead scores | Flag records, human review queue |
| Agent credential leaked | Revoke key immediately, rotate all secrets |
| Agent cost overrun (>200% of expected) | Auto-pause agent, notify Founder |

---

## 8. Model Provider Policy

AgencyOS uses a provider-independent adapter layer. The following providers are permitted:

| Provider | Status | Use Cases |
|----------|--------|-----------|
| Google Gemini | ✅ Approved | General reasoning, text generation |
| OpenAI GPT | ✅ Approved | Fallback, specialized tasks |
| Anthropic Claude | ✅ Approved | Long-context analysis |
| Local models | ⚠️ Review needed | Privacy-sensitive processing |
| Unknown/unvetted | ❌ Blocked | Any provider not in this list |

**Data sent to AI providers:** Anonymized business data only. No PII (names, emails, phone numbers) sent to AI providers without explicit opt-in and data processing agreement.

