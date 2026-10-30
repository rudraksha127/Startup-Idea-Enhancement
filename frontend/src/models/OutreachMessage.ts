import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOutreachMessage extends Document {
  organizationId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  toEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  status: "Draft" | "Queued" | "Sent" | "Opened" | "Replied";
  templateUsed?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OutreachMessageSchema = new Schema<IOutreachMessage>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    toEmail: { type: String, required: true },
    recipientName: { type: String, default: "" },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ["Draft", "Queued", "Sent", "Opened", "Replied"],
      default: "Draft",
      index: true,
    },
    templateUsed: { type: String, default: "Default Website Redesign" },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export const OutreachMessage: Model<IOutreachMessage> =
  mongoose.models.OutreachMessage ||
  mongoose.model<IOutreachMessage>("OutreachMessage", OutreachMessageSchema);

