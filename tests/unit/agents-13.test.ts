import { describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../backend/src/app.js";
import { ENV } from "../../backend/src/config/env.js";
import { AgentOrchestrator } from "../../backend/src/modules/agents/agent-orchestrator.js";
import { CANONICAL_AGENTS } from "../../backend/src/modules/agents/definitions/index.js";

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

describe("13 Canonical AI Agents & Orchestrator", () => {
  it("registers exactly 13 canonical system agents with valid definitions", () => {
    const agents = AgentOrchestrator.getRegisteredAgents();
    expect(agents.length).toBe(13);

    const ids = agents.map((a) => a.id);
    expect(ids).toContain("market-research");
    expect(ids).toContain("prospect-discovery");
    expect(ids).toContain("lead-enrichment");
    expect(ids).toContain("website-audit");
    expect(ids).toContain("lead-qualification");
    expect(ids).toContain("outreach-strategy");
    expect(ids).toContain("reply-classification");
    expect(ids).toContain("meeting-coordination");
    expect(ids).toContain("proposal-scope");
    expect(ids).toContain("client-onboarding");
    expect(ids).toContain("project-planning");
    expect(ids).toContain("website-qa");
    expect(ids).toContain("maintenance-monitoring");
  });

  it("every agent has inputSchema, outputSchema, tools and autonomyLevel", () => {
    for (const agent of CANONICAL_AGENTS) {
      expect(agent.id).toBeDefined();
      expect(agent.name).toBeDefined();
      expect(agent.version).toBe("1.0.0");
      expect(agent.inputSchema).toBeDefined();
      expect(agent.outputSchema).toBeDefined();
      expect(Array.isArray(agent.tools)).toBe(true);
      expect(["Supervised", "Semi-Autonomous", "Autonomous"]).toContain(agent.autonomyLevel);
    }
  });

  it("dispatches autonomous Market Research Agent and returns structured opportunity output", async () => {
    const result = await AgentOrchestrator.dispatchRun({
      agentId: "market-research",
      organizationId: "test-org-1",
      inputPayload: {
        industry: "Independent Bakeries",
        location: "Indore, MP",
      },
    });

    expect(result.status).toBe("COMPLETED");
    expect(result.requiresApproval).toBe(false);
    expect(result.outputPayload?.industry).toBe("Independent Bakeries");
    expect(result.outputPayload?.marketOpportunityScore).toBeGreaterThan(0);
    expect(result.tokensUsed).toBeGreaterThan(0);
    expect(result.logs.length).toBeGreaterThan(0);
  });

  it("enforces human approval gate for Supervised Proposal and Scope Agent", async () => {
    const result = await AgentOrchestrator.dispatchRun({
      agentId: "proposal-scope",
      organizationId: "test-org-1",
      inputPayload: {
        clientName: "Spice Junction Bistro",
        packageTier: "Growth",
      },
    });

    expect(result.status).toBe("AWAITING_APPROVAL");
    expect(result.requiresApproval).toBe(true);
    expect(result.outputPayload?.requiresApproval).toBe(true);
  });

  it("executes Website Audit Agent and classifies technical issues", async () => {
    const result = await AgentOrchestrator.dispatchRun({
      agentId: "website-audit",
      organizationId: "test-org-1",
      inputPayload: {
        url: "https://theurbankitchen.in",
      },
    });

    expect(result.status).toBe("COMPLETED");
    expect(result.outputPayload?.url).toBe("https://theurbankitchen.in");
    expect(result.outputPayload?.overallScore).toBeDefined();
    expect(Array.isArray(result.outputPayload?.detectedIssues)).toBe(true);
  });

  it("GET /api/v1/agents returns all 13 system agents via REST API", async () => {
    const res = await request(app)
      .get("/api/v1/agents")
      .set("Authorization", authHeader);
    expect(res.status).toBe(200);
    expect(res.body.agents).toBeDefined();
    expect(res.body.agents.length).toBe(13);
  });
});

