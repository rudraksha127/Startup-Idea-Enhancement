import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITemplateVariation {
  name: string;
  preview: string;
  isDefault?: boolean;
}

export interface ITemplate extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  categoryBadge?: string;
  rating: number;
  usesCount: number;
  description: string;
  img: string;
  thumbnails: string[];
  features: string[];
  variations: ITemplateVariation[];
  isCustom: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    categoryBadge: { type: String, default: "bg-blue-50 text-blue-700" },
    rating: { type: Number, default: 4.8 },
    usesCount: { type: Number, default: 120 },
    description: { type: String, required: true },
    img: { type: String, default: "/assets/templates/restaurant.jpg" },
    thumbnails: [{ type: String }],
    features: [{ type: String }],
    variations: [
      {
        name: { type: String, required: true },
        preview: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    isCustom: { type: Boolean, default: false },
    createdBy: { type: String },
  },
  { timestamps: true }
);

export const Template: Model<ITemplate> =
  mongoose.models.Template || mongoose.model<ITemplate>("Template", TemplateSchema);

