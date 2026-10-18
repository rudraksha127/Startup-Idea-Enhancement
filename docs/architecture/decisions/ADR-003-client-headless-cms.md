# ADR-003: Client Headless CMS Boundary for Delivered Websites

**Status:** APPROVED  
**Date:** 18 October 2026  
**Decider:** Chief Product Officer & Principal Software Architect  

---

## 1. Context & Problem Statement
In client delivery, coaching and skill-training institutes frequently update course batch start dates, new syllabus brochures, faculty additions, and fee discount notices. If client websites are built purely with hard-coded static code or code-level markdown, the solo agency founder will become an unpaid, frustrated data-entry clerk fielding constant WhatsApp requests for trivial text changes. Conversely, using full WordPress exposes the agency to slow loading times, security vulnerabilities, and broken plugins.

## 2. Decision
All delivered client websites must integrate a **locked-down Headless CMS** (Sanity.io or Supabase Studio content tables):
- The frontend remains a sub-second, static/server-rendered Next.js application.
- The client's administrative front-desk staff is provided credentials to a simple, restricted CMS portal allowing edits *only* to:
  1. Upcoming Batch Timetables (Course name, start date, timing, fee).
  2. Faculty Bios & Photos.
  3. Notice Board / Announcement Banners.
  4. Downloadable Course Syllabus PDFs.
- Layout, styling, navigation, WhatsApp routing scripts, and SEO metadata remain immutable and locked to agency code.

## 3. Consequences & Trade-offs
- **Positive:** Protects founder engineering bandwidth; eliminates 90% of routine client support tickets; delivers instant gratification for client staff while maintaining 95+ Google PageSpeed mobile scores.
- **Negative:** Requires initial setup time during template preparation (estimated 4–6 engineering hours once, then reusable across all client forks).
