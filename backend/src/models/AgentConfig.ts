import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAgentConfig extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  role: string;
  status: "Active" | "Idle" | "Paused";
  dailyTarget: number;
  processedToday: number;
  confidenceThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const AgentConfigSchema = new Schema<IAgentConfig>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    role: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "Idle", "Paused"],
      default: "Active",
    },
    dailyTarget: { type: Number, default: 50 },
    processedToday: { type: Number, default: 0 },
    confidenceThreshold: { type: Number, default: 85 },
  },
  { timestamps: true }
);

export const AgentConfig: Model<IAgentConfig> =
  mongoose.models.AgentConfig ||
  mongoose.model<IAgentConfig>("AgentConfig", AgentConfigSchema);

