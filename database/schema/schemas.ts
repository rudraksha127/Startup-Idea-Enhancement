// Canonical Entity Types and Schemas for External Consumers & Integrations

export interface OrganizationSchema {
  id: string;
  name: string;
  slug: string;
  plan: "starter" | "pro" | "enterprise";
  creditsUsed: number;
  creditsLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSchema {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: "founder" | "developer" | "growth_specialist" | "admin";
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadSchema {
  id: string;
  orgId: string;
  businessName: string;
  slug: string;
  category: string;
  location: string;
  address?: string;
  phone?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  opportunityScore: number; // 1-10
  status: "New" | "Contacted" | "Interested" | "Replied" | "Converted" | "Archived";
  source: string;
  auditScores?: {
    websiteScore: number;
    seoVisibility: number;
    speedPerformance: number;
    mobileUsability: number;
    accessibility: number;
    securitySSL: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectSchema {
  id: string;
  orgId: string;
  name: string;
  client: string;
  status: "Active" | "Completed" | "On Hold" | "Cancelled";
  budget: number;
  amountPaid: number;
  amountDue: number;
  progress: number;
  deadline: string;
  createdAt: Date;
}

