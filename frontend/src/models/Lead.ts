import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompetitor {
  name: string;
  rating: number;
  price: string;
  note: string;
}

export interface IActionPlanItem {
  phase: string;
  title: string;
  description: string;
  timeEstimate: string;
}

export interface IAuditIssue {
  type: "critical" | "warning" | "passed";
  title: string;
  detail: string;
}

export interface ILead extends Document {
  organizationId: mongoose.Types.ObjectId;
  slug: string;
  businessName: string;
  category: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  source: string;
  rating: number;
  reviewCount: number;
  status: "New" | "Contacted" | "Interested" | "Replied" | "Converted" | "Archived";
  websiteScore: number;
  opportunityScore: number;
  imageUrl: string;
  lastContactedAt?: string;
  performanceScores: {
    website: number;
    seo: number;
    performance: number;
    mobile: number;
    accessibility: number;
    security: number;
  };
  painPoints: string[];
  competitors: ICompetitor[];
  actionPlan: IActionPlanItem[];
  websiteAudit: {
    lcp: string;
    fid: string;
    cls: string;
    fcp: string;
    issues: IAuditIssue[];
  };
  aiInsights: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    pitchAngle: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    slug: { type: String, required: true, trim: true, index: true },
    businessName: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, index: true },
    location: { type: String, required: true, index: true },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    source: { type: String, default: "Manual Search", index: true },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["New", "Contacted", "Interested", "Replied", "Converted", "Archived"],
      default: "New",
      index: true,
    },
    websiteScore: { type: Number, default: 60 },
    opportunityScore: { type: Number, default: 75, index: true },
    imageUrl: { type: String, default: "/assets/templates/restaurant.jpg" },
    lastContactedAt: { type: String, default: "—" },
    performanceScores: {
      website: { type: Number, default: 62 },
      seo: { type: Number, default: 48 },
      performance: { type: Number, default: 42 },
      mobile: { type: Number, default: 38 },
      accessibility: { type: Number, default: 71 },
      security: { type: Number, default: 85 },
    },
    painPoints: [{ type: String }],
    competitors: [
      {
        name: { type: String },
        rating: { type: Number },
        price: { type: String },
        note: { type: String },
      },
    ],
    actionPlan: [
      {
        phase: { type: String },
        title: { type: String },
        description: { type: String },
        timeEstimate: { type: String },
      },
    ],
    websiteAudit: {
      lcp: { type: String, default: "3.8s" },
      fid: { type: String, default: "180ms" },
      cls: { type: String, default: "0.24" },
      fcp: { type: String, default: "2.1s" },
      issues: [
        {
          type: { type: String, enum: ["critical", "warning", "passed"] },
          title: { type: String },
          detail: { type: String },
        },
      ],
    },
    aiInsights: {
      summary: { type: String, default: "" },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      pitchAngle: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Compound indexes for fast multi-filter sorting
LeadSchema.index({ organizationId: 1, status: 1, opportunityScore: -1 });
LeadSchema.index({ organizationId: 1, category: 1 });
LeadSchema.index({ businessName: "text", address: "text", category: "text" });

export const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);

