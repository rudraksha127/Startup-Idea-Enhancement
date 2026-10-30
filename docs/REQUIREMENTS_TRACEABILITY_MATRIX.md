# AgencyOS — Requirements Traceability Matrix (RTM)

**Document Version:** 1.0.0  
**Status:** Canonical Traceability Baseline  
**Published:** 30 October 2026  

---

## 1. Traceability Architecture

This matrix guarantees bi-directional traceability from high-level agency business objectives down to individual code symbols, APIs, n8n workflows, and automated tests.

$$\text{Objective} \rightarrow \text{Requirement} \rightarrow \text{User Story} \rightarrow \text{UI Screen} \rightarrow \text{API Route} \rightarrow \text{Service} \rightarrow \text{Database} \rightarrow \text{Automation} \rightarrow \text{Test} \rightarrow \text{Outcome}$$

---

## 2. Requirements Traceability Ledger

### Stream 1: Market Research & Prospect Discovery
* **Business Objective:** Discover verified high-value SMB clients without manual directory browsing.
* **Product Requirement:** `REQ-MKT-01`: Geographic and industry-filtered business discovery using official Google Maps APIs.
* **User Story:** As an agency founder, I want to scan a 10km radius in Indore for dental clinics so I can find businesses that lack modern websites.
* **UI Screen:** `/map-explorer` ([frontend/src/features/map-explorer/](file:///c:/Users/lucky/OneDrive/Desktop/Startup-Idea-Enhancement/frontend/src/features/map-explorer))
* **User Action:** Selects category and location $\rightarrow$ Clicks "Search Area".
* **API Route:** `GET /api/v1/maps/places` ([backend/src/modules/maps/maps.routes.ts](file:///c:/Users/lucky/OneDrive/Desktop/Startup-Idea-Enhancement/backend/src/modules/maps/maps.routes.ts))
* **Business Service:** `MapsService.searchPlaces()` ([backend/src/modules/maps/maps.service.ts](file:///c:/Users/lucky/OneDrive/Desktop/Startup-Idea-Enhancement/backend/src/modules/maps/maps.service.ts))
* **Database / Provider:** Google Maps Platform (Places API New) + `PlaceCache`.
* **n8n Workflow:** `n8n/workflows/agents/prospect-discovery/workflow.json`
* **Output:** JSON array of places with Place ID, rating, review count, address, and Opportunity Score.
* **Acceptance Test:** `tests/unit/maps-integration.test.ts`
* **Business Outcome:** Founder acquires a list of 20 verified local prospects in $<5$ seconds.

---

### Stream 2: Automated Website Technical Auditing
* **Business Objective:** Uncover factual technical flaws to justify high-ticket website redesign proposals.
* **Product Requirement:** `REQ-AUD-01`: Deterministic website performance, SEO, mobile responsiveness, and security auditing.
* **User Story:** As an agency consultant, I want an instant technical report for a prospect's website so I have concrete evidence for outreach.
* **UI Screen:** `/leads/[leadId]` ([frontend/src/features/leads/](file:///c:/Users/lucky/OneDrive/Desktop/Startup-Idea-Enhancement/frontend/src/features/leads))
* **User Action:** Clicks "Run Instant Website Audit".
* **API Route:** `POST /api/v1/leads/:id/audit` ([backend/src/modules/leads/leads.routes.ts](file:///c:/Users/lucky/OneDrive/Desktop/Startup-Idea-Enhancement/backend/src/modules/leads/leads.routes.ts))
* **Business Service:** `IntegrationsService.runLeadAudit()` ([backend/src/modules/integrations/integrations.service.ts](file:///c:/Users/lucky/OneDrive/Desktop/Startup-Idea-Enhancement/backend/src/modules/integrations/integrations.service.ts))
* **Database / Provider:** `Lead.auditData` in MongoDB + Google PageSpeed Insights.
* **n8n Workflow:** `n8n/workflows/agents/website-audit/workflow.json`
* **Output:** Lighthouse score breakdown, detected technologies (WordPress, Wix, custom), and itemized flaws.
* **Acceptance Test:** `tests/unit/integrations-lead-audit.test.ts`
* **Business Outcome:** Concrete value proposition ready for personalized outreach.

---

### Stream 3: Explainable Lead Scoring & Qualification
* **Business Objective:** Focus sales energy only on prospects with high willingness and ability to pay.
* **Product Requirement:** `REQ-QUAL-01`: Multi-factor opportunity scoring algorithm with human-readable rationale.
* **User Story:** As an agency sales rep, I want leads sorted by a 0-100 Opportunity Score so I can contact the most promising leads first.
* **UI Screen:** `/leads` ([frontend/src/features/leads/](file:///c:/Users/lucky/OneDrive/Desktop/Startup-Idea-Enhancement/frontend/src/features/leads))
* **User Action:** Filters by "Score > 80" or "Qualification: Qualified".
* **API Route:** `GET /api/v1/leads`
* **Business Service:** `LeadScorer.calculateOpportunityScore()`
* **Database / Provider:** `Lead.score`, `Lead.qualificationStatus` in MongoDB.
* **n8n Workflow:** `n8n/workflows/agents/lead-qualification/workflow.json`
* **Output:** Opportunity score with weighted point breakdown (+40 missing site, +25 low mobile score, +20 high rating volume).
* **Acceptance Test:** `tests/unit/validations.test.ts`
* **Business Outcome:** Agency conversion rates double by prioritizing underserved businesses.

---

### Stream 4: Outreach Strategy & Campaign Approval Gate
* **Business Objective:** Execute outbound outreach at scale while strictly avoiding spam reputation damage.
* **Product Requirement:** `REQ-OUT-01`: AI-synthesized cold email drafts with mandatory human approval gate before dispatch.
* **User Story:** As an agency principal, I want to review personalized outreach drafts before they are sent so no inaccurate copy reaches clients.
* **UI Screen:** `/outreach` ([frontend/src/features/outreach/](file:///c:/Users/lucky/OneDrive/Desktop/Startup-Idea-Enhancement/frontend/src/features/outreach))
* **User Action:** Reviews draft in modal $\rightarrow$ Clicks "Approve & Send".
* **API Route:** `POST /api/v1/outreach/campaigns/:id/send`
* **Business Service:** `OutreachService.dispatchCampaign()`
* **Database / Provider:** `Campaign` + SendGrid/SES email engine.
* **n8n Workflow:** `n8n/workflows/sub-workflows/approval/workflow.json`
* **Output:** Cryptographically recorded approval log + dispatched message with tracking headers.
* **Acceptance Test:** `tests/unit/agents-13.test.ts`
* **Business Outcome:** High outreach reply rates (15-25%) with zero risk of unapproved rogue communications.

---

### Stream 5: Inbound Reply Classification & Calendar Coordination
* **Business Objective:** Prevent warm leads from slipping through the cracks by instantly handling replies.
* **Product Requirement:** `REQ-REP-01`: Webhook ingest classifying sentiment and coordinating calendar bookings.
* **User Story:** As an agency operator, I want incoming emails categorized so I can immediately schedule calls with interested prospects.
* **UI Screen:** `/outreach` Inbox Tab
* **User Action:** Clicks "Confirm Meeting Slot".
* **API Route:** `POST /api/v1/outreach/inbox/webhook`, `POST /api/v1/meetings/schedule`
* **Business Service:** `OutreachService.handleReply()`, `MeetingsService.createMeeting()`
* **Database / Provider:** `Reply`, `Meeting` in MongoDB + Cal.com / Google Calendar API.
* **n8n Workflow:** `n8n/workflows/agents/reply-classification/workflow.json` & `agent-meeting-coordination`
* **Output:** Meeting record with video link and calendar invite sent to both parties.
* **Acceptance Test:** `tests/unit/agents-13.test.ts`
* **Business Outcome:** Time-to-meeting cut from 24 hours down to under 5 minutes.

---

### Stream 6: Proposal Generation & Lead-to-Client Conversion
* **Business Objective:** Turn verbal interest into signed, paid contracts with standardized agency pricing.
* **Product Requirement:** `REQ-PROP-01`: Convert audit insights and template packages into formal proposals and client workspaces.
* **User Story:** As an agency owner, I want to convert an approved proposal into an active client record with one click.
* **UI Screen:** `/templates` and `/leads/[leadId]`
* **User Action:** Clicks "Convert to Client".
* **API Route:** `POST /api/v1/clients`
* **Business Service:** `ClientsService.createFromLead()`
* **Database / Provider:** `Client`, `Proposal` in MongoDB.
* **n8n Workflow:** `n8n/workflows/agents/proposal-generation/workflow.json`
* **Output:** Active client workspace, onboarding checklist generated, initial invoice draft created.
* **Acceptance Test:** `tests/unit/express-api.test.ts`
* **Business Outcome:** Frictionless client acquisition with zero manual onboarding data entry.

---

### Stream 7: Project Scaffolding, Automated QA & Deployment
* **Business Objective:** Deliver modern, fast websites in days rather than months.
* **Product Requirement:** `REQ-PROJ-01`: Automated staging quality assurance gating production Cloudflare/Vercel releases.
* **User Story:** As a lead developer, I want automated verification of staging builds so I never deploy a broken website to a client's live domain.
* **UI Screen:** `/projects`
* **User Action:** Clicks "Run Staging QA" $\rightarrow$ Clicks "Deploy Production".
* **API Route:** `POST /api/v1/projects/:id/qa-run`, `POST /api/v1/integrations/deploy`
* **Business Service:** `ProjectsService.runQA()`, `IntegrationsService.deployProject()`
* **Database / Provider:** `Project`, `DeploymentRecord` in MongoDB + Cloudflare Pages / Vercel API.
* **n8n Workflow:** `n8n/workflows/agents/website-qa/workflow.json`
* **Output:** Verified staging URL with 0 console errors, 100% WCAG pass, and live production deployment record.
* **Acceptance Test:** `tests/unit/billing-templates.test.ts`
* **Business Outcome:** Defect-free website handovers with automated client signoff.

---

### Stream 8: Multi-Tenant Team Boundaries & Billing
* **Business Objective:** Enforce strict organizational data isolation and automate retainer invoicing.
* **Product Requirement:** `REQ-TEN-01`: Multi-tenant RBAC with idempotent Stripe webhook subscription handling.
* **User Story:** As an agency owner, I want team members restricted to appropriate roles and client retainers collected automatically.
* **UI Screen:** `/settings` and `/billing`
* **User Action:** Invites team member with role `specialist` $\rightarrow$ Connects Stripe webhook.
* **API Route:** `POST /api/v1/teams/invite`, `POST /api/v1/billing/webhook`
* **Business Service:** `TeamsService.inviteMember()`, `BillingService.processWebhook()`
* **Database / Provider:** `User`, `Organization`, `Invoice` in MongoDB + Stripe API.
* **n8n Workflow:** Deterministic Webhook Controller
* **Output:** Idempotent invoice reconciliation, deterministic RBAC gate rejection for unauthorized paths.
* **Acceptance Test:** `tests/unit/teams.test.ts`, `tests/unit/stripe-webhook.test.ts`, `tests/security/auth-boundaries.test.ts`
* **Business Outcome:** Secure, compliant SaaS operation ready for commercial multi-agency scale.
