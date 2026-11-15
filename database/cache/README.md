# AgencyOS — Zoho Catalyst Cache

**Service:** Zoho Catalyst Cache  
**Purpose:** High-performance caching for Google Maps search results, API rate-limiting tokens, and short-lived user authentication sessions.

---

## 1. Cache Segments
* `place-search-cache` — Ephemeral TTL (3600s) for Google Maps search queries to minimize API cost while strictly adhering to Section 3.2.3 of Google Maps TOS.
* `rate-limit-tokens` — IP and tenant-level request count buckets.
* `agent-execution-locks` — Distributed mutex preventing concurrent duplicate agent dispatches.
