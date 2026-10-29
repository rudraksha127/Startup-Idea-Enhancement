import { test, expect } from "@playwright/test";

test.describe("AgencyOS SaaS End-to-End Workflows", () => {
  test("1. Login flow authenticates founder user and redirects to dashboard", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h2")).toContainText("Sign in to your agency");

    await page.fill('input[type="email"]', "founder@agencyos.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator("h1")).toContainText("Operations Dashboard");
  });

  test("2. Opening the Operations Dashboard displays metrics and charts", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toContainText("Operations Dashboard");
    await expect(page.getByText("Total Leads").first()).toBeVisible();
    await expect(page.getByText("Leads Growth").first()).toBeVisible();
    await expect(page.getByText("Recent Activity").first()).toBeVisible();
  });

  test("3. Navigating to Leads table view", async ({ page }) => {
    await page.goto("/dashboard");
    await page.click('a[href="/leads"]');
    await expect(page).toHaveURL(/.*leads/);
    await expect(page.locator("h1")).toContainText("Leads Management");
  });

  test("4. Searching and filtering leads pipeline", async ({ page }) => {
    await page.goto("/leads");
    await expect(page.getByText("The Urban Kitchen")).toBeVisible();

    // Search query
    await page.fill('input[type="search"]', "Urban");
    await page.waitForTimeout(400);
    await expect(page.getByText("The Urban Kitchen")).toBeVisible();

    // Filter status tab
    await page.click('button:has-text("Contacted")');
    await page.waitForTimeout(300);
  });

  test("5. Opening Lead Intelligence detail page", async ({ page }) => {
    await page.goto("/leads");
    // Find The Urban Kitchen lead and navigate to its intelligence dossier
    const intelligenceLink = page.locator('a[href*="/leads/urbankitchen"]').first();
    await intelligenceLink.click();

    await expect(page).toHaveURL(/.*leads\/urbankitchen/);
    await expect(page.locator("h1")).toContainText("The Urban Kitchen");
    await expect(page.getByText("Website Score")).toBeVisible();
    await expect(page.getByText("Opportunity Score")).toBeVisible();
  });

  test("6. Updating lead status on Lead Intelligence", async ({ page }) => {
    await page.goto("/leads/urbankitchen");
    const statusSelect = page.locator("select").first();
    await statusSelect.selectOption("Contacted");
    await page.waitForTimeout(500);
  });

  test("7. Adding a note in Lead Intelligence activity stream", async ({ page }) => {
    await page.goto("/leads/urbankitchen");
    // Click Notes tab
    await page.click('button:has-text("Notes")');
    await page.fill('textarea[placeholder*="Log conversation"]', "Follow-up discussion scheduled with owner.");
    await page.click('button:has-text("Save Note")');
    await page.waitForTimeout(500);
    await expect(page.getByText("Follow-up discussion scheduled with owner.").first()).toBeVisible();
  });

  test("8. Creating a project brief for developer handoff", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.locator("h1")).toContainText("Projects & Delivery");
    await page.click('button:has-text("New Project Brief")');
    await page.fill('input[placeholder*="Client Name"], input[value=""]', "The Urban Kitchen");
    await page.click('button:has-text("Save Project Brief")');
    await page.waitForTimeout(600);
  });

  test("9. Exporting leads to CSV", async ({ page }) => {
    await page.goto("/leads");
    const exportButton = page.locator('a:has-text("Export CSV")');
    await expect(exportButton).toBeVisible();
    const href = await exportButton.getAttribute("href");
    expect(href).toContain("/api/leads/export");
  });
});

