import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../backend/src/app.js";

describe("Security Architecture & Tenant Boundary Gates", () => {
  it("rejects unauthenticated requests to protected endpoints with 401", async () => {
    const endpoints = [
      { method: "get", path: "/api/v1/teams/members" },
      { method: "post", path: "/api/v1/teams/invite" },
      { method: "post", path: "/api/v1/n8n/trigger/lead-audit" },
      { method: "post", path: "/api/v1/integrations/test" },
    ];

    for (const ep of endpoints) {
      const res = await (request(app) as any)[ep.method](ep.path);
      expect([401, 403]).toContain(res.status);
      expect(res.body.error || res.body.message).toBeDefined();
    }
  });

  it("enforces security headers via Helmet middleware", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(["DENY", "SAMEORIGIN"]).toContain(res.headers["x-frame-options"]);
  });
});
