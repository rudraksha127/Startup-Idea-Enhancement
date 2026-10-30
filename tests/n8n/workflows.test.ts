import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("n8n Workflow Specifications & Topology Validation", () => {
  const agents = [
    "market-research",
    "prospect-discovery",
    "lead-enrichment",
    "website-audit",
    "lead-qualification",
    "outreach-strategy",
    "reply-classification",
    "meeting-coordination",
    "proposal-generation",
    "client-onboarding",
    "project-planning",
    "website-qa",
    "maintenance",
  ];

  const subworkflows = [
    "data-validation",
    "deduplication",
    "source-verification",
    "ai-generation",
    "approval",
    "notification",
    "error-handler",
  ];

  it("verifies all 13 canonical agent workflow files exist and have valid topology", () => {
    for (const agentId of agents) {
      const filePath = path.resolve(`n8n/workflows/agents/${agentId}/workflow.json`);
      expect(fs.existsSync(filePath), `Workflow for ${agentId} should exist on disk`).toBe(true);

      const content = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(content);

      expect(json.name).toBeDefined();
      expect(json.name).toContain("AgencyOS -");
      expect(Array.isArray(json.nodes)).toBe(true);
      expect(json.nodes.length).toBeGreaterThanOrEqual(3);
      expect(json.connections).toBeDefined();
      expect(json.meta?.agentId).toBe(agentId);
    }
  });

  it("verifies all 7 reusable sub-workflow definitions exist and have valid structures", () => {
    for (const subId of subworkflows) {
      const filePath = path.resolve(`n8n/workflows/sub-workflows/${subId}/workflow.json`);
      expect(fs.existsSync(filePath), `Sub-workflow ${subId} should exist on disk`).toBe(true);

      const content = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(content);

      expect(json.name).toBeDefined();
      expect(Array.isArray(json.nodes)).toBe(true);
      expect(json.nodes.length).toBeGreaterThanOrEqual(2);
      expect(json.connections).toBeDefined();
    }
  });

  it("verifies central orchestration triggers and scheduled monitors exist", () => {
    const dispatcherPath = path.resolve("n8n/workflows/triggers/agent-dispatcher.json");
    const summaryPath = path.resolve("n8n/workflows/scheduled/daily-summary.json");
    const callbackPath = path.resolve("n8n/workflows/webhooks/result-callback.json");
    const healthPath = path.resolve("n8n/workflows/system/health-check.json");

    expect(fs.existsSync(dispatcherPath)).toBe(true);
    expect(fs.existsSync(summaryPath)).toBe(true);
    expect(fs.existsSync(callbackPath)).toBe(true);
    expect(fs.existsSync(healthPath)).toBe(true);

    const dispatcher = JSON.parse(fs.readFileSync(dispatcherPath, "utf-8"));
    expect(dispatcher.id).toBe("wf-agent-dispatcher");
  });
});
