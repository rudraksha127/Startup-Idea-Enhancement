# 01 — Method and Evidence Standard

---

## 1. Why this document exists

The repository contains documentation that states the system passes 72/72 tests and that all modules are `WORKING`. The test suite fails, and the agent layer is stubs. Once a project's own documentation is unreliable, every subsequent claim inherits suspicion. This document defines the evidence standard used throughout this corpus so that any reader can tell what was observed from what was asserted.

---

## 2. Evidence labels

Every material statement in this corpus carries one of seven labels.

| Label | Definition | Assertion strength |
|---|---|---|
| `SOURCE-VERIFIED` | Directly read from a file at commit `d1be212`. The claim is about text that exists in the repository. | High — but a claim about *text*, not behaviour |
| `TEST-VERIFIED` | Produced by executing a command during this audit; command and output recorded in `03`. | High for that command on that machine |
| `RUNTIME-VERIFIED` | Observed from a live process, live service response, or live external endpoint. | High for that observation |
| `DOCUMENTED-ONLY` | Asserted in repository documentation but not corroborated by code or execution. | Low |
| `INFERRED` | A reasoned conclusion drawn from evidence; not directly observed. | Medium — falsifiable |
| `PROPOSED` | A recommendation created by this plan. Nothing exists yet. | N/A — design intent |
| `BLOCKED` | Could not be established. Reason always recorded. | None |

### 2.1 Rules of use

1. `SOURCE-VERIFIED` never implies runtime correctness. An `if (false)` branch is `SOURCE-VERIFIED` text.
2. `DOCUMENTED-ONLY` is a **finding**, not a neutral label. It marks a documentation defect.
3. `BLOCKED` must never be silently converted to an assumption. Where a `BLOCKED` item affects a decision, the decision is marked conditional.
4. A number that appears in this corpus without a label is a defect in this corpus. Except in clearly-labelled illustrative formulas (`24`), all figures are labelled or are counts derived from the file inventory.

---

## 3. Verification method

### 3.1 What was done

| Activity | Method | Scope |
|---|---|---|
| Repository inventory | `git ls-files`, directory traversal, line counts | Whole tree |
| Baseline capture | `git status --porcelain`, `git rev-parse HEAD`, submodule check | Whole tree |
| Type safety | `npm run typecheck:frontend`, `npm run typecheck:api` | All TS/TSX |
| Tests | `npm run test` (Vitest) | 16 test files |
| Build | `npm run build` (OpenNext → Cloudflare Worker) | Full frontend |
| Code reading | Full-file reads of critical paths; targeted `grep` for patterns | ~210 backend, ~146 frontend files sampled |
| Documentation review | Read of all `docs/` architecture, execution, and ADR files | 136 doc files |
| External research | Web search against primary vendor/regulator documentation | 8 topics, dated 17 Nov 2026 |

### 3.2 What was deliberately not done

| Excluded | Reason |
|---|---|
| Any outbound email / WhatsApp / call | AGENTS.md rule 5; would cause real-world side effects |
| Any payment or ad-spend action | Same |
| Any deploy to Cloudflare or Catalyst | Same; Stage A forbids state change |
| Any schema migration or seed execution | Stage A forbids database change |
| Playwright E2E | Not part of any existing gate; running it would mutate local state via app routes. Recorded `BLOCKED` |
| Penetration testing | Out of scope; security findings are code-reading findings |
| Reading secret values | Prohibited. Only key *names* and presence were confirmed |
| Market sizing / demand research | Would require invented figures; explicitly forbidden |

### 3.3 Secret handling

`.env`, `.env.local`, `.env.production`, `backend/.env`, `frontend/.env.local` exist on disk with configured key names present for Gemini, OpenAI, Resend, Stripe, NVIDIA NIM, OpenRouter, Google Maps, JWT signing, and MongoDB (runtime validity unverified). **No value from any of these files appears in this corpus.** Only the set of configured provider names is referenced, because it affects architectural decisions (`SOURCE-VERIFIED` that the files exist and are untracked; values unread).

Confirmation that these files are untracked is `SOURCE-VERIFIED` via `git ls-files` — only `.env.example` variants are committed.

---

## 4. External research register

All external claims are dated to the research date **17 November 2026**. Licences and policies change; re-verify before contract signature.

| # | Topic | Source class | Used in |
|---|---|---|---|
| R1 | Hermes Agent — MIT, Nous Research, active releases | Project repository / release notes | `41` |
| R2 | Zoho Catalyst ZCQL limits — DML only, ≤4 JOINs, no documented transactions | Vendor documentation | `07`, `28`, `36` |
| R3 | n8n Sustainable Use License | Vendor licence text | `10`, `30`, `41` |
| R4 | Cloudflare guidance: Workers (OpenNext/vinext) preferred over Pages for Next.js | Vendor documentation | `16`, `27` |
| R5 | Temporal — MIT licence, self-host or Cloud | Vendor site + repository licence | `30`, `41` |
| R6 | LangGraph — MIT library; LangGraph Platform is separately licensed | Vendor site + repository licence | `29`, `41` |
| R7 | Langfuse — MIT core, `/ee` modules licensed separately | Vendor handbook + licence docs | `37`, `41` |
| R8 | Qdrant — Apache-2.0; LiteLLM — MIT with optional enterprise licence | Repository licence files | `31`, `32`, `41` |
| R9 | OpenHands — MIT | Repository licence | `41` |
| R10 | OPA — Apache-2.0 (CNCF); OpenFGA — Apache-2.0 | Project sites | `35`, `41` |
| R11 | DPDP Act 2023 — DPDP Rules 2025 notified 13–14 Nov 2025; core obligations phased, widely reported as effective ~May 2027 | MeitY / PIB / law-firm commentary | `39` |
| R12 | TRAI TCCCPR — 2018 regulations, Second Amendment 2025 (Feb 2025): explicit consent, designated numbering series, traceability, DLT | TRAI regulation PDF + PIB release | `39` |
| R13 | Google Maps Platform Service Specific Terms — Places content cacheable ≤30 consecutive days; **Place ID exempt and storable indefinitely**; no scraping/pre-fetch | Google Cloud terms + Places policies | `11`, `39` |
| R14 | WhatsApp Business Platform — opt-in required, 24-hour customer service window, template approval, per-message pricing; service messages billable from 1 Oct 2026 after free allowance | Meta developer documentation | `11`, `39` |

Where this corpus states a legal conclusion, it is `INFERRED` from the cited instrument and is explicitly marked as requiring qualified counsel.

---

## 5. Confidence model

Each finding in Part I carries a confidence:

- **Certain** — text is unambiguous and directly read (`SOURCE-VERIFIED` with no interpretation).
- **High** — text plus execution agree (`SOURCE-VERIFIED` + `TEST-VERIFIED`).
- **Medium** — reasoned from multiple files (`INFERRED` with corroboration).
- **Low** — single indirect signal; flagged for confirmation.

Findings rated Low do not drive roadmap decisions. They drive verification tasks in `43`.

---

## 6. Reproducibility

Every `TEST-VERIFIED` claim can be reproduced by running the same command at commit `d1be212` with the same Node version (CI pins `20.x`; local execution used the installed Node runtime). Because the build emits into `.open-next/` at the repository root, reproduction will create untracked build output — a working tree that was clean at audit start will not remain clean after a build. This is expected and is not a modification of source.

---

## 7. What would change this audit's conclusions

Stated so the plan is falsifiable:

1. If `frontend/src/app/api/leads/[leadId]/audit/route.ts` computes scores from real evidence in a code path not reached in reading → F2 weakens. Re-read before acting.
2. If a Catalyst Data Store instance already contains production tenant data whose schema is authoritative → the migration shape in `28` changes materially.
3. If the deployed Worker is running a different commit than `main` → all deployment findings require re-baselining.
4. If the failing test is a stale assertion rather than a genuine regression → the documentation falsification finding (F5 documentation element) still stands, because the docs claim a result nobody re-ran.
