# AgencyOS Canonical Agent Catalog

AgencyOS features **13 specialized, workflow-oriented AI agents**. Each agent has bounded permissions, deterministic validation gates, structured I/O schemas, and persistent execution logging in MongoDB.

---

### 1. Market Research Agent (`market-research`)
- **Primary Mission**: Research defined industries, niches, and local geographic markets to identify high-value agency service opportunities.
- **Tools**: Web Search, Content Extractor, LLM Summarizer.
- **Autonomy Level**: Fully Autonomous.
- **Approval Gate**: Not Required.
- **Input Contract**: `{ industry: string, region: string, depth?: string }`
- **Output Contract**: `{ reportSummary: string, targetSegments: string[], marketDemandScore: number, sources: string[] }`

---

### 2. Prospect Discovery Agent (`prospect-discovery`)
- **Primary Mission**: Discover businesses using permitted data sources (Google Maps Platform, public registries) within geographical radiuses.
- **Tools**: Google Maps Places API (New), Deduplication Engine, Ingestion Pipeline.
- **Autonomy Level**: Fully Autonomous.
- **Approval Gate**: Not Required.
- **Input Contract**: `{ category: string, location: string, radiusMeters?: number }`
- **Output Contract**: `{ candidateCount: number, prospects: ProspectItem[], duplicateCount: number }`

---

### 3. Lead Enrichment Agent (`lead-enrichment`)
- **Primary Mission**: Validate available business information, detect stale records, and verify domain and social presence without hallucination.
- **Tools**: DNS Probe, WHOIS Inspector, HTTP Reachability Checker.
- **Autonomy Level**: Fully Autonomous.
- **Approval Gate**: Not Required.
- **Input Contract**: `{ leadId: string, businessName: string, website?: string }`
- **Output Contract**: `{ enrichedFields: Record<string, any>, confidenceScore: number, provenance: ProvenanceItem[] }`

---

### 4. Website Audit Agent (`website-audit`)
- **Primary Mission**: Inspect technical quality, Core Web Vitals, mobile responsiveness, SEO basics, and accessibility.
- **Tools**: Synthetic Lighthouse Runner, Viewport Dimension Analyzer, SSL Probe.
- **Autonomy Level**: Fully Autonomous.
- **Approval Gate**: Not Required.
- **Input Contract**: `{ leadId: string, websiteUrl: string }`
- **Output Contract**: `{ websiteScore: number, performanceScore: number, seoScore: number, issues: IssueItem[] }`

---

### 5. Lead Qualification Agent (`lead-qualification`)
- **Primary Mission**: Evaluate leads using configurable business rules, customer fit, tech readiness, and explainable scoring.
- **Tools**: Business Rule Engine, CRM Scoring Evaluator.
- **Autonomy Level**: Fully Autonomous.
- **Approval Gate**: Not Required.
- **Input Contract**: `{ leadId: string, budgetEstimate?: number, techReadiness?: number }`
- **Output Contract**: `{ opportunityScore: number, qualificationTier: string, reasoning: string[] }`

---

### 6. Outreach Strategy Agent (`outreach-strategy`)
- **Primary Mission**: Generate personalized email and WhatsApp drafts based on audit findings while enforcing suppression lists.
- **Tools**: Template Engine, Indian DPDP / TRAI Suppression Gate.
- **Autonomy Level**: Semi-Autonomous (Human Approval Required Before Sending).
- **Approval Gate**: **MANDATORY HUMAN APPROVAL**.
- **Input Contract**: `{ leadId: string, channel: "Email" | "WhatsApp", tone?: string }`
- **Output Contract**: `{ subjectLine: string, bodyContent: string, callToAction: string }`

---

### 7. Reply Classification Agent (`reply-classification`)
- **Primary Mission**: Monitor incoming replies, classify intent (Meeting Request, Objection, Opt-Out, Complaint).
- **Tools**: Intent NLP Classifier, DNC Opt-Out Handler.
- **Autonomy Level**: Semi-Autonomous (Automatic suppression on opt-out; drafts on positive).
- **Approval Gate**: Required for escalation responses.
- **Input Contract**: `{ replyText: string, leadEmail: string }`
- **Output Contract**: `{ intent: string, confidence: number, requiresHumanReview: boolean }`

---

### 8. Meeting Coordination Agent (`meeting-coordination`)
- **Primary Mission**: Query calendar availability, propose slots, and generate confirmed calendar invites.
- **Tools**: Google Calendar / Cal.com API, Email Dispatcher.
- **Autonomy Level**: Semi-Autonomous.
- **Approval Gate**: Founder / Operator Confirmation.
- **Input Contract**: `{ leadId: string, requestedSlot: string }`
- **Output Contract**: `{ meetingId: string, calendarLink: string, status: string }`

---

### 9. Proposal Generation Agent (`proposal-generation`)
- **Primary Mission**: Synthesize approved scope, deliverables list, pricing schedule, and generate dev-ready SOW.
- **Tools**: Pricing Calculator, Markdown Document Generator.
- **Autonomy Level**: Semi-Autonomous.
- **Approval Gate**: **MANDATORY FOUNDER APPROVAL**.
- **Input Contract**: `{ clientId: string, servicePackage: string, customTerms?: string }`
- **Output Contract**: `{ proposalId: string, totalBudget: number, deliverables: string[] }`

---

### 10. Client Onboarding Agent (`client-onboarding`)
- **Primary Mission**: Generate customized client onboarding checklist, asset request forms, and track welcome progress.
- **Tools**: Checklist Generator, Secure Form Dispatcher.
- **Autonomy Level**: Fully Autonomous.
- **Approval Gate**: Not Required.
- **Input Contract**: `{ clientId: string, companyName: string }`
- **Output Contract**: `{ onboardingChecklist: Task[], credentialsRequested: string[], welcomeEmailSent: boolean }`

---

### 11. Project Planning Agent (`project-planning`)
- **Primary Mission**: Transform signed SOW into agile sprints, milestone deliverables, task backlogs, and QA checkpoints.
- **Tools**: Agile Task Generator, Timeline Estimator.
- **Autonomy Level**: Fully Autonomous.
- **Approval Gate**: Not Required.
- **Input Contract**: `{ projectId: string, targetLaunchDays: number }`
- **Output Contract**: `{ milestones: Milestone[], tasksCount: number, estimatedHours: number }`

---

### 12. Website QA Agent (`website-qa`)
- **Primary Mission**: Run automated cross-browser, responsive, and broken-link audits on staging builds before launch.
- **Tools**: Playwright Test Runner, Broken Link Scanner, WCAG Inspector.
- **Autonomy Level**: Fully Autonomous.
- **Approval Gate**: Production Release Gate.
- **Input Contract**: `{ stagingUrl: string }`
- **Output Contract**: `{ testSuiteStatus: string, passedTests: number, failedTests: number, criticalBugs: Bug[] }`

---

### 13. Maintenance Agent (`maintenance`)
- **Primary Mission**: Synthetic uptime monitoring, SSL certificate expiry alerts, Core Web Vitals drift, and client SLA reporting.
- **Tools**: Synthetic HTTP Probe, TLS Expiry Checker, Incident Pager.
- **Autonomy Level**: Fully Autonomous.
- **Approval Gate**: Not Required.
- **Input Contract**: `{ clientDomains: string[] }`
- **Output Contract**: `{ uptimeStatus: string, averageResponseMs: number, sslStatus: string }`
