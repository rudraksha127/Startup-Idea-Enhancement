import { describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../apps/api/src/app.js";
import { ENV } from "../../apps/api/src/config/env.js";

const authHeader = `Bearer ${jwt.sign(
  {
    userId: "test-user-id",
    email: "founder@agencyos.io",
    name: "Test Founder",
    role: "Founder",
    organizationId: "test-org-id",
  },
  ENV.JWT_SECRET,
  { expiresIn: "1h" }
)}`;

describe("Billing & Website Templates Modules", () => {
  it("GET /api/v1/billing/invoices returns collection of invoices", async () => {
    const res = await request(app).get("/api/v1/billing/invoices");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.invoices)).toBe(true);
    expect(res.body.invoices.length).toBeGreaterThan(0);
  });

  it("POST /api/v1/billing/invoices creates a new invoice", async () => {
    const res = await request(app)
      .post("/api/v1/billing/invoices")
      .set("Authorization", authHeader)
      .send({
        clientName: "Test Bistro Client",
        projectTitle: "Next.js 15 Website",
        amount: 55000,
        dueDate: "30 May 2026",
        status: "Pending",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.invoice.clientName).toBe("Test Bistro Client");
    expect(res.body.invoice.amount).toBe(55000);
    expect(res.body.invoice.invoiceNumber).toMatch(/^INV-\d{4}-\d+/);
  });

  it("GET /api/v1/billing/metrics aggregates total billed and paid amounts", async () => {
    const res = await request(app).get("/api/v1/billing/metrics");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.metrics.totalBilled).toBeGreaterThan(0);
    expect(res.body.metrics.currency).toBe("INR");
  });

  it("GET /api/v1/templates returns industry website templates", async () => {
    const res = await request(app).get("/api/v1/templates");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.templates)).toBe(true);
    expect(res.body.templates.length).toBeGreaterThan(0);
  });

  it("POST /api/v1/templates creates a custom website template", async () => {
    const res = await request(app)
      .post("/api/v1/templates")
      .set("Authorization", authHeader)
      .send({
        name: "Artisan Roastery Template",
        category: "Cafe",
        description: "Specialty coffee roastery template with dynamic menu",
        features: ["Menu filtering", "Subscription bag checkout"],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.template.name).toBe("Artisan Roastery Template");
    expect(res.body.template.isCustom).toBe(true);
  });

  it("POST /api/v1/templates/:id/apply converts template into a new project workspace", async () => {
    const res = await request(app)
      .post("/api/v1/templates/1/apply")
      .set("Authorization", authHeader)
      .send({
        projectName: "Spice Villa Redesign",
        clientName: "Spice Villa",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.applied).toBe(true);
    expect(res.body.project.title).toContain("Spice Villa");
  });
});
