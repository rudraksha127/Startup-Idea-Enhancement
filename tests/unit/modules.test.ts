import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../backend/src/app";
import { activeModules, getModule } from "../../backend/src/modules/index";

describe("Backend Modular Architecture & Registry", () => {
  it("registers all core vertical slice modules", () => {
    const moduleNames = activeModules.map((m) => m.name);
    expect(moduleNames).toContain("health");
    expect(moduleNames).toContain("auth");
    expect(moduleNames).toContain("leads");
    expect(moduleNames).toContain("clients");
    expect(moduleNames).toContain("projects");
    expect(moduleNames).toContain("campaigns");
    expect(moduleNames).toContain("agents");
    expect(moduleNames).toContain("dashboard");
    expect(moduleNames).toContain("analytics");
    expect(moduleNames).toContain("settings");
  });

  it("can lookup any module by name via getModule", () => {
    const leadsMod = getModule("leads");
    expect(leadsMod).toBeDefined();
    expect(leadsMod?.name).toBe("leads");
    expect(leadsMod?.routePrefix).toBe("/leads");
    expect(leadsMod?.router).toBeDefined();

    const authMod = getModule("auth");
    expect(authMod?.name).toBe("auth");
    expect(authMod?.routePrefix).toBe("/auth");

    const nonExistent = getModule("does_not_exist");
    expect(nonExistent).toBeUndefined();
  });

  it("GET /api/v1/analytics returns structured analytics overview", async () => {
    const res = await request(app).get("/api/v1/analytics");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.kpis).toBeDefined();
    expect(res.body.data.funnel).toBeInstanceOf(Array);
    expect(res.body.data.channelPerformance).toBeInstanceOf(Array);
  });

  it("GET /api/v1/settings returns system configuration & compliance status", async () => {
    const res = await request(app).get("/api/v1/settings");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.compliance.dpdpActCompliant).toBe(true);
    expect(res.body.data.compliance.noGoogleMapsScraping).toBe(true);
    expect(res.body.data.compliance.defaultDryRun).toBe(true);
  });

  it("GET /api/v1/campaigns returns campaigns collection", async () => {
    const res = await request(app).get("/api/v1/campaigns");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });
});

