import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../backend/src/app.js";
import { IntegrationsService } from "../../backend/src/modules/integrations/integrations.service.js";
import { ENV } from "../../backend/src/config/env.js";
import jwt from "jsonwebtoken";

describe("Integrations, Lead Audit & Outreach Capabilities", () => {
  const token = jwt.sign(
    {
      userId: "test-user-id",
      email: "founder@agencyos.io",
      name: "Test Founder",
      role: "Founder",
      organizationId: "507f191e810c19729de860ea",
    },
    ENV.JWT_SECRET,
    { expiresIn: "1h" }
  );

  it("IntegrationsService.testAllIntegrations returns status for all 6 core providers", async () => {
    const results = await IntegrationsService.testAllIntegrations();
    expect(results).toHaveLength(6);

    const providerNames = results.map((r) => r.provider);
    expect(providerNames).toContain("MongoDB Atlas");
    expect(providerNames).toContain("Google Gemini API");
    expect(providerNames).toContain("OpenAI API");
    expect(providerNames).toContain("Google Maps Platform");
    expect(providerNames).toContain("Resend");
    expect(providerNames).toContain("Razorpay / Stripe");

    results.forEach((r) => {
      expect(["CONNECTED", "CREDENTIAL_REQUIRED", "FAILED", "OFFLINE"]).toContain(r.status);
      expect(typeof r.configured).toBe("boolean");
      expect(typeof r.message).toBe("string");
    });
  });

  it("GET /api/v1/integrations returns provider status inventory", async () => {
    const res = await request(app).get("/api/v1/integrations");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(6);
  });

  it("POST /api/v1/integrations/test tests an individual provider on demand", async () => {
    const res = await request(app)
      .post("/api/v1/integrations/test")
      .set("Authorization", `Bearer ${token}`)
      .send({ provider: "Google Gemini API", apiKey: "AIzaSy_demo_valid_key_123456" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.provider).toBe("Google Gemini API");
  });

  it("GET /api/v1/leads returns leads list with opportunity scores", async () => {
    const res = await request(app)
      .get("/api/v1/leads")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.leads)).toBe(true);
    expect(res.body.counts).toBeDefined();
    expect(res.body.total).toBeGreaterThan(0);
  });
});
