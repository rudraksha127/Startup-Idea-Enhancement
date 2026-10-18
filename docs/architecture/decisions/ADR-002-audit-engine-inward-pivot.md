# ADR-002: Inward Audit Automation vs. Autonomous Unconsented Cold Outreach

**Status:** APPROVED  
**Date:** 18 October 2026  
**Decider:** Chief Information Security Officer, Legal Counsel & Systems Architect  

---

## 1. Context & Problem Statement
The initial concept envisioned an AI agent autonomously crawling the web, extracting prospect contact numbers and emails, and dispatching multi-channel cold messaging sequences across Email and WhatsApp. 

However, empirical legal and platform research revealed:
1. **DPDP Act 2023 (India):** Sourcing personal business contact details without consent lacks statutory legitimate use protections for direct commercial marketing.
2. **TRAI TCCCPR Regulations:** Commercial voice/SMS from standard SIM cards is illegal in India, requiring enterprise DLT registration.
3. **Meta WhatsApp Policies:** Cold, unsolicited messaging triggers rapid account bans and phone number blacklisting.
4. **Google Maps Platform Terms (Section 3.2.3):** Scraping Google Maps to compile marketing databases is strictly prohibited.

## 2. Decision
We pivot the platform's automation architecture **inward**:
- The internal OS will automate **data synthesis, programmatic technical audits (Core Web Vitals, broken forms, mobile latency), lead fit scoring, proposal generation, and uptime monitoring**.
- Direct outbound communication will be **founder-initiated and human-gated**: using verified public B2B business channels (targeted LinkedIn outreach, direct business emails with instant opt-out links, or in-person field meetings in Vijay Nagar).
- Autonomous cold WhatsApp mass messaging and Google Maps scrapers are permanently removed from the system scope.

## 3. Consequences & Trade-offs
- **Positive:** Complete immunity from DPDP Act penalties (up to ₹250 crore), zero risk of Meta WhatsApp phone bans, zero Google API termination risk, and vastly higher conversion rates (5x–10x higher response on personalized audits vs. spam blasts).
- **Negative:** Outbound contact volume is bounded by founder time, reinforcing the need for tight ICP qualification (Vijay Nagar skill institutes).
