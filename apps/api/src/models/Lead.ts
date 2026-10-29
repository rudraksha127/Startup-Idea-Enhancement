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

const CompetitorSchema = new Schema<ICompetitor>({
  name: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  price: { type: String, default: "₹₹" },
  note: { type: String, default: "" },
});

const ActionPlanSchema = new Schema<IActionPlanItem>({
  phase: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  timeEstimate: { type: String, default: "1-2 days" },
});

const AuditIssueSchema = new Schema<IAuditIssue>({
  type: { type: String, enum: ["critical", "warning", "passed"], required: true },
  title: { type: String, required: true },
  detail: { type: String, required: true },
});

const LeadSchema = new Schema<ILead>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    slug: { type: String, required: true, index: true },
    businessName: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    location: { type: String, default: "Indore" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    source: { type: String, default: "Google Maps" },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["New", "Contacted", "Interested", "Replied", "Converted", "Archived"],
      default: "New",
      index: true,
    },
    websiteScore: { type: Number, default: 60 },
    opportunityScore: { type: Number, default: 80, index: true },
    imageUrl: { type: String, default: "/assets/urban-kitchen.jpg" },
    lastContactedAt: { type: String },
    performanceScores: {
      website: { type: Number, default: 60 },
      seo: { type: Number, default: 50 },
      performance: { type: Number, default: 50 },
      mobile: { type: Number, default: 50 },
      accessibility: { type: Number, default: 70 },
      security: { type: Number, default: 80 },
    },
    painPoints: [{ type: String }],
    competitors: [CompetitorSchema],
    actionPlan: [ActionPlanSchema],
    websiteAudit: {
      lcp: { type: String, default: "3.5s" },
      fid: { type: String, default: "120ms" },
      cls: { type: String, default: "0.15" },
      fcp: { type: String, default: "2.0s" },
      issues: [AuditIssueSchema],
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

LeadSchema.index({ organizationId: 1, status: 1 });
LeadSchema.index({ organizationId: 1, category: 1 });
LeadSchema.index({ organizationId: 1, opportunityScore: -1 });

export const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);

