import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISuppression extends Document {
  organizationId: mongoose.Types.ObjectId;
  channel: "email" | "whatsapp" | "all";
  contactValue: string; // normalized lowercase email or phone
  reason: string;
  source: "reply_opt_out" | "manual" | "bounce";
  createdAt: Date;
}

const SuppressionSchema = new Schema<ISuppression>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ["email", "whatsapp", "all"],
      default: "all",
    },
    contactValue: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    reason: { type: String, default: "Recipient opt-out" },
    source: {
      type: String,
      enum: ["reply_opt_out", "manual", "bounce"],
      default: "reply_opt_out",
    },
  },
  { timestamps: true }
);

SuppressionSchema.index({ organizationId: 1, contactValue: 1 }, { unique: true });

export const Suppression: Model<ISuppression> =
  mongoose.models.Suppression || mongoose.model<ISuppression>("Suppression", SuppressionSchema);
