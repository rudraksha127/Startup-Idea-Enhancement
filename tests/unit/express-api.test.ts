import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../apps/api/src/app";

describe("Express REST API (/api/v1/*)", () => {
  it("GET / returns service health status and API version", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.service).toBe("AgencyOS Express API");
    expect(res.body.status).toBe("online");
  });

  it("GET /api/v1/health returns structured probe payload with request ID", async () => {
    const res = await request(app).get("/api/v1/health");
    expect([200, 503]).toContain(res.status);
    expect(res.headers["x-request-id"]).toBeDefined();
    expect(res.body.service).toBe("agencyos-express-api");
    expect(res.body.version).toBe("1.0.0");
  });

  it("POST /api/v1/auth/login rejects invalid email formats with 400", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "not-an-email", password: "123" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.details).toBeDefined();
  });

  it("POST /api/v1/auth/register validates minimum organization name length", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        organizationName: "a", // too short
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("POST /api/v1/leads validates required businessName and category", async () => {
    const res = await request(app)
      .post("/api/v1/leads")
      .send({ location: "Indore" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });
});

