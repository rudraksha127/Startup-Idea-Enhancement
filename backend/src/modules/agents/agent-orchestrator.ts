import mongoose from "mongoose";
import { CANONICAL_AGENTS, getCanonicalAgent, AgentDefinition } from "./definitions/index.js";
import { AgentConfig } from "../../models/AgentConfig.js";
import { AgentExecution, AgentExecutionStatus, IAgentExecutionLog } from "../../models/AgentExecution.js";
import { Organization } from "../../models/Organization.js";

export interface ExecutionRequest {
  agentId: string;
  organizationId: string;
  userId?: string;
  inputPayload?: Record<string, unknown>;
  forceRun?: boolean;
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
   * Syncs the canonical 13 agents into the database for the given organization if missing.
   */
  static async syncOrganizationAgents(orgId: string): Promise<any[]> {
    if (mongoose.connection.readyState !== 1) {
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

    const configs = await AgentConfig.find({ organizationId: orgId }).lean();
    const configMap = new Map(configs.map((c: any) => [c.name, c]));

    const result = [];
    for (const agent of CANONICAL_AGENTS) {
      let config = configMap.get(agent.name);
      if (!config) {
        config = await AgentConfig.create({
          organizationId: new mongoose.Types.ObjectId(orgId),
          name: agent.name,
          role: agent.role,
          status: "Active",
          dailyTarget: 50,
          processedToday: 0,
          confidenceThreshold: 85,
        });
      }
      result.push({
        _id: (config as any)._id ? (config as any)._id.toString() : agent.id,
        agentId: agent.id,
        name: agent.name,
        category: agent.category,
        role: agent.role,
        status: (config as any).status || "Active",
        autonomyLevel: agent.autonomyLevel,
        requiresApproval: agent.requiresApproval,
        model: agent.defaultModel,
        version: agent.version,
        toolsCount: agent.tools.length,
      });
    }

    return result;
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
    if (mongoose.connection.readyState === 1) {
      const org = await Organization.findById(req.organizationId);
      if (org && org.credits !== undefined && org.credits <= 0) {
        hasSufficientCredits = false;
      }
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
    const runId = new mongoose.Types.ObjectId().toString();
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

      if (mongoose.connection.readyState === 1) {
        await AgentExecution.create({
          organizationId: new mongoose.Types.ObjectId(req.organizationId),
          agentId: agentDef.id,
          agentName: agentDef.name,
          agentType: agentDef.category,
          status: "AWAITING_APPROVAL",
          statusHistory,
          inputPayload: validatedInput,
          outputPayload: executionRecord.outputPayload,
          logs,
          tokensUsed: executionRecord.tokensUsed,
          durationMs: executionRecord.durationMs,
          costEstimatedUsd: executionRecord.costEstimatedUsd,
          autonomyLevel: agentDef.autonomyLevel,
          requiresApproval: true,
          approvalStatus: "PENDING",
          triggeredBy: req.userId || "system",
        });
      }

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

    // Deduct 1 credit if Mongoose connected
    if (mongoose.connection.readyState === 1) {
      await Organization.findByIdAndUpdate(req.organizationId, {
        $inc: { credits: -1 },
      });

      await AgentExecution.create({
        organizationId: new mongoose.Types.ObjectId(req.organizationId),
        agentId: agentDef.id,
        agentName: agentDef.name,
        agentType: agentDef.category,
        status: "COMPLETED",
        statusHistory,
        inputPayload: validatedInput,
        outputPayload: outputResult,
        logs,
        tokensUsed,
        durationMs,
        costEstimatedUsd,
        autonomyLevel: agentDef.autonomyLevel,
        requiresApproval: false,
        triggeredBy: req.userId || "system",
      });
    }

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
   * Approves a paused execution waiting in AWAITING_APPROVAL state.
   */
  static async approveRun(runId: string, approverId: string): Promise<ExecutionResult> {
    if (mongoose.connection.readyState !== 1) {
      return {
        runId,
        agentId: "approved-mock",
        agentName: "Approved Execution",
        status: "COMPLETED",
        outputPayload: { approved: true, approvedBy: approverId },
        requiresApproval: false,
        tokensUsed: 400,
        durationMs: 250,
        costEstimatedUsd: 0.0001,
        logs: [{ timestamp: new Date(), level: "info", message: `Approved by ${approverId}` }],
      };
    }

    const execution = await AgentExecution.findById(runId);
    if (!execution) {
      throw new Error("RUN_NOT_FOUND");
    }

    if (execution.status !== "AWAITING_APPROVAL") {
      throw new Error(`INVALID_STATE: Cannot approve execution with status '${execution.status}'`);
    }

    execution.approvalStatus = "APPROVED";
    execution.approvedBy = approverId;
    execution.approvedAt = new Date();
    execution.status = "RUNNING";
    execution.statusHistory.push({ status: "RUNNING", timestamp: new Date(), reason: `Approved by ${approverId}` });
    execution.logs.push({ timestamp: new Date(), level: "info", message: `Execution approved by user ${approverId}` });

    // Execute with forceRun: true
    const result = await this.dispatchRun({
      agentId: execution.agentId,
      organizationId: execution.organizationId.toString(),
      userId: approverId,
      inputPayload: execution.inputPayload,
      forceRun: true,
    });

    execution.status = "COMPLETED";
    execution.statusHistory.push({ status: "COMPLETED", timestamp: new Date(), reason: "Approved run completed" });
    execution.outputPayload = result.outputPayload;
    execution.tokensUsed += result.tokensUsed;
    execution.durationMs += result.durationMs;
    await execution.save();

    return result;
  }

  /**
   * Returns run history for a given agent or organization.
   */
  static async getRunHistory(orgId: string, agentId?: string, limit = 20) {
    if (mongoose.connection.readyState !== 1) {
      return [
        {
          runId: "demo-run-1",
          agentId: agentId || "market-research",
          agentName: "Market Research Agent",
          status: "COMPLETED",
          tokensUsed: 620,
          durationMs: 420,
          costEstimatedUsd: 0.0001,
          createdAt: new Date().toISOString(),
          logs: [{ timestamp: new Date().toISOString(), level: "info", message: "Market scan finished" }],
        },
      ];
    }

    const query: any = { organizationId: orgId };
    if (agentId) query.agentId = agentId;

    return await AgentExecution.find(query).sort({ createdAt: -1 }).limit(limit).lean();
  }
}

