# ADR-001: Core Technology Stack Selection (Next.js 15, Supabase, n8n)

**Status:** APPROVED  
**Date:** 18 October 2026  
**Decider:** Principal Software Architect & Solo Founder  

---

## 1. Context & Problem Statement
The agency requires an internal operations command center to manage prospect data, audit generation, pipeline tracking, and client delivery administration. As a solo software engineer bootstrap-funding the project, the stack must minimize operational complexity, avoid heavy DevOps maintenance, deliver high developer velocity, and maintain zero-to-low hosting costs at baseline.

## 2. Decision
We choose the following core stack:
- **Frontend & App Server:** Next.js 15 (App Router, React 19, TypeScript strict mode, Tailwind CSS).
- **Database & Auth:** Supabase (Managed PostgreSQL 16, Row Level Security, Auth, Edge Functions, S3-compatible Storage).
- **Workflow Orchestration:** n8n (visual asynchronous workflow automation, self-hosted via Docker or starter cloud).

## 3. Alternatives Considered
1. *Django / Python + Celery + PostgreSQL:* Strong for background tasks, but introduces context switching between Python and TypeScript, heavier frontend glue code, and higher server maintenance overhead.
2. *Full Custom Node.js / Express Microservices:* Premature microservice abstraction for a solo developer; requires building custom auth, file storage, and DB connection pooling from scratch.
3. *Pure No-Code / Airtable + Make.com:* Insufficient data privacy control, vendor lock-in, high per-operation pricing, and inability to build proprietary algorithmic auditing.

## 4. Consequences & Trade-offs
- **Positive:** Single language (TypeScript) across frontend and Edge Functions. Supabase handles managed Postgres, Auth, and RLS natively. Next.js provides instant server-rendered performance. n8n simplifies multi-step API retries and third-party webhooks without custom queue infrastructure.
- **Negative:** n8n workflow configurations must be version-controlled via JSON exports to prevent workflow drift.
