# AgencyOS Dashboard Functional Specification
**Document Version:** 1.0.0  
**Status:** Approved Baseline & Production-Ready  
**Scope:** Strictly AgencyOS Dashboard Page (`/dashboard`), direct Layout dependencies, and associated Dashboard APIs  
**Authoritative Business Database:** Zoho Catalyst CloudScale Data Store (with Edge MongoDB fallback for local development)  
**Timezone Reference:** `Asia/Kolkata` (IST, UTC+05:30)

---

## 1. Executive Summary & Design System Conformance
The AgencyOS Dashboard provides an operational overview of business acquisition, client management, revenue, and autonomous AI agents. 

Conforming strictly with the AgencyOS Design Reference:
- **Visual Palette:** Dark charcoal left sidebar (`#18191B` / `#1F242F`), warm off-white workspace (`#F8F9FA` / `#F3F4F6`), pure white cards (`#FFFFFF`), with restrained blue (`#2563EB`), green (`#16A34A`), and muted slate accents (`#64748B`).
- **Clean Business Baseline:** Zero synthetic records, zero demo metrics, zero fake growth rates (e.g., eliminating hardcoded `"2,847"` leads, `"₹2,45,000"` fake revenue, and synthetic salons/spas). The dashboard displays an authentic zero baseline until actual campaigns and leads are recorded.
- **Strict Scope Boundaries:** Modifications are isolated to `/dashboard`, its header/nav controls, and its dedicated API endpoints (`/api/dashboard/metrics`, `/api/dashboard/activity`, `/api/search`, `/api/notifications`). Unrelated modules (Map Explorer, Sequence Builder, Leads, Billing) remain structurally untouched.

---

## 2. Dashboard Component Inventory

| Component Path | Name | Role & Architecture | Empty State Strategy |
| :--- | :--- | :--- | :--- |
| `frontend/src/app/(dashboard)/dashboard/page.tsx` | `DashboardPage` | Top-level Next.js Client Component orchestrating metrics fetching, date filtering (`useSearchParams`), layout grid, and subcomponent delegation. | Shows clean skeleton during SWR fetch, renders honest zero-state cards on 0 records. |
| `frontend/src/components/layout/app-header.tsx` | `AppHeader` | Global navigation bar containing search bar (`Cmd+K`), date range badge, notification bell with unread badge, and user profile avatar. | Search dropdown: "No matches found"; Notifications: "No new notifications". |
| `frontend/src/features/dashboard/components/metric-cards.tsx` | `MetricCards` | 4 primary business KPI cards: Total Leads, Leads Contacted, Positive Responses, Active Clients. | Renders `0` with neutral `"No prior period"` pill when delta cannot be computed. |
| `frontend/src/features/dashboard/components/leads-growth-chart.tsx` | `LeadsGrowthChart` | Recharts responsive multi-line area chart plotting cumulative leads, contacted, positive replies, and converted clients over time. | Compass icon with `"No growth data yet"` and CTA button pointing to `/map-explorer`. |
| `frontend/src/features/dashboard/components/lead-sources-chart.tsx` | `LeadSourcesChart` | Recharts Donut chart visualizing lead source attribution percentages (Google Maps, Website Scraper, Manual). | Centered neutral doughnut with `"0 Total"` and message `"No leads captured yet"`. |
| `frontend/src/features/dashboard/components/revenue-overview.tsx` | `RevenueOverview` | Bar chart tracking monthly revenue collection with interactive timeframe dropdown (`This Month`, `Last 30 Days`, `Year to Date`). | Displays `₹0` with `"No revenue recorded yet"` when no paid invoices exist. |
| `frontend/src/features/dashboard/components/recent-activity.tsx` | `RecentActivity` | Real-time audit log of operational events (lead creation, outreach dispatched, reply received, project delivery). | Activity icon with `"No operational activities yet"`. |
| `frontend/src/features/dashboard/components/ai-agents-card.tsx` | `AiAgentsCard` | Status summary of 5 specialized agents (Research, Outreach, Reply Manager, Sales, Content). | Shows `Idle • Ready` pills with 0 daily tasks processed until agents are dispatched. |
| `frontend/src/features/dashboard/components/recent-leads-card.tsx` | `RecentLeadsCard` | Table displaying recently captured business leads with opportunity ratings and direct links. | Checkmark icon with `"No leads in pipeline yet"`. |
| `frontend/src/features/dashboard/components/clients-pipeline-card.tsx` | `ClientsPipelineCard` | Overview of active agency client projects, retainers, and deliverable milestones. | Briefcase icon with `"Pipeline is clean — Convert qualified leads"`. |
| `frontend/src/features/dashboard/components/website-builder-banner.tsx` | `WebsiteBuilderBanner` | Quick-launch card for template generation and agency client deliverables. | Displays production agency templates with one-click editor launch. |

---

## 3. KPI Definitions and Calculation Formulas

All dashboard calculations follow strict accounting and operational formulas derived from persisted records:

### 1. Total Leads ($L_{total}$)
- **Definition:** The count of unique business entities stored in the organization's database.
- **Formula:** 
  $$\sum_{i=1}^{N} [ \text{Lead}_i \in \text{Organization} ]$$
- **Contract Key:** `metrics.totalLeads` (normalized from Catalyst Data Store `leads.length` or MongoDB `Lead.countDocuments({ organizationId })`).
- **Baseline Default:** `0`. Never defaults to `"2,847"`.

### 2. Leads Contacted ($L_{contacted}$)
- **Definition:** Unique leads that have received at least one email, SMS, or LinkedIn message.
- **Formula:**
  $$\sum [ \text{Lead}_i \mid \text{qualificationStatus} = \text{"Contacted"} \lor \text{status} = \text{"Contacted"} \lor \text{lastContactedAt} \neq \text{null} ]$$
- **Contract Key:** `metrics.qualifiedLeads` / `metrics.contacted`.
- **Baseline Default:** `0`. Never defaults to `"892"`.

### 3. Positive Responses ($L_{replied}$)
- **Definition:** Leads that replied positively, showed interest, or booked a qualification meeting.
- **Formula:**
  $$\sum [ \text{Lead}_i \mid \text{qualificationStatus} \in \{\text{"Qualified"}, \text{"Proposal"}\} \lor \text{status} \in \{\text{"Replied"}, \text{"Interested"}\} ]$$
- **Contract Key:** `metrics.activeOutreaches` / `metrics.positiveReplies`.
- **Baseline Default:** `0`. Never defaults to `"142"`.

### 4. Active Clients ($C_{active}$)
- **Definition:** Verified paying clients with active retainers or delivered projects.
- **Formula:**
  $$\sum [ \text{Project}_j \mid \text{status} = \text{"Active"} ] + \sum [ \text{Lead}_i \mid \text{qualificationStatus} = \text{"Converted"} ]$$
- **Contract Key:** `metrics.convertedClients` / `metrics.activeClients`.
- **Baseline Default:** `0`. Never defaults to `"38"`.

### 5. Revenue Billed & Collected ($R_{paid}$)
- **Definition:** Sum of actual realized cash inflow from paid invoices.
- **Formula:**
  $$\sum_{k=1}^{M} \text{Invoice}_k.\text{amount} \quad \forall \; \text{Invoice}_k \mid \text{status} = \text{"Paid"}$$
- **Contract Key:** `revenueOverview.totalBilled`.
- **Baseline Default:** `₹0`. Never defaults to `"₹2,45,000"`.

---

## 4. API Endpoints and Response Contracts

### 4.1 GET `/api/dashboard/metrics`
- **Authentication:** Scoped via Catalyst User Token / Session Cookie.
- **Query Parameters:**
  - `timeframe`: `"today" | "yesterday" | "7d" | "30d" | "this_month" | "last_month" | "ytd" | "all"` (Default: `"30d"`).
- **Success Response (HTTP 200 - Clean Zero Baseline):**
```json
{
  "metrics": {
    "totalLeads": 0,
    "qualifiedLeads": 0,
    "activeOutreaches": 0,
    "convertedClients": 0,
    "leadsTrend": "No prior period",
    "qualifiedTrend": "No prior period",
    "outreachTrend": "No prior period",
    "convertedTrend": "No prior period"
  },
  "growthHistory": [],
  "sources": [],
  "revenueOverview": {
    "totalFormatted": "₹0",
    "totalRaw": 0,
    "trend": "No prior period",
    "monthly": []
  },
  "agents": [
    { "name": "Research Agent", "role": "Scanning locations", "status": "Idle", "processedToday": 0, "dailyTarget": 50 },
    { "name": "Outreach Agent", "role": "Sending emails", "status": "Idle", "processedToday": 0, "dailyTarget": 50 },
    { "name": "Reply Manager", "role": "Handling responses", "status": "Idle", "processedToday": 0, "dailyTarget": 25 },
    { "name": "Sales Agent", "role": "Booking meetings", "status": "Idle", "processedToday": 0, "dailyTarget": 20 },
    { "name": "Content Agent", "role": "Creating content", "status": "Idle", "processedToday": 0, "dailyTarget": 15 }
  ]
}
```

### 4.2 GET `/api/dashboard/activity`
- **Response (HTTP 200):**
```json
{
  "activities": []
}
```
*Note: Returns empty array gracefully without triggering 500 error.*

### 4.3 GET `/api/search`
- **Query Parameter:** `q` (minimum 2 characters).
- **Execution:** Debounced 300ms in `AppHeader`. Performs scoped regex search across business leads (`businessName`, `category`, `location`), clients (`businessName`, `contactPerson`), and projects (`title`, `clientName`).
- **Response (HTTP 200):**
```json
{
  "results": [
    {
      "id": "lead_123",
      "type": "lead",
      "title": "The Urban Kitchen",
      "subtitle": "Restaurant • Indore (Contacted)",
      "href": "/leads?selected=lead_123"
    }
  ]
}
```

### 4.4 GET & POST `/api/notifications`
- **GET Response (HTTP 200):**
```json
{
  "notifications": [],
  "unreadCount": 0
}
```
- **POST `/api/notifications` (Action: `mark-all-read`):**
  - Marks in-memory/DB notifications as read.
  - Returns `{ success: true, unreadCount: 0 }`.

---

## 5. Header Interactions, Global Search & Date Filters
1. **Global Search Bar:**
   - Shortcut: `Ctrl+K` (Windows/Linux) or `Cmd+K` (macOS) focuses input instantly.
   - Dropdown keyboard navigation: `ArrowDown` to highlight next, `ArrowUp` to highlight previous, `Enter` to open, `Escape` to close.
   - Click outside listener closes the dropdown automatically.
2. **Notification Bell:**
   - Displays unread counter badge if count > 0.
   - Click opens dropdown popover displaying current system notifications.
   - Includes "Mark all as read" button which fires POST `/api/notifications`.
   - Empty state displays: "No new notifications".
3. **Date Range Filter:**
   - Computes dynamic dates formatted in `Asia/Kolkata` local time (e.g., `Today`, `Last 7 Days`, `Last 30 Days`).
   - Selecting a date range appends `?range=7d` to dashboard URL, triggering refetch of `/api/dashboard/metrics?timeframe=7d`.
4. **User Profile Dropdown:**
   - Displays user avatar, name, and role.
   - Interactive popover reveals Account Settings (`/settings`), Billing (`/billing`), Team management, and Sign Out action.

---

## 6. Button and Navigation Action Matrix

| Source Element | Action / Event | Destination / Effect |
| :--- | :--- | :--- |
| **Total Leads Card** | Click Card | Navigates to `/leads` |
| **Leads Contacted Card** | Click Card | Navigates to `/outreach` |
| **Positive Responses Card** | Click Card | Navigates to `/outreach?status=replied` |
| **Active Clients Card** | Click Card | Navigates to `/clients` |
| **Growth Chart Empty CTA** | Click "Discover Opportunities" | Navigates to `/map-explorer` |
| **Lead Sources Empty CTA** | Click "Find Leads" | Navigates to `/map-explorer` |
| **AI Agent Cards** | Click Agent Item | Navigates to `/ai-agents?agent=[name]` |
| **Manage AI Agents Link** | Click "Manage Agents →" | Navigates to `/ai-agents` |
| **Recent Leads Table Rows** | Click Lead Row | Navigates to `/leads?selected=[id]` |
| **Recent Leads "View All"** | Click "View All →" | Navigates to `/leads` |
| **Clients Pipeline Rows** | Click Client Row | Navigates to `/clients` |
| **Clients Pipeline "View All"** | Click "View All →" | Navigates to `/clients` |
| **Live Activities "View All"** | Click "View All →" | Navigates to `/analytics` |
| **Sidebar "Map Explorer"** | Click Sidebar Item | Navigates to `/map-explorer` |
| **Sidebar "AI Agents"** | Click Sidebar Item | Navigates to `/ai-agents` |
| **Sidebar "Outreach"** | Click Sidebar Item | Navigates to `/outreach` |
| **Sidebar "Clients"** | Click Sidebar Item | Navigates to `/clients` |
| **Sidebar "Projects"** | Click Sidebar Item | Navigates to `/projects` |
| **Sidebar "Analytics"** | Click Sidebar Item | Navigates to `/analytics` |
| **Sidebar "Billing"** | Click Sidebar Item | Navigates to `/billing` |
| **Sidebar "Settings"** | Click Sidebar Item | Navigates to `/settings` |
| **Upgrade Plan Button** | Click "Upgrade →" | Navigates to `/billing` |

---

## 7. Data Hygiene, Zero-Baseline Rules & Safe Retention
1. **Zero Synthetic Records:** Hardcoded arrays (`DEFAULT_GROWTH_DATA`, `DEFAULT_SOURCES`, `DEFAULT_ACTIVITIES`, `DEFAULT_MONTHLY_REVENUE`) have been completely eliminated.
2. **Graceful Zero-States:** When arrays are empty (`[]`), widgets do NOT fall back to fake screenshots or demo mocks. They render clean empty state views designed specifically to inform the user that their operations are ready to begin.
3. **Data Integrity:** No existing real records in Zoho Catalyst Data Store were deleted or modified. The database schema remains intact for all business entities.
