# Risk Register & External Dependencies — Autonomous Agency OS

**Last Updated:** 18 October 2026  
**Review Frequency:** Every Milestone Review  

---

## 1. Master Risk Register

```
+----------------------------------------------------------------------------------------------------+
| RISK REGISTER MATRIX                                                                               |
+--------+----------------------------+-------+--------+------------------------------------+--------+
| ID     | Risk Description           | Prob. | Impact | Mitigation Strategy                | Owner  |
+--------+----------------------------+-------+--------+------------------------------------+--------+
| RSK-01 | Client Scope Creep (unpaid | HIGH  | HIGH   | Single-page SOW with explicit list | CPO /  |
|        | LMS/portal requests)       |       |        | of excluded features; max 2 revs.  | Founder|
+--------+----------------------------+-------+--------+------------------------------------+--------+
| RSK-02 | Client Payment Default on  | MED   | HIGH   | Strict 50% advance before coding;  | CRO /  |
|        | final deployment balance   |       |        | deployment only upon full payment. | Founder|
+--------+----------------------------+-------+--------+------------------------------------+--------+
| RSK-03 | Off-Season Retainer Churn  | HIGH  | MED    | Mandatory quarterly advance        | CRO /  |
|        | (cancels outside peak batch|       |        | billing (₹10,500/quarter); bundle  | Founder|
|        | admission months)          |       |        | ongoing local SEO & batch updates. |        |
+--------+----------------------------+-------+--------+------------------------------------+--------+
| RSK-04 | Regulatory Exposure under  | LOW   | CRIT   | Hard architectural block on cold   | Legal/ |
|        | India DPDP Act 2023        |       |        | mass scraping; B2B direct opt-out  | CISO   |
|        |                            |       |        | links; zero unconsented WhatsApp.  |        |
+--------+----------------------------+-------+--------+------------------------------------+--------+
| RSK-05 | WhatsApp Business Account  | LOW   | HIGH   | Zero cold outbound via WhatsApp.   | Tech / |
|        | Suspension / Phone Ban     |       |        | WhatsApp is exclusively an inbound | Founder|
|        |                            |       |        | conversion link on client sites.   |        |
+--------+----------------------------+-------+--------+------------------------------------+--------+
| RSK-06 | Client Delays Sending Text | HIGH  | MED    | Agency delivers pre-written,       | CPO /  |
|        | and Course Syllabus Files  |       |        | industry-standard IT syllabi;      | Founder|
|        |                            |       |        | client only edits/approves.        |        |
+--------+----------------------------+-------+--------+------------------------------------+--------+
| RSK-07 | Google PageSpeed API Rate  | MED   | LOW    | Cache audit results for 14 days;   | Arch / |
|        | Limit Depletion            |       |        | exponential backoff retry in n8n.  | Founder|
+--------+----------------------------+-------+--------+------------------------------------+--------+
```

---

## 2. External Service Dependencies

| Dependency | Purpose | Failure Mode | Fallback / Continuity Plan |
| :--- | :--- | :--- | :--- |
| **Supabase (Postgres & Auth)** | Core operational database & authentication. | Cloud outage or billing lock. | Daily automated SQL pg_dump to local encrypted backup. |
| **Vercel** | Hosting Next.js operator dashboard & client funnels. | Service degradation or DNS outage. | Static export compatible with Netlify or Cloudflare Pages. |
| **Google PageSpeed API** | Programmatic Core Web Vitals audit data. | Rate limit or API deprecation. | Fallback to self-hosted Lighthouse CLI via Docker runner. |
| **Sanity.io / Headless CMS** | Client front-desk content self-service portal. | Service downtime. | Cached static builds continue serving; edits queue locally. |
| **n8n Orchestration** | Asynchronous audit execution & uptime ping. | Worker crash or container stall. | Next.js API direct fallback for synchronous single audits. |
