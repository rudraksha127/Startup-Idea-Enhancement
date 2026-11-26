import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../backend/src/app.js";
import { ENV } from "../../backend/src/config/env.js";
import jwt from "jsonwebtoken";

describe("Milestone 4: Live n8n Bi-Directional Sync & Workflow Triggers", () => {
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

  it("GET /api/v1/n8n/status returns synchronization engine status and registered workflows", async () => {
    const res = await request(app)
      .get("/api/v1/n8n/status")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.engine).toBe("n8n Workflow Automation");
    expect(res.body.syncEnabled).toBe(true);
    expect(Array.isArray(res.body.activeWorkflows)).toBe(true);
    expect(res.body.activeWorkflows.length).toBeGreaterThanOrEqual(3);

    const workflowIds = res.body.activeWorkflows.map((w: any) => w.id);
    expect(workflowIds).toContain("lead-audit");
    expect(workflowIds).toContain("prospect-discovery");
    expect(workflowIds).toContain("outreach-dispatch");
  });

  it("POST /api/v1/n8n/webhook/lead-audit processes inbound lead audit payload", async () => {
    const auditPayload = {
      leadId: "lead-audit-test-" + Date.now(),
      websiteUrl: "https://example-dentist-delhi.com",
      performanceScore: 42,
      seoScore: 55,
      mobileFriendly: false,
      issuesFound: ["Missing H1 heading", "TTFB > 3.5s", "No viewport meta tag"],
      recommendedServices: ["Next.js Rebuild", "Local SEO Audit"],
    };

    const res = await request(app)
      .post("/api/v1/n8n/webhook/lead-audit")
      .send(auditPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.action).toBe("AUDIT_PROCESSED");
    expect(res.body.opportunityScore).toBeGreaterThanOrEqual(10);
  });

  it("POST /api/v1/n8n/webhook/prospect-sync ingests discovered business prospects", async () => {
    const syncPayload = {
      prospects: [
        {
          name: "Dr. Sharma Dental Clinic",
          category: "Dental Care",
          city: "New Delhi",
          website: "https://drsharmadental.in",
          phone: "+91 98110 00001",
        },
        {
          name: "Opt-Out Test Clinic",
          category: "Dental Care",
          city: "New Delhi",
          website: "https://optout-clinic.in",
          phone: "+91 98110 00002",
        },
      ],
    };

    const res = await request(app)
      .post("/api/v1/n8n/webhook/prospect-sync")
      .send(syncPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.received).toBe(2);
    expect(res.body.synced).toBeGreaterThanOrEqual(1);
  });

  it("POST /api/v1/n8n/trigger/:workflow dispatches outbound workflow trigger", async () => {
    const res = await request(app)
      .post("/api/v1/n8n/trigger/lead-audit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        leadId: "lead-trigger-123",
        url: "https://test-restaurant.com",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.workflow).toBe("lead-audit");
    expect(res.body.dispatched).toBe(true);
    expect(["LIVE_DISPATCH", "SANDBOX_MOCK"]).toContain(res.body.deliveryMode);
  });
});
