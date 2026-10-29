# Contributing to AgencyOS

Thank you for your interest in contributing to **AgencyOS**! This document provides instructions and guidelines for developers and AI contributors.

---

## 1. Code of Conduct & Development Principles

- **Deterministic Over Heuristics:** Source eligibility, suppression lists, credit budgets, auth, and state transitions must never depend purely on LLM heuristics. Always use deterministic validation (Zod, database constraints, strict conditionals).
- **Evidence-Based Progress:** Never mark a feature, migration, or fix complete without running verification checks (`npm run typecheck`, `npm run test`, `npm run build`).
- **No Scraping Restrictions:** Adhere strictly to Google Maps Platform Terms of Service Section 3.2.3, the Indian Digital Personal Data Protection (DPDP) Act 2023, and TRAI TCCCPR rules.
- **Secrets Safety:** Never commit API keys, database credentials, or secret tokens into code or documentation.

---

## 2. Local Development Workflow

1. **Clone & Install:**
   ```bash
   git clone <repo-url>
   cd Startup-Idea-Enhancement
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env.local
   ```

3. **Run Dev Server:**
   ```bash
   npm run dev
   ```

4. **Verify Verification Gates Before Submitting PR:**
   ```bash
   npm run typecheck
   npm run test
   npm run build
   ```

---

## 3. Pull Request Guidelines

- Branch naming convention: `feat/TASK-XXX-name` or `fix/TASK-XXX-name`.
- Link PR to a backlog item in `docs/planning/BACKLOG.md`.
- Ensure all 3 verification gates pass cleanly without warnings.

