# 23 — Information Architecture and UX

**Constraint from `AGENTS.md` and the founder brief: preserve the warm off-white canvas and dark charcoal sidebar visual identity.** This document does not propose a redesign. It proposes structural corrections that keep the existing look.

---

## 1. What to preserve (non-negotiable)

| Element | Why |
|---|---|
| Warm off-white page canvas | Reads as an operations tool, not a generic SaaS template |
| Dark charcoal sidebar | Anchors the product; strong recognition |
| Restrained emerald accent | Used for state, not decoration — keep that discipline |
| Dense tabular layouts | Correct for the customer's workflow |
| Lucide iconography | Consistent, lightweight |
| Card/panel rhythm | Already coherent across pages |

`SOURCE-VERIFIED` that these exist. No change is recommended to any of them.

---

## 2. The three structural problems

### P1 — The shell is a client component

`frontend/src/app/(dashboard)/layout.tsx` is `"use client"` with no guard. Consequences: every route is public, the shell ships as JS on every page, and server-side data fetching in the dashboard tree is impossible.

**Fix:** layout becomes a Server Component. Auth is enforced in `middleware.ts` *and* in the layout (defence in depth). Interactive leaves stay client components.

This does not change the visual output at all. It changes where rendering happens.

### P2 — Navigation does not reflect the work

Current navigation presents 15 flat destinations. The user's mental model is not 15 pages; it is: *who am I working on, what am I doing for them, what happened.*

**Fix:** group navigation into four work modes without changing the visual style:

| Group | Destinations | Question answered |
|---|---|---|
| **Find** | Prospects, Map explorer, Imports | Who should I approach? |
| **Assess** | Audits, Lead detail | What is wrong, and how do I prove it? |
| **Act** | Campaigns, Inbox, Templates | What am I doing about it? |
| **Report** | Clients, Projects, Reports, Analytics | What did I deliver, and what did it cost? |

Plus a persistent footer group: **Settings**, **Team**, **Billing**.

Fifteen items become five groups. Same sidebar width, same colours, same typography — one additional level of hierarchy.

### P3 — No provenance anywhere

No screen tells the user where a number came from or how fresh it is. This is the UX expression of `14`.

**Fix:** a consistent provenance affordance on every computed value:

```
Score 68  ⓘ
          └─ 12 checks · last run 14 Nov 2026 09:12 · view evidence
```

Three states, visually distinct but using existing colour vocabulary:

| State | Treatment |
|---|---|
| Fresh, real | Small muted dot + relative time |
| Stale (beyond freshness SLA) | Amber dot + "stale" |
| Unavailable | Grey dash + "not available" — **never a zero, never a fake** |

This is the highest-value UX change in the plan. It is also cheap: one component, applied where numbers appear.

---

## 3. Screens that must change behaviour, not looks

| Screen | Current | Required |
|---|---|---|
| `/dashboard` | Metrics with deterministic fallback | Real metrics or explicit degraded state with the failing dependency named |
| `/audits` | `Math.random()` | Empty state until real audits exist; then scored audits with evidence |
| `/map-explorer` | Hardcoded list + "2,847" | Real Places results (with 30-day discipline) or an explicit "connect Maps" state |
| `/ai-agents` | 13 cards presented as available | Agent list reflecting actual capability state: `available`, `supervised only`, `not configured` |
| `/outreach` | `DEFAULT_CAMPAIGNS` | Empty state; campaigns appear only when created |
| `/website-builder` | No backend | Explicitly "not available" or removed |
| `/leads/[id]` audit panel | Fixed scores | Real audit results or "no audit run — run one" |

Note the pattern: **most of these become emptier, and that is the correction.** A page that says "no audits yet — run your first" is more valuable than a page that shows invented scores, because it tells the truth about the product's state.

---

## 4. Empty, degraded, and error states

The current default (`catch → return []`) collapses three distinct situations into one rendering. The correction is three components used consistently.

### 4.1 `EmptyState`
- The system answered. The answer is zero.
- Copy: what this means, and the primary action to change it.
- Example: *"No audits yet. Audits score a site against 12 checks. Run your first →"*

### 4.2 `DegradedState`
- A dependency failed. The system cannot answer.
- Copy: which dependency, when it last worked, retry action.
- Example: *"Audit engine unreachable since 09:12. Showing last known results from 08:40. Retry."*
- Must never render zeros. Zeros imply an answer.

### 4.3 `ErrorState`
- The request itself failed.
- Copy: what failed, correlation ID, support path.

**Rule:** no screen may render a number unless one of these three states does not apply.

---

## 5. Progressive disclosure for the monoliths

Five pages exceed 1,000 lines (`05` §2). The fix is not a visual redesign; it is moving state and logic out of the page file.

| Page | Extraction |
|---|---|
| `ai-agents` (1,401) | `AgentList`, `AgentDetail`, `RunPanel`, `RunHistory`; data hooks; delete `CANONICAL_13_UI_AGENTS` |
| `map-explorer` (1,223) | `MapCanvas`, `ResultList`, `FilterBar`; delete `REALISTIC_BUSINESSES` |
| `outreach` (1,157) | `CampaignList`, `CampaignEditor`, `InboxPane`; delete `DEFAULT_CAMPAIGNS` |
| `analytics` (1,105) | `MetricGrid`, `TrendChart`, `BreakdownTable`; no fallback data |
| `settings` (1,064) | `ProfileSection`, `OrgSection`, `IntegrationSection`, `BillingSection`; resolve user from session |

Perform extraction **only** when the page's data layer is being rebuilt. Refactoring a page whose data is fake produces a well-organised fake.

---

## 6. Interaction register

Establish a single document recording every interactive element and its real behaviour, replacing ad-hoc assumptions. Each row: control, screen, effect, permission required, whether it performs an external action.

Purpose: prevents a second generation of buttons that do nothing. A button that no-ops is a lie at a smaller scale, and the same discipline that removes fake data applies.

`PROPOSED`, M1 deliverable, ~1 day.

---

## 7. Accessibility

Not assessed (`BLOCKED`). Minimum targets (`PROPOSED`, M2):

- Semantic landmarks in the shell.
- Focus visible on all interactive elements.
- Colour contrast ≥ 4.5:1 for text (the emerald accent on off-white should be checked).
- Every icon-only control has an accessible name.
- Keyboard reachability for the sidebar, tables, and dialogs.
- `eslint-plugin-jsx-a11y` in CI.
- One Playwright + axe smoke test over the five highest-traffic screens.

---

## 8. Responsive behaviour

Dense tables at small viewports are the known weakness. `PROPOSED`:

- Sidebar collapses to icons below `lg`, to a drawer below `md`.
- Tables become card lists below `md` (definition-list style, same data).
- No horizontal scroll for primary actions.

Not a redesign; a set of rules applied to existing components.

---

## 9. What the user should be able to answer in 10 seconds

A design test for every screen:

1. **Where am I?** (breadcrumb + active nav)
2. **What is this number, and is it real?** (provenance affordance)
3. **Is anything broken?** (degraded banner)
4. **What should I do next?** (one primary action per screen)

Today, screen 2 is unanswerable everywhere. That is the UX core of this plan.

---

## 10. IA change summary

| Change | Visual impact | Effort |
|---|---|---|
| Layout → Server Component | None | M |
| Nav grouped into 5 groups | Small — one hierarchy level | S |
| Provenance affordance | Small — a dot and a popover | S |
| Empty/Degraded/Error components | Positive — pages become honest | S |
| Monolith extraction | None | L (incremental) |
| Interaction register | None | S |
| A11y baseline | Minimal | S |

Every change preserves the identity. The largest visible change is that **fake numbers become honest empty states**, which will make the product look less complete and be far more credible.
