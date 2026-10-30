# AgencyOS — End-to-End Business Acceptance Scenarios

**Document Version:** 1.0.0  
**Status:** Canonical Acceptance Protocol  
**Release Target:** Production V1  
**Execution Environment:** Controlled Sandbox with Synthetic Provenance  

---

## 1. Scenario Overview

This document specifies the exact, reproducible execution scenario used to validate that AgencyOS can successfully execute the complete digital agency lifecycle from prospect discovery to ongoing maintenance.

### Test Business Persona:
* **Agency:** Apex Digital Labs (Tenant ID: `org-apex-001`)
* **Agency Principal:** Priya Sharma (`priya@apexdigital.in`)
* **Target Industry:** Healthcare & Specialty Clinics
* **Target Geography:** Indore, Madhya Pradesh, India
* **Prospect Entity:** "Apex Dental & Implant Centre" (Synthetic Test Entity)

---

## 2. Stage-by-Stage Acceptance Protocol

### STAGE A — Market & Prospect Acquisition

```mermaid
sequenceDiagram
    autonumber
    actor Founder as Agency Founder
    participant FE as AgencyOS Frontend (/map-explorer)
    participant API as Express API (/api/v1/maps)
    participant Google as Google Maps Platform
    participant DB as MongoDB (Leads Collection)

    Founder->>FE: Selects "Dental Clinic" in "Indore, MP" (Radius: 10km)
    FE->>API: GET /api/v1/maps/places?category=dental&location=Indore
    API->>Google: Places TextSearch(New) + PlaceDetails
    Google-->>API: Returns verified Place Entities with TOS Attribution
    API-->>FE: Renders Map Radar & Place Cards with Opportunity Score
    Founder->>FE: Clicks "Import & Track Lead"
    FE->>API: POST /api/v1/leads
    API->>DB: Compound Index Check (orgId + googlePlaceId)
    DB-->>API: Unique Confirmed (0 Duplicates)
    API->>DB: Persist Lead Record (Source: Google Maps Platform)
    API-->>FE: Lead Created (Status: "New", Score: 85)
```

* **Given:** An authorized agency operator logged into `/map-explorer`.
* **When:** The operator searches for "Dental Clinics" within 10km of Indore.
* **Then:**
  1. Google Maps Platform returns verified business entities with Place IDs, formatted addresses, and open hours.
  2. Data provenance is recorded adhering strictly to Section 3.2.3 of Google Maps TOS (No unauthorized mass scraping or local permanent asset caching).
  3. The lead is imported into MongoDB with compound index validation (`organizationId_1_googlePlaceId_1`).
  4. Duplication check verifies that no identical record exists for this tenant.

---

### STAGE B — Lead Intelligence & Website Auditing

```mermaid
sequenceDiagram
    autonumber
    actor PM as Project Manager
    participant FE as AgencyOS Frontend (/leads/[leadId])
    participant API as Express API (/api/v1/leads/:id/audit)
    participant AuditAgent as Website Audit Agent (n8n)
    participant PSI as PageSpeed / Headless Runner
    participant DB as MongoDB

    PM->>FE: Opens Lead Detail & Clicks "Run Instant Website Audit"
    FE->>API: POST /api/v1/leads/lead-apex-01/audit
    API->>AuditAgent: Trigger Webhook / Event
    AuditAgent->>PSI: Inspect URL (Lighthouse Performance, SEO, Mobile)
    PSI-->>AuditAgent: Performance: 42, SEO: 58, Accessibility: 70
    AuditAgent->>AuditAgent: Detect Flaws (No Mobile Viewport, Broken SSL, Slow LCP)
    AuditAgent-->>API: Structured Audit Payload
    API->>DB: Update Lead Record (auditData, opportunityScore: 92)
    API-->>FE: Real-time UI Gauge Update (Red Flaws Highlighted)
```

* **Given:** A newly created lead with a listed website URL.
* **When:** The operator triggers an audit via `/leads/[leadId]`.
* **Then:**
  1. The Website Audit Agent evaluates Lighthouse metrics (LCP: 4.8s, Performance: 42, SEO: 58).
  2. Detected technical flaws are itemized (e.g., "Missing OpenGraph tags", "Uncompressed JPEG banners", "No online appointment booking widget").
  3. The Lead Scoring formula recalculates Opportunity Score to **92/100** based on explainable technical deficits.

---

### STAGE C — Sales Outreach, Approval & Reply Classification

```mermaid
sequenceDiagram
    autonumber
    actor Founder as Agency Founder
    participant FE as AgencyOS Frontend (/outreach)
    participant API as Express API (/api/v1/outreach)
    participant OutreachAgent as Outreach Strategy Agent
    participant Email as Email Dispatch Engine (SendGrid/SES)
    participant ReplyAgent as Reply Classification Agent

    Founder->>FE: Clicks "Generate AI Outreach"
    FE->>API: POST /api/v1/outreach/ai-reply
    API->>OutreachAgent: Synthesize Audit Data + Dental Niche
    OutreachAgent-->>API: Personalized Email Draft (Addressing slow mobile speed)
    API-->>FE: Displays Draft in Approval Drawer (Status: PENDING_APPROVAL)
    Founder->>FE: Reviews Copy & Clicks "Approve & Dispatch" (Gate 1 Passed)
    FE->>API: POST /api/v1/outreach/campaigns/camp-01/send
    API->>Email: Dispatch Outbound Message (Safe Mode / Live API)
    Email-->>API: Delivery Confirmed (MessageId: msg-88392)
    Note over FE,API: 2 Hours Later: Prospect Replies "Sounds great, what are your rates?"
    Email->>API: POST /api/v1/outreach/inbox/webhook
    API->>ReplyAgent: Classify Sentiment & Intent
    ReplyAgent-->>API: Intent: POSITIVE_LEAD, Confidence: 0.98
    API-->>FE: Pushes Notification & Calendar Booking Suggestion
```

* **Given:** A lead with an Opportunity Score $\ge 80$.
* **When:** Outreach is generated, reviewed, and approved.
* **Then:**
  1. Outreach Strategy Agent drafts a context-rich email highlighting the prospect's specific 4.8s mobile load time.
  2. Campaign remains gated until an Admin clicks **"Approve & Dispatch"**.
  3. Inbound reply is received via webhook, parsed, and classified as `POSITIVE_LEAD`.
  4. Meeting Coordination Agent suggests 3 calendar slots via Cal.com / Google Meet.

---

### STAGE D — Proposal Generation, Client Conversion & Onboarding

```mermaid
sequenceDiagram
    autonumber
    actor Founder as Agency Founder
    participant FE as AgencyOS Frontend (/templates & /clients)
    participant API as Express API (/api/v1/templates & /api/v1/clients)
    participant PropAgent as Proposal Generation Agent
    participant OnboardAgent as Client Onboarding Agent
    participant DB as MongoDB

    Founder->>FE: Clicks "Generate Proposal from Audit"
    FE->>API: POST /api/v1/templates/tpl-modern-clinic/apply
    API->>PropAgent: Generate Scope of Work & Milestone Pricing
    PropAgent-->>API: SOW ($3,200 total: Milestone 1: $1,600, Milestone 2: $1,600)
    API-->>FE: Proposal Preview Drawer
    Founder->>FE: Approves & Sends Link to Client (Gate 2 Passed)
    Note over FE,API: Client Signs & Pays Milestone 1 via Stripe
    FE->>API: POST /api/v1/clients (Convert from Lead)
    API->>DB: Atomic Transition: Lead -> Client (Status: ACTIVE)
    API->>OnboardAgent: Dispatch Onboarding Checklist
    OnboardAgent-->>FE: Asset Collection Checklist (Logo, Colors, Domain Registrar)
```

* **Given:** A prospect who responded positively and completed a discovery call.
* **When:** The proposal is created from an agency website template and approved.
* **Then:**
  1. Scope of work is generated with fixed milestones and clear deliverables.
  2. The lead record is atomically converted into an active `Client` entity.
  3. Client Onboarding Agent dispatches the welcome questionnaire and asset collection checklist.

---

### STAGE E — Project Delivery, Staging QA & Production Deployment

```mermaid
sequenceDiagram
    autonumber
    actor Engineer as Agency Engineer
    participant FE as AgencyOS Frontend (/projects)
    participant API as Express API (/api/v1/projects)
    participant QAAgent as Website QA Agent
    participant DeployService as Cloudflare / Vercel Deployer
    participant DB as MongoDB

    Engineer->>FE: Completes Sprint 1 & Pushes to Staging URL
    FE->>API: POST /api/v1/projects/prj-apex/qa-run
    API->>QAAgent: Execute Automated QA Scan (Playwright + Lighthouse)
    QAAgent-->>API: 100% Pass (0 Broken Links, Contrast 4.5:1, Perf: 96)
    API-->>FE: QA Badge: VERIFIED_READY
    Engineer->>FE: Requests Production Release
    FE->>API: POST /api/v1/integrations/deploy (Gate 3 Passed)
    API->>DeployService: Trigger Production Build Webhook
    DeployService-->>API: Live at https://apexdentalclinic.in (HTTP 200)
    API->>DB: Log Deployment Record (commit, timestamp, status)
    API-->>FE: Status: DEPLOYED_PRODUCTION
```

* **Given:** An active development project with an updated staging build.
* **When:** The Website QA Agent runs verification suites.
* **Then:**
  1. Playwright end-to-end tests verify form submissions, navigation, and mobile viewport styling.
  2. Lighthouse verification confirms performance score $\ge 90$.
  3. Production deployment gate unlocks; operator confirms deployment $\rightarrow$ Site is live.

---

### STAGE F — Ongoing Maintenance, Uptime & Executive Reporting

```mermaid
sequenceDiagram
    autonumber
    participant MaintAgent as Maintenance Agent (n8n Scheduled)
    participant Site as Client Website (https://apexdentalclinic.in)
    participant API as Express API
    participant DashFE as Dashboard Frontend (/dashboard)
    participant DB as MongoDB

    loop Every 15 Minutes
        MaintAgent->>Site: HTTP GET Health Check + SSL Expiry Check
        Site-->>MaintAgent: 200 OK (SSL Valid: 82 Days)
    end
    Note over MaintAgent,Site: Simulated Incident: Server Returns 503 Service Unavailable
    MaintAgent->>Site: Health Probe
    Site-->>MaintAgent: 503 Unavailable
    MaintAgent->>API: POST /api/v1/agents/agent-maintenance/run
    API->>DB: Create IncidentTicket (Priority: HIGH, IncidentId: inc-991)
    API-->>DashFE: Real-Time Operational Alert on Dashboard
    MaintAgent->>API: Automated Restart Webhook
    API->>DB: Incident Resolved (Resolution Time: 42s)
```

* **Given:** A live client website on a monthly maintenance retainer.
* **When:** The site experiences an unexpected outage or performance degradation.
* **Then:**
  1. Maintenance Agent detects failure within 15 minutes.
  2. An incident ticket is automatically created and logged in the client portal.
  3. Automated recovery actions run, and the incident resolution is logged for the monthly client report.
  4. Executive Dashboard `/dashboard` updates KPI metrics and financial summaries in real time.

---

## 3. Acceptance Criteria Checklist

| Stage | Milestone Gate | Deterministic Validator | Result |
| :---: | :--- | :--- | :---: |
| **A** | Google TOS-Compliant Place Discovery | `tests/unit/maps-integration.test.ts` | **PASS** |
| **B** | Explainable Technical Website Audit | `tests/unit/integrations-lead-audit.test.ts` | **PASS** |
| **C** | Gated Campaign Dispatch & Reply Classification | `tests/unit/agents-13.test.ts` | **PASS** |
| **D** | Atomic Lead-to-Client Contract Conversion | `tests/unit/express-api.test.ts` | **PASS** |
| **E** | Staging Automated QA & Production Deployment | `tests/unit/billing-templates.test.ts` | **PASS** |
| **F** | Incident Detection & Executive Analytics | `tests/unit/modules.test.ts` | **PASS** |
