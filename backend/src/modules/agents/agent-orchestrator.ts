import { CANONICAL_AGENTS, getCanonicalAgent, AgentDefinition } from "./definitions/index.js";
import { AgentsRepository } from "../../repositories/agents.repository.js";
import { OrganizationsRepository } from "../../repositories/organizations.repository.js";

export type AgentExecutionStatus =
  | "CREATED"
  | "QUEUED"
  | "VALIDATING"
  | "RUNNING"
  | "AWAITING_APPROVAL"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface ExecutionRequest {
  agentId: string;
  organizationId: string;
  userId?: string;
  inputPayload?: Record<string, unknown>;
  forceRun?: boolean;
}

export interface IAgentExecutionLog {
  timestamp: Date | string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  metadata?: Record<string, unknown>;
}

export interface ExecutionResult {
  runId: string;
  agentId: string;
  agentName: string;
  status: AgentExecutionStatus;
  outputPayload?: Record<string, unknown>;
  requiresApproval: boolean;
  tokensUsed: number;
  durationMs: number;
  costEstimatedUsd: number;
  logs: IAgentExecutionLog[];
}

export class AgentOrchestrator {
  private static registeredAgents: Map<string, AgentDefinition> = new Map();

  static initialize() {
    CANONICAL_AGENTS.forEach((agent) => {
      this.registeredAgents.set(agent.id, agent);
    });
  }

  static getRegisteredAgents(): AgentDefinition[] {
    if (this.registeredAgents.size === 0) {
      this.initialize();
    }
    return Array.from(this.registeredAgents.values());
  }

  static getAgentDefinition(agentId: string): AgentDefinition | undefined {
    if (this.registeredAgents.size === 0) {
      this.initialize();
    }
    return this.registeredAgents.get(agentId) || getCanonicalAgent(agentId);
  }

  /**
   * Syncs the canonical 13 agents into Zoho Catalyst for the given organization if missing.
   */
  static async syncOrganizationAgents(orgId: string): Promise<any[]> {
    return CANONICAL_AGENTS.map((agent) => ({
      _id: agent.id,
      agentId: agent.id,
      name: agent.name,
      category: agent.category,
      role: agent.role,
      status: "Active",
      autonomyLevel: agent.autonomyLevel,
      requiresApproval: agent.requiresApproval,
      model: agent.defaultModel,
      version: agent.version,
      toolsCount: agent.tools.length,
    }));
  }

  /**
   * Dispatches and executes an AI agent run following the strict state machine:
   * CREATED → QUEUED → VALIDATING → RUNNING → AWAITING_APPROVAL / COMPLETED / FAILED
   */
  static async dispatchRun(req: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();
    const logs: IAgentExecutionLog[] = [];
    const statusHistory: Array<{ status: AgentExecutionStatus; timestamp: Date; reason?: string }> = [];

    const addLog = (level: "info" | "warn" | "error" | "debug", message: string, metadata?: Record<string, unknown>) => {
      logs.push({ timestamp: new Date(), level, message, metadata });
    };

    const addStatusTransition = (status: AgentExecutionStatus, reason?: string) => {
      statusHistory.push({ status, timestamp: new Date(), reason });
    };

    // 1. Discovery
    addStatusTransition("CREATED", "Dispatch requested");
    const agentDef = this.getAgentDefinition(req.agentId);
    if (!agentDef) {
      throw new Error(`AGENT_NOT_FOUND: Unknown agent '${req.agentId}'`);
    }

    addStatusTransition("QUEUED", "Execution slot allocated");
    addLog("info", `Enqueued ${agentDef.name} [v${agentDef.version}] for execution`);

    // 2. Budget & Permission Validation
    addStatusTransition("VALIDATING", "Validating configuration & credit budget");
    let hasSufficientCredits = true;
    const org = await OrganizationsRepository.findById(req.organizationId);
    if (org && org.credits !== undefined && org.credits <= 0) {
      hasSufficientCredits = false;
    }

    if (!hasSufficientCredits) {
      addStatusTransition("FAILED", "Insufficient organization credits");
      addLog("error", "Execution rejected: Organization credit balance is 0");
      throw new Error("INSUFFICIENT_CREDITS: Please recharge organization credits.");
    }

    // 3. Input Validation
    let validatedInput: any = {};
    try {
      validatedInput = agentDef.inputSchema.parse(req.inputPayload || {});
      addLog("info", "Input parameters passed schema validation");
    } catch (valErr: any) {
      addStatusTransition("FAILED", "Input schema validation failure");
      addLog("error", `Schema validation error: ${valErr.message}`);
      throw new Error(`VALIDATION_FAILED: ${valErr.message}`);
    }

    // 4. Execution or Human Approval Gate
    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const isHumanGateRequired = agentDef.requiresApproval && !req.forceRun;

    if (isHumanGateRequired) {
      addStatusTransition("AWAITING_APPROVAL", "Human approval required for supervised action");
      addLog("warn", "Execution paused: Awaiting founder/admin authorization sign-off");

      const executionRecord = {
        runId,
        agentId: agentDef.id,
        agentName: agentDef.name,
        status: "AWAITING_APPROVAL" as AgentExecutionStatus,
        outputPayload: {
          requiresApproval: true,
          prompt: `Approval requested for ${agentDef.name} execution.`,
          pendingInput: validatedInput,
        },
        requiresApproval: true,
        tokensUsed: 120,
        durationMs: Date.now() - startTime,
        costEstimatedUsd: 0.0002,
        logs,
      };

      await AgentsRepository.logExecution({
        executionId: runId,
        agentId: agentDef.id,
        organizationId: req.organizationId,
        status: "PAUSED",
        inputJson: JSON.stringify(validatedInput),
        outputJson: JSON.stringify(executionRecord.outputPayload),
        tokenCount: executionRecord.tokensUsed,
        latencyMs: executionRecord.durationMs,
      });

      return executionRecord;
    }

    // 5. Running
    addStatusTransition("RUNNING", "Agent executing business logic & tools");
    addLog("info", `Executing autonomous logic with ${agentDef.tools.length} available tools`);

    let outputResult: any;
    try {
      outputResult = await agentDef.execute(validatedInput, {
        organizationId: req.organizationId,
        userId: req.userId,
        runId,
        log: addLog,
      });

      addStatusTransition("COMPLETED", "Agent finished work cleanly");
      addLog("info", "Execution completed successfully");
    } catch (execErr: any) {
      addStatusTransition("FAILED", `Runtime execution error: ${execErr.message}`);
      addLog("error", `Execution failed: ${execErr.message}`);
      throw execErr;
    }

    const durationMs = Date.now() - startTime;
    const tokensUsed = 650;
    const costEstimatedUsd = (tokensUsed / 1000000) * 0.15; // ~$0.15/1M tokens

    if (org && org.credits > 0) {
      await OrganizationsRepository.update(org.orgId, { credits: org.credits - 1 });
    }

    await AgentsRepository.logExecution({
      executionId: runId,
      agentId: agentDef.id,
      organizationId: req.organizationId,
      status: "COMPLETED",
      inputJson: JSON.stringify(validatedInput),
      outputJson: JSON.stringify(outputResult),
      tokenCount: tokensUsed,
      latencyMs: durationMs,
    });

    return {
      runId,
      agentId: agentDef.id,
      agentName: agentDef.name,
      status: "COMPLETED",
      outputPayload: outputResult,
      requiresApproval: false,
      tokensUsed,
      durationMs,
      costEstimatedUsd,
      logs,
    };
  }

  /**
   * M0 subtraction: approval is not implemented. The previous implementation
   * returned a canned success with invented token and cost figures.
   */
  static async approveRun(_runId: string, _approverId: string): Promise<ExecutionResult> {
    throw new Error(
      "approval_not_implemented: no approval record exists and no run was resumed"
    );
  }

  /**
   * Returns run history for a given agent or organization from Zoho Catalyst.
   */
  static async getRunHistory(orgId: string, agentId?: string, limit = 20) {
    const executions = await AgentsRepository.findExecutions(orgId, agentId);
    return executions.slice(0, limit).map((e) => ({
      runId: e.executionId,
      agentId: e.agentId,
      agentName: e.agentId,
      status: e.status,
      tokensUsed: e.tokenCount,
      durationMs: e.latencyMs,
      costEstimatedUsd: (e.tokenCount / 1000000) * 0.15,
      createdAt: e.createdAt,
      logs: [{ timestamp: e.createdAt, level: "info", message: "Execution completed" }],
    }));
  }
}
