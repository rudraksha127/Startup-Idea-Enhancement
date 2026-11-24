# 05 — Frontend Audit

**Scope:** `frontend/` — 146 files, 18 pages, 42 API routes.
**All findings `SOURCE-VERIFIED` unless labelled otherwise.**

---

## 1. Page inventory and health

| Route | File | Lines (approx.) | Data source | Health |
|---|---|---|---|---|
| `/` (marketing) | `(marketing)/page.tsx` | — | static | OK as marketing surface |
| `/login` | `(auth)/login/page.tsx` | — | static + API | **Backdoor credentials advertised** |
| `/register` | `(auth)/register/page.tsx` | — | API | Depends on registration route |
| `/dashboard` | `dashboard/page.tsx` | — | `/api/dashboard/metrics`, `/api/dashboard/activity` | Deterministic fallback on DB failure |
| `/leads` | `leads/page.tsx` | — | `/api/leads` | Triple fallback to empty |
| `/leads/[leadId]` | `leads/[leadId]/page.tsx` | — | `/api/leads/[leadId]` | Audit sub-panel returns fixed scores |
| `/audits` | `audits/page.tsx` | — | local generation | **`Math.random()` metrics** |
| `/analytics` | `analytics/page.tsx` | 1,105 | `/api/analytics/overview` | Monolith; fallback data |
| `/ai-agents` | `ai-agents/page.tsx` | 1,401 | `/api/agents`, `/api/agents/[id]/run` | **Fabricated run outputs** |
| `/map-explorer` | `map-explorer/page.tsx` | 1,223 | `/api/maps/places` | **Hardcoded businesses, false count** |
| `/outreach` | `outreach/page.tsx` | 1,157 | `/api/outreach/*` | `DEFAULT_CAMPAIGNS` synthetic |
| `/website-builder` | `website-builder/page.tsx` | — | none | **Static only** |
| `/projects` | `projects/page.tsx` | — | `/api/projects` | AppSail fallback |
| `/clients` | `clients/page.tsx` | — | `/api/clients` | AppSail fallback |
| `/team` | `team/page.tsx` | — | `/api/teams/*` | Offline fallback |
| `/templates` | `templates/page.tsx` | — | `/api/templates` | Offline fallback |
| `/billing` | `billing/page.tsx` | — | `/api/billing/*` | Webhook unauthenticated |
| `/settings` | `settings/page.tsx` | 1,064 | `/api/settings` | Reads a hardcoded user email |

---

## 2. Page monoliths

Five pages exceed 1,000 lines in a single file:

| Page | Lines |
|---|---|
| `ai-agents` | 1,401 |
| `map-explorer` | 1,223 |
| `outreach` | 1,157 |
| `analytics` | 1,105 |
| `settings` | 1,064 |

`SOURCE-VERIFIED` via line count.

### 2.1 Why this matters beyond style

A 1,401-line client component means:

- State, layout, data fetching, mock data, and business rules are co-located.
- Any test of that page is either a snapshot or an integration test — component-level testing is impractical, which is consistent with why `tests/unit/components.test.tsx` is the file that fails.
- The mock data arrays inside these files (`CANONICAL_13_UI_AGENTS`, `REALISTIC_BUSINESSES`, `DEFAULT_CAMPAIGNS`) cannot be removed by configuration. They are compiled in.

### 2.2 Recommendation (`PROPOSED`)

Extract into: `page.tsx` (composition) + `_components/` (presentational) + `_hooks/` (data) + `_lib/` (formatting). Do this **only** for pages being functionally rebuilt in M2–M5. Do not perform a cosmetic refactor of a page whose data layer is fake; the fake is the problem, not the file length.

---

## 3. The `"use client"` layout problem

`frontend/src/app/(dashboard)/layout.tsx` is a client component with no auth guard (`SOURCE-VERIFIED`).

Effects:

1. **All 15 dashboard pages are reachable anonymously.** Confirmed by absence of `middleware.ts` and absence of any guard in the layout.
2. Server-side data fetching in the dashboard tree is impossible without restructuring, which is why data fetching is client-side and why loading states are a recurring issue.
3. The page shell (sidebar, header) is shipped as JavaScript on every route — measurable bundle cost.

**Correction (`PROPOSED`):** the layout becomes a Server Component. Auth is enforced in `middleware.ts` plus a server-side session read in the layout. Client components are pushed down to interactive leaves. This is specified in `23` and `34`.

---

## 4. Synthetic surfaces in the frontend

These are the highest-severity frontend findings. Each is detailed in `14`; recorded here for completeness.

| Surface | Mechanism | Customer impact |
|---|---|---|
| `/audits` | `Math.random()` for scores | Audit reports are not audits |
| `/map-explorer` | `REALISTIC_BUSINESSES` constant, header "Businesses Found (2,847)" | False inventory count; fabricated businesses |
| `/ai-agents` | `CANONICAL_13_UI_AGENTS` constant | 13 agents presented as available; none execute |
| `/outreach` | `DEFAULT_CAMPAIGNS` constant | Campaigns that were never created |
| `/website-builder` | No backend at all | A builder that builds nothing |
| `/leads/[leadId]` audit panel | Fixed score set | Every lead scores identically |

### 4.1 The common failure mode

Each of these surfaces is *visually indistinguishable* from a working feature. There is no "demo data" banner, no disabled state, no source indicator. A prospect seeing a demo cannot tell that the numbers are constants. This is the central product-integrity problem, and it is a **frontend** problem as much as a backend one: the frontend chose to render plausible numbers rather than an empty state.

---

## 5. Data-fetching patterns

Three patterns coexist (`SOURCE-VERIFIED`):

1. **Client `fetch` to own API route** — most pages.
2. **Client `fetch` to Express API base URL** — dashboard metrics, activity, projects, clients, billing.
3. **Direct Mongoose calls in API routes** — server-side, bypassing the Express API entirely.

### 5.1 Consequence

There is no single client. A page can be reading MongoDB while another reads Catalyst and a third reads a mock. The user has no way to know which. This is the frontend manifestation of the persistence problem in `04`.

### 5.2 Recommendation (`PROPOSED`)

A generated, typed API client per domain, with a single base URL, uniform error envelope (`{ error: { code, message, correlationId } }`), and no fallback logic in the client. Fallback logic in the client is what produced "empty state that looks like success".

---

## 6. Error and empty states

Current behaviour on backend failure: `console.warn(...)` then render deterministic or empty data (`SOURCE-VERIFIED` across `analytics`, `agents`, `templates`, `projects`, `clients`, `teams`, `billing`, `dashboard`).

This is the wrong default for a B2B operations product. An operator who sees "0 leads" cannot distinguish "no leads" from "the database is down". That distinction is the entire value of an operations tool.

**Correction (`PROPOSED`):** three distinct states, always distinguishable:

- `EMPTY` — the system answered, the answer is zero.
- `DEGRADED` — a dependency failed; show which one, show a retry, show last-known-good timestamp.
- `ERROR` — the request failed; show correlation ID.

Never collapse these into one rendering.

---

## 7. Design system observations (positive)

Worth preserving, and specified further in `23`:

- Warm off-white canvas with dark charcoal sidebar.
- Restrained emerald accent used for state, not decoration.
- Dense tabular layouts appropriate to an operations tool.
- Consistent card/panel rhythm across pages.
- Lucide iconography applied consistently.

`SOURCE-VERIFIED` from the layout, page shells, and Tailwind configuration. This is a genuine asset and the plan does not propose changing it.

---

## 8. Accessibility and internationalisation

**Not assessed.** No automated a11y run was performed, no axe/Lighthouse audit exists in the repository, and no i18n framework is present (`SOURCE-VERIFIED` absence). Status: `BLOCKED` for a11y conformance claims.

**Recommendation (`PROPOSED`):** add `eslint-plugin-jsx-a11y` and a Playwright + axe smoke test in M2. For an India-first product, do not commit to i18n before the English product is truthful; defer to M10.

---

## 9. Frontend verdict

| Dimension | Assessment |
|---|---|
| Visual design | **Strong** — preserve |
| Information architecture | **Strong** — preserve the map, rebuild the pages |
| Type safety | Pass |
| Auth enforcement | **Absent** |
| Data truthfulness | **Failed** — six surfaces fabricate |
| Testability | **Weak** — monoliths, no component coverage of real behaviour |
| Error semantics | **Wrong default** — failures render as plausible emptiness |
| Performance | Unmeasured (`BLOCKED`) |

The frontend is the best part of this repository and the part most responsible for the product's credibility problem. Both statements are true: it looks good, and it lies. The fix is to keep the look and delete the lying.
