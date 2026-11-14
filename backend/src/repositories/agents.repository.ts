import { catalystClient } from "../infrastructure/persistence/zoho-catalyst/catalyst.client.js";
import { AgentConfigRecord, AgentExecutionRecord } from "../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export class AgentsRepository {
  static async findConfig(agentId: string): Promise<AgentConfigRecord | null> {
    const cfgs = await catalystClient.find<AgentConfigRecord>("AgentConfigs", { agentId });
    return cfgs.length > 0 ? cfgs[0] : null;
  }

  static async saveConfig(data: Omit<AgentConfigRecord, "ROWID" | "updatedAt">): Promise<AgentConfigRecord> {
    const configId = data.configId || `agcfg_${Date.now()}`;
    return catalystClient.insertRow<AgentConfigRecord>("AgentConfigs", { ...data, configId });
  }

  static async logExecution(data: Omit<AgentExecutionRecord, "ROWID" | "createdAt">): Promise<AgentExecutionRecord> {
    const executionId = data.executionId || `agex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return catalystClient.insertRow<AgentExecutionRecord>("AgentExecutions", { ...data, executionId });
  }

  static async findExecutions(orgId: string, agentId?: string): Promise<AgentExecutionRecord[]> {
    if (agentId) {
      return catalystClient.find<AgentExecutionRecord>("AgentExecutions", { organizationId: orgId, agentId });
    }
    return catalystClient.find<AgentExecutionRecord>("AgentExecutions", { organizationId: orgId });
  }
}
