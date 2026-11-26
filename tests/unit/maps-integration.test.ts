import { describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../backend/src/app.js";
import { ENV } from "../../backend/src/config/env.js";

const authHeader = `Bearer ${jwt.sign(
  {
    userId: "test-user-id",
    email: "founder@agencyos.io",
    name: "Test Founder",
    role: "Founder",
    organizationId: "507f191e810c19729de860ea",
  },
  ENV.JWT_SECRET,
  { expiresIn: "1h" }
)}`;

describe("Google Maps Platform Integration & Location Intelligence", () => {
  it("GET /api/v1/maps/status returns provider attribution and TOS compliance metadata", async () => {
    const res = await request(app)
      .get("/api/v1/maps/status")
      .set("Authorization", authHeader);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.provider).toBe("Google Maps Platform");
    expect(res.body.attribution).toContain("Google");
    expect(res.body.termsNotice).toContain("Section 3.2.3");
  });

  it("POST /api/v1/maps/places/search discovers businesses with category filter", async () => {
    const res = await request(app)
      .post("/api/v1/maps/places/search")
      .set("Authorization", authHeader)
      .send({ category: "Restaurant", city: "Indore" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.places)).toBe(true);
    expect(res.body.places.length).toBeGreaterThan(0);

    const first = res.body.places[0];
    expect(first.name).toBeDefined();
    expect(first.category).toBe("Restaurant");
    expect(first.rating).toBeGreaterThan(0);
    expect(first.opportunityScore).toBeDefined();
  });

  it("POST /api/v1/maps/places/search filters by text query", async () => {
    const res = await request(app)
      .post("/api/v1/maps/places/search")
      .set("Authorization", authHeader)
      .send({ query: "Urban Kitchen" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.places.some((p: any) => p.name.includes("Urban Kitchen"))).toBe(true);
  });

  it("GET /api/v1/maps/places/autocomplete returns search suggestions", async () => {
    const res = await request(app)
      .get("/api/v1/maps/places/autocomplete")
      .set("Authorization", authHeader)
      .query({ input: "Spice" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.suggestions)).toBe(true);
  });

  it("GET /api/v1/maps/places/:id returns business details with opportunity score", async () => {
    const res = await request(app)
      .get("/api/v1/maps/places/dir-1")
      .set("Authorization", authHeader);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.place.name).toBe("The Urban Kitchen");
    expect(res.body.place.opportunityScore).toBe(8.5);
  });
});

