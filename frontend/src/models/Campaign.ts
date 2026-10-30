import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICampaign extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  channel: "Email" | "WhatsApp" | "Multi-channel";
  status: "Active" | "Paused" | "Completed" | "Draft";
  leadsTargeted: number;
  sentCount: number;
  openedCount: number;
  repliedCount: number;
  convertedCount: number;
  templateSubject: string;
  templateBody?: string;
  dryRunMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true },
    channel: {
      type: String,
      enum: ["Email", "WhatsApp", "Multi-channel"],
      default: "Email",
    },
    status: {
      type: String,
      enum: ["Active", "Paused", "Completed", "Draft"],
      default: "Active",
      index: true,
    },
    leadsTargeted: { type: Number, default: 50 },
    sentCount: { type: Number, default: 0 },
    openedCount: { type: Number, default: 0 },
    repliedCount: { type: Number, default: 0 },
    convertedCount: { type: Number, default: 0 },
    templateSubject: { type: String, required: true },
    templateBody: { type: String, default: "" },
    dryRunMode: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Campaign: Model<ICampaign> =
  mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);

