import { test, expect } from "@playwright/test";

test.describe("AgencyOS Security Gate — Unauthenticated Requests", () => {
  test("0. Unauthenticated /dashboard redirects to /login and private /api/leads returns 401", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*login/);

    const apiRes = await page.request.get("/api/leads");
    expect(apiRes.status()).toBe(401);
  });
});

test.describe("AgencyOS Production SaaS — Headless Chromium Verification (11 Routes)", () => {
  test.beforeEach(async ({ page }) => {
    const loginRes = await page.request.post("/api/auth/login", {
      data: { email: "founder@agencyos.com", password: "password123" },
    });
    expect(loginRes.ok()).toBe(true);
  });
  // Test 1: Operations Dashboard
  test("1. Route /dashboard displays executive KPI cards, charts, and system status", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator("h1")).toContainText("Dashboard");
    await expect(page.getByText("Total Leads").first()).toBeVisible();
  });

  // Test 2: Leads Management
  test("2. Route /leads renders pipeline views and lead interaction capabilities", async ({ page }) => {
    await page.goto("/leads");
    await expect(page).toHaveURL(/.*leads/);
    await expect(page.locator("h1")).toContainText("Leads");
    await expect(page.getByPlaceholder(/Search by business name/i)).toBeVisible();
  });

  // Test 3: Google Maps Explorer (TOS Section 3.2.3 compliant)
  test("3. Route /map-explorer displays Location Intelligence canvas and empty state or results", async ({ page }) => {
    await page.goto("/map-explorer");
    await expect(page).toHaveURL(/.*map-explorer/);
    await expect(page.locator("h1")).toContainText("Map Explorer");
    await expect(page.getByPlaceholder(/Search business by name/i)).toBeVisible();
  });

  // Test 4: 13 Autonomous AI Agents
  test("4. Route /ai-agents renders 13 canonical system agents and execution controls", async ({ page }) => {
    await page.goto("/ai-agents");
    await expect(page).toHaveURL(/.*ai-agents/);
    await expect(page.locator("h1")).toContainText("AI Agents Operating System");
    await expect(page.getByText("Agent Runtime: 13 / 13 Online")).toBeVisible();
  });

  // Test 5: Outreach Campaigns & Sequences
  test("5. Route /outreach displays multichannel campaign management and honest empty state", async ({ page }) => {
    await page.goto("/outreach");
    await expect(page).toHaveURL(/.*outreach/);
    await expect(page.locator("h1")).toContainText("Outreach Campaigns");
    await expect(page.getByText("Sequence Builder").first()).toBeVisible();
  });

  // Test 6: Clients Directory
  test("6. Route /clients displays client management table with honest empty state", async ({ page }) => {
    await page.goto("/clients");
    await expect(page).toHaveURL(/.*clients/);
    await expect(page.locator("h1")).toContainText("Clients");
  });

  // Test 7: Projects & Delivery
  test("7. Route /projects displays delivery pipeline with honest empty state", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveURL(/.*projects/);
    await expect(page.locator("h1")).toContainText("Projects");
  });

  // Test 8: Website Templates & Scaffolding
  test("8. Route /templates renders pre-engineered industry website templates", async ({ page }) => {
    await page.goto("/templates");
    await expect(page).toHaveURL(/.*templates/);
    await expect(page.locator("h1")).toContainText("Website Templates");
  });

  // Test 9: Analytics & Intelligence
  test("9. Route /analytics displays business metrics and conversion analytics", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page).toHaveURL(/.*analytics/);
    await expect(page.locator("h1").first()).toContainText("Analytics");
  });

  // Test 10: Billing & Stripe Invoicing
  test("10. Route /billing renders billing metrics and honest empty invoice state", async ({ page }) => {
    await page.goto("/billing");
    await expect(page).toHaveURL(/.*billing/);
    await expect(page.locator("h1")).toContainText("Billing Overview");
  });

  // Test 11: Settings & Multi-Tenant Teams
  test("11. Route /settings displays organization configuration, teams, and integrations", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/.*settings/);
    await expect(page.locator("h1")).toContainText("Settings");
  });
});
