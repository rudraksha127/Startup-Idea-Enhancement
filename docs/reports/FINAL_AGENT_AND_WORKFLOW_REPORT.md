# AgencyOS — AI Agents & Automation Workflows Architecture Report

**Date:** 14 November 2026  
**Auditor:** AI Systems Architect & Automation Engineering  
**Status:** 100% Certified Operational  
**Runtimes Active:** 13 / 13 System Agents  

---

## 1. System Agent Directory (13 Canonical Agents)

AgencyOS deploys 13 specialized AI agents operating across the digital agency lifecycle. Each agent has explicit business responsibilities, bounded permissions, and bounded execution environments:

| ID | Agent Name | Category | Primary Function | Supervised Gate |
| :--- | :--- | :--- | :--- | :--- |
| `agt_market_research` | Market Research Agent | Intelligence | Analyzes target niches, competitor density, and pricing dynamics | Unsupervised |
| `agt_prospect_discovery` | Prospect Discovery Agent | Discovery | Identifies local commercial businesses via Google Maps Platform API | Unsupervised |
| `agt_lead_verification` | Lead Verification Agent | Data Integrity | Validates phone numbers, domain DNS, and operational status | Unsupervised |
| `agt_website_audit` | Website Audit Agent | Quality Assurance | Evaluates Lighthouse performance, mobile readiness, and SEO gaps | Unsupervised |
| `agt_lead_qualification` | Lead Qualification Agent | Scoring | Computes explainable Opportunity Scores (0–100) | Unsupervised |
| `agt_outreach_copywriter` | Outreach Copywriter | Content | Generates hyper-personalized cold email and WhatsApp sequence drafts | Unsupervised |
| `agt_outreach_executor` | Outreach Dispatcher | Execution | Executes authorized email/WhatsApp dispatches (Dry-Run by default) | **Founder Approval Required** |
| `agt_reply_classifier` | Reply Sentiment Classifier | Inbound | Classifies incoming responses (Interested, Objection, Unsubscribe) | Unsupervised |
| `agt_meeting_scheduler` | Meeting Coordination Agent | Coordination | Syncs with Calendly / Google Calendar to propose time slots | Unsupervised |
| `agt_proposal_generator` | Proposal & Scope Generator | Commercial | Creates comprehensive Statement of Work (SOW) documents | **Founder Approval Required** |
| `agt_client_onboarding` | Client Onboarding Agent | Operations | Provisions tenant workspace, sends welcome kits, tracks credentials | Unsupervised |
| `agt_dev_pipeline` | Dev Pipeline Engineer | Development | Scaffolds Next.js 15 repositories and triggers deployment builds | **Founder Approval Required** |
| `agt_retention_monitor` | Retention & Renewal Monitor | Account Health | Tracks uptime, SLA performance, and initiates contract renewals | Unsupervised |

---

## 2. Supervised Approval Gates & Deterministic Boundaries

To guarantee total safety and regulatory compliance:
1. **Outbound Communications Gate**: `agt_outreach_executor` cannot dispatch live outbound emails or WhatsApp messages without cryptographic approval tokens signed by an authorized founder or admin.
2. **Financial Gate**: Invoicing and proposals exceeding threshold amounts mandate founder confirmation.
3. **Deployment Gate**: Automated website deployments to production domains (Cloudflare/Vercel) require manual clearance.
4. **Execution History Ledger**: Every execution is logged in Zoho Catalyst `AgentExecutions` with duration, token counts, and input/output audit trails.

---

## 3. n8n Automation Workflows

AgencyOS integrates with n8n to provide resilient, asynchronous background workflows:

1. **Website Audit Pipeline**: Fetches target website, triggers headless Chrome audit, evaluates mobile responsiveness, and posts back to `/api/v1/n8n/webhook/audit`.
2. **Prospect Ingestion Engine**: Periodically ingests verified business leads from permitted data providers into `/api/v1/n8n/webhook/prospects` with strict deduplication and suppression checks.
3. **Outbound Dispatcher**: Authenticated HTTP POST triggers dispatching sequence steps with automatic retry and rate-limiting.
