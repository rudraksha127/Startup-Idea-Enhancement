import { AgentConfig } from "../../models/AgentConfig.js";

const DEFAULT_AGENTS = [
  { name: "Discovery Agent", role: "Local business research", status: "Active", dailyTarget: 50, processedToday: 42, confidenceThreshold: 85 },
  { name: "Audit Agent", role: "Website scoring & CWV", status: "Active", dailyTarget: 30, processedToday: 28, confidenceThreshold: 90 },
  { name: "Copywriter Agent", role: "Proposal generation", status: "Active", dailyTarget: 25, processedToday: 18, confidenceThreshold: 88 },
  { name: "Triage Agent", role: "Inbox reply classification", status: "Idle", dailyTarget: 20, processedToday: 6, confidenceThreshold: 80 },
];

export class AgentsService {
  static async getAgents(orgId: string) {
    let agents = await AgentConfig.find({ organizationId: orgId });
    if (agents.length === 0) {
      await AgentConfig.insertMany(
        DEFAULT_AGENTS.map((a) => ({ ...a, organizationId: orgId }))
      );
      agents = await AgentConfig.find({ organizationId: orgId });
    }
    return agents;
  }

  static async getAgentById(id: string, orgId: string) {
    return AgentConfig.findOne({ _id: id, organizationId: orgId });
  }

  static async updateAgent(id: string, data: Record<string, any>, orgId: string) {
    return AgentConfig.findOneAndUpdate(
      { _id: id, organizationId: orgId },
      data,
      { new: true }
    );
  }

  static async runAgent(id: string, orgId: string) {
    const agent = await AgentConfig.findOne({ _id: id, organizationId: orgId });
    if (!agent) return null;

    agent.processedToday += 1;
    agent.status = "Active";
    await agent.save();

    return {
      success: true,
      agentId: agent._id.toString(),
      name: agent.name,
      processedToday: agent.processedToday,
      status: agent.status,
      lastRunAt: new Date().toISOString(),
    };
  }
}

