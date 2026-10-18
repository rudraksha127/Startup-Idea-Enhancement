# Source Registry

This registry tracks the foundational legal, commercial, and technical sources analyzed during this investigation.

---

## Source Index

| Source ID | Issuing Entity / Title | Publication / Event Period | Source Type | Evidence Status |
| :--- | :--- | :--- | :--- | :--- |
| **SRC-01** | Government of India — Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023) | August 2023 – Present | Primary Legal Statute | `VERIFIED` |
| **SRC-02** | Telecom Regulatory Authority of India (TRAI) — Telecom Commercial Communications Customer Preference Regulations (TCCCPR 2018) | 2018 – Amendments 2023 | Primary Regulatory Statute | `VERIFIED` |
| **SRC-03** | Meta Platforms Inc. — WhatsApp Business Messaging Policy & Cloud API Guidelines | 2024–2026 Policy Standard | Primary Platform TOS | `VERIFIED` |
| **SRC-04** | Google LLC — Google Maps Platform Terms of Service (Section 3.2.3 Restrictions) | 2024 Policy Standard | Primary Platform TOS | `VERIFIED` |
| **SRC-05** | Central Consumer Protection Authority (CCPA) — Guidelines for Prevention of Misleading Advertisements in Coaching Sector | 2024 Circular | Primary Regulatory Circular | `VERIFIED` |
| **SRC-06** | CodingClave & SVSS Technologies — Indore Regional Web Development Pricing Schedules | 2024–2025 Published Schedules | Commercial Agency Benchmark | `CORROBORATED` |
| **SRC-07** | NexOpsDev & ExpertWebWorld — Small Business Web Design & AMC Cost Analysis in Indore | 2024–2025 Rate Cards | Commercial Agency Benchmark | `CORROBORATED` |
| **SRC-08** | TuitionDesk & Proctur Research — Vendor Sales Cycles & Software Purchasing in Indian Coaching Hubs | 2024–2025 Industry Reports | EdTech B2B Market Analysis | `CORROBORATED` |
| **SRC-09** | Indore Education Ecosystem Studies — Bhawar Kuan & Geeta Bhawan Competitive Coaching Hubs | 2024 Local Market Data | Local Market Assessment | `CORROBORATED` |
| **SRC-10** | Future Multimedia, Skillfloor & NDMIT — Vijay Nagar & Bhawar Kuan IT Training Fee Structures | 2024 Course Catalogs | Industry Fee Schedules | `CORROBORATED` |

---

## Detailed Source Records

### SRC-01: Digital Personal Data Protection Act, 2023 (DPDP Act)
- **Issuing Entity:** Parliament of India / Ministry of Law and Justice.
- **Key Provisions Analyzed:**
  - Section 4: Grounds for processing personal data (explicit notice and consent required).
  - Section 7: Narrow definition of "Certain Legitimate Uses" (no broad commercial cold-outreach exemption).
  - Section 8: General obligations of Data Fiduciaries (erasure, security, transparency).
  - Section 33 & Schedule: Penalties up to ₹250 crore for significant non-compliance.
- **Findings:** Direct personal identifiers (names, personal mobile numbers, personal business emails) cannot be freely scraped and entered into automated cold marketing sequences without consent.

### SRC-02: TRAI TCCCPR 2018 (Unsolicited Commercial Communication)
- **Issuing Entity:** Telecom Regulatory Authority of India.
- **Key Provisions Analyzed:**
  - Mandatory registration on Distributed Ledger Technology (DLT) platforms for commercial SMS/Voice senders.
  - Ban on sending promotional or transactional SMS/calls from standard 10-digit consumer SIM cards.
- **Findings:** Cold calling or SMS blast marketing using standard mobile numbers is illegal in India and triggers carrier disconnection, DND fines, and blacklisting.

### SRC-03: Meta / WhatsApp Business Messaging Policy
- **Issuing Entity:** Meta Platforms, Inc.
- **Key Provisions Analyzed:**
  - Strict prohibition against sending unsolicited business messages to WhatsApp users without prior affirmative opt-in.
  - Template messaging requirements for business-initiated conversations under the WhatsApp Business API (WABA).
  - Anti-spam automated detection: cold messaging from unverified numbers or standard WhatsApp Business apps results in rapid account bans.
- **Findings:** Automated cold outreach via WhatsApp is completely unviable and violates platform terms. WhatsApp can only be used as an *inbound conversion channel* or after explicit user opt-in.

### SRC-04: Google Maps Platform Terms of Service
- **Issuing Entity:** Google LLC.
- **Key Provisions Analyzed:**
  - Section 3.2.3: License Restrictions explicitly forbid scraping, downloading, bulk caching, or storing Google Places/Maps content, as well as using Google Maps data to create or augment advertising or marketing databases.
- **Findings:** Scraping Google Maps to build cold calling or email lists violates Google TOS and exposes the operator to IP blacklisting and legal liability.

### SRC-05: CCPA Guidelines for Coaching Sector (2024)
- **Issuing Entity:** Central Consumer Protection Authority, Ministry of Consumer Affairs, Government of India.
- **Key Provisions Analyzed:**
  - Prohibition on 100% selection guarantees, false rank claims, and misleading representations of faculty and batch sizes.
- **Findings:** Coaching institutes in India are under intense scrutiny; they urgently need compliant, credible marketing assets rather than misleading hype, opening an opportunity for professional branding.

### SRC-06 & SRC-07: Indore Regional Agency Pricing Schedules
- **Issuing Entities:** SVSS Technologies, CodingClave, NexOpsDev, ExpertWebWorld.
- **Findings:**
  - Landing Pages: ₹4,000 – ₹15,000.
  - Multi-page WordPress sites (5–10 pages): ₹20,000 – ₹45,000.
  - Dynamic / Professional sites: ₹45,000 – ₹1,00,000.
  - Annual Maintenance Contracts (AMC): Quoted at 15%–20% of build cost (~₹3,000 – ₹10,000/year, or ₹250–₹850/month).
- **Critical Insight:** Selling stand-alone maintenance retainers at ₹3,000–₹5,000/month is strongly resisted unless bundled with tangible business results (e.g., ongoing lead optimization, Google Business Profile management, local SEO updates).

### SRC-08: Coaching Vendor Sales Cycles & Software Purchasing
- **Issuing Entities:** TuitionDesk, Proctur Market Studies.
- **Findings:**
  - Single/Multi-center institutes are owned by an autocratic Founder / Managing Director who controls all spending.
  - Decision cycle: 2 weeks to 3 months.
  - Critical pain points: uncaptured inquiries, missed calls, fee collection chaos, seasonal student churn.
  - Institute owners reject theoretical tech features; they buy *admissions growth* and *operational control*.

### SRC-09 & SRC-10: Indore Education & Skill Hub Benchmarks
- **Issuing Entities:** MeritHub, Local Cluster Directories, Training Center Catalogs.
- **Findings:**
  - Bhawar Kuan: Dense cluster for MPPSC, UPSC, SSC, Banking test-prep. High seasonal vulnerability (March–July cycle). Owners are older, non-technical, heavily dependent on hoardings, demo classes, and student word-of-mouth.
  - Geeta Bhawan / South Tukoganj: Dominance of corporate giants (Allen, Aakash, Resonance) alongside legacy regional institutes. Hard to penetrate for a solo developer.
  - Vijay Nagar & Palasia: Thriving hub of independent IT, coding (Python, Java, Full Stack), digital marketing, and multimedia institutes. Year-round monthly batches, digitally literate younger owners, high reliance on online CPL and WhatsApp leads.
