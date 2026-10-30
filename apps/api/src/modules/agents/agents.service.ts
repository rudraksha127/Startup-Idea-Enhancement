import mongoose from "mongoose";
import { AgentConfig } from "../../models/AgentConfig.js";
import { AgentOrchestrator, ExecutionResult } from "./agent-orchestrator.js";

export class AgentsService {
  static async getAgents(orgId: string) {
    return await AgentOrchestrator.syncOrganizationAgents(orgId);
  }

  static async getAgentById(id: string, orgId: string) {
    const canonical = AgentOrchestrator.getAgentDefinition(id);
    if (canonical) {
      return {
        _id: canonical.id,
        agentId: canonical.id,
        name: canonical.name,
        category: canonical.category,
        role: canonical.role,
        status: "Active",
        autonomyLevel: canonical.autonomyLevel,
        requiresApproval: canonical.requiresApproval,
        model: canonical.defaultModel,
        version: canonical.version,
        tools: canonical.tools,
        description: canonical.description,
      };
    }

    if (mongoose.connection.readyState === 1) {
      return await AgentConfig.findOne({ _id: id, organizationId: orgId }).lean();
    }
    return null;
  }

  static async updateAgent(id: string, data: Record<string, any>, orgId: string) {
    if (mongoose.connection.readyState === 1) {
      return await AgentConfig.findOneAndUpdate(
        { _id: id, organizationId: orgId },
        data,
        { new: true }
      );
    }
    return { _id: id, ...data };
  }

  static async runAgent(
    id: string,
    orgId: string,
    userId?: string,
    inputPayload?: Record<string, unknown>
  ): Promise<ExecutionResult> {
    let resolvedAgentId = id;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const config = await AgentConfig.findById(id);
      if (config) {
        const all = AgentOrchestrator.getRegisteredAgents();
        const match = all.find((a) => a.name.toLowerCase() === config.name.toLowerCase());
        if (match) resolvedAgentId = match.id;
      }
    }

    return await AgentOrchestrator.dispatchRun({
      agentId: resolvedAgentId,
      organizationId: orgId,
      userId,
      inputPayload,
    });
  }

  static async approveRun(runId: string, approverId: string) {
    return await AgentOrchestrator.approveRun(runId, approverId);
  }

  static async getRunHistory(orgId: string, agentId?: string) {
    return await AgentOrchestrator.getRunHistory(orgId, agentId);
  }
}
