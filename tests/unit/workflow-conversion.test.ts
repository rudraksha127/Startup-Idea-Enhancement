import crypto from "crypto";
import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../backend/src/app.js";
import { ENV } from "../../backend/src/config/env.js";

function makeAuthHeader(orgId: string, userId = "user-a") {
  return `Bearer ${jwt.sign(
    {
      userId,
      email: `${userId}@agencyos.io`,
      name: "Test Founder",
      role: "Founder",
      organizationId: orgId,
    },
    ENV.JWT_SECRET,
    { expiresIn: "1h" }
  )}`;
}

describe("Phase 3: Lead -> Client -> Project -> Billing Conversion & n8n HMAC", () => {
  afterEach(() => {
    delete process.env.N8N_WEBHOOK_SECRET;
  });

  it("converts a qualified lead into a Client and Project while enforcing tenant isolation", async () => {
    const orgA = `org_conv_a_${Date.now()}`;
    const orgB = `org_conv_b_${Date.now()}`;
    const authA = makeAuthHeader(orgA, "founder-a");
    const authB = makeAuthHeader(orgB, "founder-b");

    // 1. Create Lead in Org A
    const createRes = await request(app)
      .post("/api/v1/leads")
      .set("Authorization", authA)
      .send({
        businessName: "Sunrise Dental Care",
        category: "Clinic",
        location: "Indore, MP",
      });

    expect(createRes.status).toBe(201);
    const leadId = createRes.body.lead.leadId;
    expect(leadId).toBeDefined();

    // 2. Org B cannot access or convert Org A's lead
    const forbiddenRes = await request(app)
      .post(`/api/v1/leads/${leadId}/convert`)
      .set("Authorization", authB)
      .send({});
    expect(forbiddenRes.status).toBe(404);

    // 3. Audit empty-website lead honestly (no_website -> opp score 95)
    const auditRes = await request(app)
      .post(`/api/v1/leads/${leadId}/audit`)
      .set("Authorization", authA)
      .send({});
    expect(auditRes.status).toBe(200);
    expect(auditRes.body.audit.performanceScore).toBe(0);
    expect(auditRes.body.lead.opportunityScore).toBe(95);

    // 4. Convert Lead -> Client + Initial Project
    const convertRes = await request(app)
      .post(`/api/v1/leads/${leadId}/convert`)
      .set("Authorization", authA)
      .send({ monthlyRetainer: 45000 });

    expect(convertRes.status).toBe(201);
    expect(convertRes.body.success).toBe(true);
    expect(convertRes.body.lead.qualificationStatus).toBe("Converted");
    expect(convertRes.body.client.name).toBe("Sunrise Dental Care");
    expect(convertRes.body.project.name).toContain("Sunrise Dental Care");

    // 5. Create & verify Invoice for converted client
    const invoiceRes = await request(app)
      .post("/api/v1/billing/invoices")
      .set("Authorization", authA)
      .send({
        clientName: convertRes.body.client.name,
        clientId: convertRes.body.client.clientId,
        projectTitle: convertRes.body.project.name,
        amount: 45000,
        status: "Pending",
      });
    expect(invoiceRes.status).toBe(201);
    expect(invoiceRes.body.invoice.amount).toBe(45000);
  });

  it("enforces HMAC-SHA256 verification on Express n8n webhooks when N8N_WEBHOOK_SECRET is set", async () => {
    const secret = "super_secret_n8n_hmac_key_2026";
    process.env.N8N_WEBHOOK_SECRET = secret;
    const payload = { leadId: "lead-hmac-1", performanceScore: 61, seoScore: 74 };

    const unauthorized = await request(app)
      .post("/api/v1/n8n/webhook/lead-audit")
      .send(payload);
    expect(unauthorized.status).toBe(401);

    const invalidSig = await request(app)
      .post("/api/v1/n8n/webhook/lead-audit")
      .set("x-n8n-signature", "sha256=deadbeef")
      .send(payload);
    expect(invalidSig.status).toBe(401);

    const validHmac = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload), "utf8")
      .digest("hex");

    const authorized = await request(app)
      .post("/api/v1/n8n/webhook/lead-audit")
      .set("x-n8n-signature", `sha256=${validHmac}`)
      .send(payload);

    expect(authorized.status).toBe(200);
    expect(authorized.body.success).toBe(true);
  });
});
