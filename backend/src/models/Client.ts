import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClient extends Document {
  organizationId: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: "Active" | "Onboarding" | "Retainer" | "Past";
  monthlyRetainer: number;
  plan: string;
  website?: string;
  activeProjectsCount: number;
  totalPaid: number;
  onboardedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", index: true },
    businessName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, default: "Indore, Madhya Pradesh" },
    status: {
      type: String,
      enum: ["Active", "Onboarding", "Retainer", "Past"],
      default: "Active",
      index: true,
    },
    monthlyRetainer: { type: Number, default: 25000 },
    plan: { type: String, default: "Performance Funnel + Maintenance" },
    website: { type: String, default: "" },
    activeProjectsCount: { type: Number, default: 1 },
    totalPaid: { type: Number, default: 50000 },
    onboardedAt: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);

