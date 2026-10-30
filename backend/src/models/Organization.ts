import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  slug: string;
  plan: "Starter" | "Growth" | "Pro" | "Enterprise";
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    plan: {
      type: String,
      enum: ["Starter", "Growth", "Pro", "Enterprise"],
      default: "Pro",
    },
    credits: { type: Number, default: 250 },
  },
  { timestamps: true }
);

export const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);

