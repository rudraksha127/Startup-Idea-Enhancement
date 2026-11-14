import { AgentOrchestrator, ExecutionResult } from "./agent-orchestrator.js";
import { AgentsRepository } from "../../repositories/agents.repository.js";

export class AgentsService {
  static async getAgents(orgId: string) {
    return AgentOrchestrator.syncOrganizationAgents(orgId);
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
    return null;
  }

  static async updateAgent(id: string, data: Record<string, any>, orgId: string) {
    return { _id: id, ...data };
  }

  static async runAgent(
    id: string,
    orgId: string,
    userId?: string,
    inputPayload?: Record<string, unknown>
  ): Promise<ExecutionResult> {
    return AgentOrchestrator.dispatchRun({
      agentId: id,
      organizationId: orgId,
      userId,
      inputPayload,
    });
  }

  static async approveRun(runId: string, approverId: string) {
    return AgentOrchestrator.approveRun(runId, approverId);
  }

  static async getHistory(orgId: string, agentId?: string) {
    return AgentOrchestrator.getRunHistory(orgId, agentId);
  }

  static async getRunHistory(orgId: string, agentId?: string) {
    return AgentOrchestrator.getRunHistory(orgId, agentId);
  }
}
