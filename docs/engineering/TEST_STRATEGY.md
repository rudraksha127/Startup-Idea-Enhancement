# Test Strategy & Quality Assurance Plan — Autonomous Agency OS

**QA Lead & Test Architect Specification**  
**Testing Frameworks:** Vitest (Unit & Integration), Playwright (E2E Browser Testing)  

---

## 1. Testing Pyramid & Verification Levels

```
               ▲
              / \
             /   \      End-to-End (Playwright)
            / E2E \     - Critical User Journeys (Kanban drag-and-drop, Login)
           /-------\
          /  Integ  \   Integration (Vitest + Supabase Test DB)
         /   Tests   \  - API routes, RLS policies, Webhook receivers
        /-------------\
       /     Unit      \ Unit Tests (Vitest)
      /      Tests      \ - Pure scoring algorithms, Zod schemas, Suppression matchers
     /-------------------\
```

---

## 2. Test Suite Inventory

### 2.1 Unit Tests (`tests/unit/`)
| Test ID | Scope | Verification Criteria |
| :--- | :--- | :--- |
| **TEST-UNIT-001** | Lead Fit Scoring (`lib/scoring/`) | Verifies that a site with LCP > 4.5s and missing WhatsApp CTA scores >= 75 points. |
| **TEST-UNIT-002** | Zod Ingestion Schema (`lib/validation/`) | Rejects invalid URLs, malformed phone numbers, or missing locality. |
| **TEST-UNIT-003** | Suppression Matcher (`lib/suppression/`) | Correctly matches root domain regardless of `www.` or subdomain variations. |
| **TEST-UNIT-004** | Banned Source Filter | Rejects `sourceProvenance: 'GOOGLE_MAPS_SCRAPE'` with immediate validation exception. |
| **TEST-UNIT-005** | Proposal Generator Math | Validates 50% upfront split and quarterly advance retainer calculation. |

### 2.2 Integration Tests (`tests/integration/`)
| Test ID | Scope | Verification Criteria |
| :--- | :--- | :--- |
| **TEST-INT-001** | Prospect Ingestion API | Posts valid payload; verifies record inserted in DB with status `DISCOVERED`. |
| **TEST-INT-002** | Audit Webhook Receiver | Validates HMAC signature; updates audit metrics and changes status to `QUALIFIED`. |
| **TEST-INT-003** | Row Level Security (RLS) | Verifies unauthenticated queries return 0 rows; authenticated operator has full CRUD. |
| **TEST-INT-004** | Emergency Kill Switch API | Flipped kill switch blocks all subsequent audit dispatch attempts with HTTP 403. |

### 2.3 End-to-End Browser Tests (`tests/e2e/`)
| Test ID | Scope | Verification Criteria |
| :--- | :--- | :--- |
| **TEST-E2E-001** | Operator Login & Dashboard | Logs into operator account; verifies Kanban columns render without console errors. |
| **TEST-E2E-002** | Lead Stage Drag-and-Drop | Drags lead card from `QUALIFIED` to `IN_DISCUSSION`; verifies DB status updates in real-time. |
| **TEST-E2E-003** | Client Template WhatsApp CTA | Clicks WhatsApp CTA button on mobile viewport; verifies correct pre-filled message URL. |

---

## 3. Mocking & External Dependency Policy

1. **Google PageSpeed API:** Never invoke live Google APIs during automated CI runs. Use pre-recorded fixture responses in `tests/fixtures/pagespeed-mock.json`.
2. **Supabase Local Testing:** Run automated integration tests against an isolated local Supabase container via `supabase start` and `supabase test db`.
3. **External Communications:** Real email and WhatsApp delivery channels are mocked by default in test and staging environments.
