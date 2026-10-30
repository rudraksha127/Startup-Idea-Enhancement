import mongoose, { Schema, Document, Model } from "mongoose";

export type AgentExecutionStatus =
  | "CREATED"
  | "QUEUED"
  | "VALIDATING"
  | "RUNNING"
  | "AWAITING_APPROVAL"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "TIMED_OUT";

export interface IAgentExecutionLog {
  timestamp: Date;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  metadata?: Record<string, unknown>;
}

export interface IAgentExecution extends Document {
  organizationId: mongoose.Types.ObjectId;
  agentId: string;
  agentName: string;
  agentType: string;
  status: AgentExecutionStatus;
  statusHistory: Array<{ status: AgentExecutionStatus; timestamp: Date; reason?: string }>;
  inputPayload: Record<string, unknown>;
  outputPayload?: Record<string, unknown>;
  logs: IAgentExecutionLog[];
  tokensUsed: number;
  durationMs: number;
  costEstimatedUsd: number;
  autonomyLevel: "Supervised" | "Semi-Autonomous" | "Autonomous";
  requiresApproval: boolean;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string;
  approvedAt?: Date;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  triggeredBy: string; // userId or "system"
  createdAt: Date;
  updatedAt: Date;
}

const AgentExecutionSchema = new Schema<IAgentExecution>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    agentId: { type: String, required: true, index: true },
    agentName: { type: String, required: true },
    agentType: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "CREATED",
        "QUEUED",
        "VALIDATING",
        "RUNNING",
        "AWAITING_APPROVAL",
        "COMPLETED",
        "FAILED",
        "CANCELLED",
        "TIMED_OUT",
      ],
      default: "CREATED",
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        reason: { type: String },
      },
    ],
    inputPayload: { type: Schema.Types.Mixed, default: {} },
    outputPayload: { type: Schema.Types.Mixed },
    logs: [
      {
        timestamp: { type: Date, default: Date.now },
        level: { type: String, enum: ["info", "warn", "error", "debug"], default: "info" },
        message: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed },
      },
    ],
    tokensUsed: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 },
    costEstimatedUsd: { type: Number, default: 0 },
    autonomyLevel: {
      type: String,
      enum: ["Supervised", "Semi-Autonomous", "Autonomous"],
      default: "Supervised",
    },
    requiresApproval: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
    },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    error: {
      code: { type: String },
      message: { type: String },
      stack: { type: String },
    },
    triggeredBy: { type: String, default: "system" },
  },
  { timestamps: true }
);

AgentExecutionSchema.index({ organizationId: 1, createdAt: -1 });

export const AgentExecution: Model<IAgentExecution> =
  mongoose.models.AgentExecution ||
  mongoose.model<IAgentExecution>("AgentExecution", AgentExecutionSchema);

