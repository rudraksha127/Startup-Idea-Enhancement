# Autonomous Agency OS — Documentation Index

**System:** Autonomous Agency OS  
**Architecture Version:** 1.0.0-draft  
**Last Updated:** 18 October 2026  
**Primary Operator:** Solo Founder / Software Developer  

Welcome to the central engineering and product documentation repository for **Autonomous Agency OS**. This portal serves as the single source of truth for architecture, product requirements, database design, execution roadmaps, security controls, and operational runbooks.

---

## Documentation Structure

```
docs/
├── README.md                                  # You are here: Central Documentation Index
├── product/
│   ├── PRD.md                                 # Canonical Product Requirements Document
│   ├── USER_FLOWS.md                          # Detailed operator and customer workflows with sequence diagrams
│   └── REQUIREMENTS_TRACEABILITY.md           # Traceability matrix: FR/NFR -> Task -> Test -> Release Gate
├── architecture/
│   ├── SYSTEM_ARCHITECTURE.md                 # Component topology, data boundaries, and integrations
│   ├── DATABASE_DESIGN.md                     # PostgreSQL/Supabase schema, tables, indexes, and RLS policies
│   ├── API_SPECIFICATION.md                   # REST and Webhook contracts, schemas, and error definitions
│   └── decisions/
│       ├── ADR-001-core-tech-stack.md         # Next.js 15 + Supabase + n8n architecture decision
│       ├── ADR-002-audit-engine-inward-pivot.md# Inward automation vs. unconsented cold outreach
│       └── ADR-003-client-headless-cms.md     # Decoupled CMS for client self-service batch updates
├── expert-reviews/
│   ├── README.md                              # Multidisciplinary Industry Expert Council Scorecard
│   ├── EXECUTIVE_REVIEW.md                    # Strategic, commercial, and product leadership verdicts (CEO, CPO, CMO, CRO)
│   ├── ENGINEERING_REVIEW.md                  # Technical, architectural, and data verdicts (CTO, Principal Architect, CAIO)
│   ├── SECURITY_AND_PRIVACY_REVIEW.md         # Compliance and threat analysis (CISO, Legal Counsel, DPDP Act)
│   └── RED_TEAM_PREMORTEM.md                  # Pre-mortem failure scenarios, cognitive traps, and mitigations
├── planning/
│   ├── ROADMAP.md                             # Multi-phase milestone delivery timeline (M0 to M5)
│   ├── BACKLOG.md                             # Traceable, prioritized task backlog (TASK-001 to TASK-024)
│   └── RISKS_AND_DEPENDENCIES.md              # Risk register, severity matrix, and external dependencies
├── engineering/
│   ├── CODING_STANDARDS.md                    # Code conventions, linting, error handling, and Git rules
│   ├── TEST_STRATEGY.md                       # Unit, integration, E2E test suites, and mock strategies
│   └── SECURITY_AND_PRIVACY.md                # Threat model, secrets handling, RLS audit, and kill switches
├── operations/
│   ├── LOCAL_SETUP.md                         # Developer workstation prerequisites and environment setup
│   ├── ENVIRONMENT_CONFIGURATION.md           # Validated environment variable schema and `.env.example`
│   └── DEPLOYMENT.md                          # Staging and production deployment procedures and rollbacks
├── release/
│   └── PRODUCTION_READINESS_REVIEW.md         # Audit of release gates A through H against empirical criteria
└── execution/
    ├── CURRENT_STATUS.md                      # Live project status, active milestone, and next immediate task
    └── WORK_LOG.md                            # Dated execution log of engineering decisions and verifications
```

---

## Core System Principles

1. **Deterministic Business Gates:** Source eligibility, lead suppression, financial spending, and customer handoffs are enforced by code and database constraints, never delegated to language model hallucinations.
2. **Privacy & Platform Policy First:** Zero Google Maps scraping; full compliance with India's DPDP Act 2023, TRAI UCC regulations, and Meta WhatsApp Business policies.
3. **Productized Outcome Packaging:** Sell an "Ad-Ready Student Enquiry Funnel" (Next.js performance + instant WhatsApp routing + local SEO) rather than generic, low-margin website templates.
4. **Solo-Developer Ergonomics:** Standardized modular components and locked-down Headless CMS access to protect the founder's time from repetitive manual content edits.
