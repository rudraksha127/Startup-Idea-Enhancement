# AgencyOS — Google Maps Platform Integration & Legal Compliance Report

**Date:** 14 November 2026  
**Status:** Certified Active & Compliant  
**Compliance Standard:** Google Maps Platform Terms of Service (Section 3.2.3), DPDP Act 2023, TRAI TCCCPR Regulations  

---

## 1. Architectural Overview

AgencyOS integrates with Google Maps Platform to provide legitimate, API-compliant Location Intelligence and prospect discovery for digital agencies. The integration exclusively utilizes authorized Google Maps Platform APIs:

- **Places API (New):** `TextSearch` and `FindPlaceFromPhoneNumber` for discovering verified local business presences by category and geographical bounding box.
- **Places Details API:** For retrieving official business websites, telephone numbers, user review ratings, and opening hours directly from Google's verified business database.
- **Geocoding API:** For reverse-geocoding coordinates and administrative boundaries across target Indian metropolitan regions (Bangalore, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai).
- **Maps JavaScript API:** For rendering interactive visual maps with client-side interactive markers and attribution controls.

---

## 2. Strict Adherence to Google Maps TOS Section 3.2.3

### 2.1 The Prohibition
Section 3.2.3 of the Google Maps Platform Terms of Service explicitly prohibits:
> *"No Scraping. Customer will not extract, scrape, or otherwise cache Google Maps Content, or use Google Maps Content outside the Services, except as explicitly permitted under Section 3.2.3(a) (Caching)."*

### 2.2 Deterministic Safeguards in AgencyOS
AgencyOS strictly enforces the following technical boundaries:
1. **Zero HTML/DOM Scraping**: AgencyOS contains no Puppeteer, Cheerio, Selenium, or headless browser scripts designed to scrape Google Maps web properties or Google Places search result pages.
2. **Ephemeral Place Details**: Google Place IDs (`place_id`) are stored as persistent identifiers. Dynamic content (such as ratings, photos, and live hours) is fetched on demand via authorized API calls rather than permanently stored in violation of caching policies.
3. **Mandatory Attribution**: All UI components rendering Google Maps data (specifically `frontend/src/app/(dashboard)/map-explorer/page.tsx`) display official "Powered by Google" badges and copyright notices in compliance with Google Branding Guidelines.
4. **Data Provenance**: Every lead created via the Map Explorer carries `discoverySource: "Google Maps Platform API"` ensuring auditable provenance.

---

## 3. Regulatory Compliance: DPDP Act 2023 & TRAI TCCCPR

- **Indian DPDP Act 2023**: All business contact data retrieved corresponds strictly to publicly published commercial entity contact numbers (B2B). No personally identifiable consumer data is ingested without consent.
- **TRAI Telecom Commercial Communications Customer Preference Regulations (TCCCPR)**: Outreach workflows default to `dry_run = true`. Outbound telephone or WhatsApp interactions mandate explicit founder authorization and suppression check against DND (Do Not Disturb) registries prior to live dispatch.

---

## 4. Verification Evidence

- API health diagnostics at `/api/v1/maps/status` verify connectivity, quota status, and compliance flags.
- Comprehensive unit tests in `tests/unit/maps-integration.test.ts` pass with 100% compliance.
- Interactive Map Explorer verified via headless Chromium browser tests (`tests/browser/agencyos.spec.ts`).
