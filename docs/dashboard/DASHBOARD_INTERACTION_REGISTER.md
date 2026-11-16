# AgencyOS Dashboard Interaction Register
**Document Reference:** `docs/dashboard/DASHBOARD_INTERACTION_REGISTER.md`  
**Audit Scope:** AgencyOS Dashboard Page (`/dashboard`), Navigation, Headers, and Associated Subcomponents  
**Environment:** Next.js 16 (Turbopack) & Zoho Catalyst CloudScale Data Store  
**Audit Status:** Fully Verified & Production-Ready (Zero Inert Buttons)

---

## 1. Interaction Inventory & Execution Matrix

This register audits all 39 interactive elements identified during the initial browser audit, documenting their click/tap action, destination route, underlying backend dependencies, and verified operational state.

| ID | UI Component / Element Label | Element Type | Trigger / Event | Destination Route / Target | Backend API Dependency | Verified Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **INT-01** | Global Search Input | `<input>` | `Focus / Type` | Global Search Popover | `GET /api/search?q={query}` | Verified |
| **INT-02** | Search Shortcut | `<kbd>Ctrl+K</kbd>` | `Keydown` | Focuses Search Input | None (Client DOM) | Verified |
| **INT-03** | Search Result Item (Lead) | `<button>` / `<Link>` | `Click / Enter` | `/leads?selected={id}` | `GET /api/leads/{id}` | Verified |
| **INT-04** | Search Result Item (Client) | `<button>` / `<Link>` | `Click / Enter` | `/clients` | `GET /api/clients` | Verified |
| **INT-05** | Search Result Item (Project) | `<button>` / `<Link>` | `Click / Enter` | `/projects` | `GET /api/projects` | Verified |
| **INT-06** | Date Range Filter Button | `<button>` | `Click` | Date Picker Dropdown Popover | None (Client State) | Verified |
| **INT-07** | Date Range Preset ("Today") | `<button>` | `Click` | `/dashboard?range=today` | `GET /api/dashboard/metrics?timeframe=today` | Verified |
| **INT-08** | Date Range Preset ("7 Days") | `<button>` | `Click` | `/dashboard?range=7d` | `GET /api/dashboard/metrics?timeframe=7d` | Verified |
| **INT-09** | Date Range Preset ("30 Days")| `<button>` | `Click` | `/dashboard?range=30d` | `GET /api/dashboard/metrics?timeframe=30d` | Verified |
| **INT-10** | Date Range Preset ("This Month") | `<button>` | `Click` | `/dashboard?range=this_month` | `GET /api/dashboard/metrics?timeframe=this_month` | Verified |
| **INT-11** | Date Range Preset ("Year to Date") | `<button>` | `Click` | `/dashboard?range=ytd` | `GET /api/dashboard/metrics?timeframe=ytd` | Verified |
| **INT-12** | Notification Bell Button | `<button>` | `Click` | Notifications Popover Menu | `GET /api/notifications` | Verified |
| **INT-13** | Notification "Mark All Read" | `<button>` | `Click` | Clears unread badge counter | `POST /api/notifications` | Verified |
| **INT-14** | Theme Toggle ("Light/Dark") | `<button>` | `Click` | Toggles HTML `dark` class | None (Client `localStorage`) | Verified |
| **INT-15** | User Profile Avatar / Menu | `<button>` | `Click` | User Profile Popover Menu | None (Client State) | Verified |
| **INT-16** | Profile Menu -> Settings | `<Link>` | `Click` | `/settings` | None (Next.js Page) | Verified |
| **INT-17** | Profile Menu -> Billing | `<Link>` | `Click` | `/billing` | None (Next.js Page) | Verified |
| **INT-18** | Total Leads KPI Card | `<Link>` | `Click` | `/leads` | `GET /api/leads` | Verified |
| **INT-19** | Leads Contacted KPI Card | `<Link>` | `Click` | `/outreach` | `GET /api/outreach` | Verified |
| **INT-20** | Positive Responses KPI Card | `<Link>` | `Click` | `/outreach?status=replied` | `GET /api/outreach?status=replied` | Verified |
| **INT-21** | Active Clients KPI Card | `<Link>` | `Click` | `/clients` | `GET /api/clients` | Verified |
| **INT-22** | Growth Chart CTA Button | `<Link>` | `Click` | `/map-explorer` | None (Client Route) | Verified |
| **INT-23** | Lead Sources Empty CTA Button| `<Link>` | `Click` | `/map-explorer` | None (Client Route) | Verified |
| **INT-24** | Revenue Timeframe Dropdown | `<button>` | `Click` | Opens timeframe menu | None (Client State) | Verified |
| **INT-25** | Revenue Timeframe Option | `<button>` | `Click` | Updates local revenue view | None (Client Filter) | Verified |
| **INT-26** | Live Activities "View All" | `<Link>` | `Click` | `/analytics` | None (Client Route) | Verified |
| **INT-27** | AI Agents Header "Manage →" | `<Link>` | `Click` | `/ai-agents` | `GET /api/agents` | Verified |
| **INT-28** | AI Agent Card (Research) | `<Link>` | `Click` | `/ai-agents?agent=research` | `GET /api/agents` | Verified |
| **INT-29** | AI Agent Card (Outreach) | `<Link>` | `Click` | `/ai-agents?agent=outreach` | `GET /api/agents` | Verified |
| **INT-30** | AI Agent Card (Reply Manager)| `<Link>` | `Click` | `/ai-agents?agent=reply` | `GET /api/agents` | Verified |
| **INT-31** | AI Agent Card (Sales Agent) | `<Link>` | `Click` | `/ai-agents?agent=sales` | `GET /api/agents` | Verified |
| **INT-32** | AI Agent Card (Content Agent)| `<Link>` | `Click` | `/ai-agents?agent=content` | `GET /api/agents` | Verified |
| **INT-33** | Recent Leads "View All" | `<Link>` | `Click` | `/leads` | `GET /api/leads` | Verified |
| **INT-34** | Recent Leads Empty CTA | `<Link>` | `Click` | `/ai-agents?agent=research` | None (Client Route) | Verified |
| **INT-35** | Recent Leads Row Click | `<Link>` | `Click` | `/leads?selected={id}` | `GET /api/leads` | Verified |
| **INT-36** | Clients Pipeline "View All" | `<Link>` | `Click` | `/clients` | `GET /api/clients` | Verified |
| **INT-37** | Clients Pipeline Empty CTA | `<Link>` | `Click` | `/leads` | None (Client Route) | Verified |
| **INT-38** | Website Builder "Open Builder"| `<Link>` | `Click` | `/templates` | None (Client Route) | Verified |
| **INT-39** | Sidebar Upgrade Plan Button | `<Link>` | `Click` | `/billing` | None (Client Route) | Verified |

---

## 2. Interaction Defect Remediations Summary

Before this audit, several elements suffered from unhandled clicks, non-existent routes, or synthetic fallbacks:
1. **Defect 1 (KPI Cards Inert):** The 4 top KPI cards were styled `<div>` elements without hyperlinks. Users clicking on "Total Leads" or "Positive Responses" had no feedback.
   - *Fix:* Wrapped each card in Next.js `<Link href="...">` with hover elevations (`hover:border-blue-500/30`, `hover:shadow-sm`) routing users directly to `/leads`, `/outreach`, and `/clients`.
2. **Defect 2 (Global Search Inert):** Header search bar had no backend route and did not respond to typing.
   - *Fix:* Built `/api/search` with cross-collection search (Leads, Clients, Projects) and connected debounced dropdown UI with arrow-key keyboard navigation and `Ctrl+K` shortcut.
3. **Defect 3 (Notification Bell Inert):** Notification bell button had no dropdown or read/unread state.
   - *Fix:* Built `/api/notifications` supporting unread badge count, dropdown popover, and "Mark all as read" API call.
4. **Defect 4 (Static "Mar 1, 2024" Date Filter):** Date filter badge was hardcoded to March 2024.
   - *Fix:* Converted to dynamic date picker popover using `Asia/Kolkata` local time, generating query parameter updates (`?range=...`) that dynamically re-query `/api/dashboard/metrics`.
5. **Defect 5 (Synthetic Charts & Activity Trap):** When the backend returned 0 records, components rendered hardcoded mock numbers (e.g. 2,847 leads, ₹2,45,000 revenue, Glow Beauty Salon activities).
   - *Fix:* Removed all synthetic default arrays. Replaced with honest empty states featuring action buttons guiding the user to start their pipeline.
