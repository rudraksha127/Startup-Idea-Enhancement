import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../backend/src/app.js";
import { ENV } from "../../backend/src/config/env.js";
import jwt from "jsonwebtoken";

describe("Milestone 4: Multi-Tenant Teams & Deterministic Role Boundaries", () => {
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

  it("GET /api/v1/teams/members returns team members for organization", async () => {
    const res = await request(app)
      .get("/api/v1/teams/members")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);

    const firstMember = res.body.data[0];
    expect(firstMember.name).toBeDefined();
    expect(firstMember.email).toBeDefined();
    expect(firstMember.role).toBeDefined();
  });

  it("POST /api/v1/teams/invite validates email and role boundaries", async () => {
    // 1. Invalid email
    const invalidEmailRes = await request(app)
      .post("/api/v1/teams/invite")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "not-an-email", role: "Operator" });

    expect(invalidEmailRes.status).toBe(400);

    // 2. Invalid role
    const invalidRoleRes = await request(app)
      .post("/api/v1/teams/invite")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "valid@agencyos.io", role: "SuperGodMode" });

    expect(invalidRoleRes.status).toBe(400);

    // 3. Valid invitation
    const inviteEmail = `member-${Date.now()}@agencyos.io`;
    const validRes = await request(app)
      .post("/api/v1/teams/invite")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: inviteEmail,
        name: "Dev Operator",
        role: "Operator",
      });

    expect(validRes.status).toBe(201);
    expect(validRes.body.success).toBe(true);
    expect(validRes.body.data.email).toBe(inviteEmail);
    expect(validRes.body.data.role).toBe("Operator");
  });

  it("PATCH /api/v1/teams/members/:id updates member role within permitted boundaries", async () => {
    // Invite member first
    const inviteEmail = `updaterole-${Date.now()}@agencyos.io`;
    const inviteRes = await request(app)
      .post("/api/v1/teams/invite")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: inviteEmail,
        name: "Role Update Test",
        role: "Operator",
      });

    const memberId = inviteRes.body.data.id || inviteRes.body.data._id;

    // Update to Developer
    const updateRes = await request(app)
      .patch(`/api/v1/teams/members/${memberId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "Developer" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.role).toBe("Developer");
  });

  it("DELETE /api/v1/teams/members/:id removes team member from organization", async () => {
    // Invite member first
    const inviteEmail = `todelete-${Date.now()}@agencyos.io`;
    const inviteRes = await request(app)
      .post("/api/v1/teams/invite")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: inviteEmail,
        name: "Delete Me",
        role: "Operator",
      });

    const memberId = inviteRes.body.data.id || inviteRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/v1/teams/members/${memberId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.data.removedId).toBe(memberId);
  });
});
