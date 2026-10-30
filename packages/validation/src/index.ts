import { z } from "zod";

// 1. Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organizationName: z.string().min(3, "Organization name must be at least 3 characters"),
});

// 2. Lead Schemas
export const createLeadSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  category: z.string().min(2, "Category is required"),
  address: z.string().default("Indore, Madhya Pradesh"),
  city: z.string().default("Indore"),
  state: z.string().default("Madhya Pradesh"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  rating: z.number().min(0).max(5).default(4.0),
  reviewCount: z.number().int().min(0).default(0),
  opportunityScore: z.number().min(1).max(10).default(8.0),
  status: z.enum(["New", "Contacted", "Interested", "Replied", "Converted", "Archived"]).default("New"),
  source: z.string().default("Map Explorer"),
  estimatedValue: z.number().min(0).default(45000),
});

export const updateLeadSchema = createLeadSchema.partial();

// 3. Client Schemas
export const createClientSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  contactPerson: z.string().min(2, "Contact person name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(3, "Address is required"),
  status: z.enum(["Active", "Onboarding", "Retainer", "Past"]).default("Active"),
  monthlyRetainer: z.number().min(0).default(25000),
  plan: z.string().default("Performance Funnel + Maintenance"),
  website: z.string().url().optional().or(z.literal("")),
});

export const updateClientSchema = createClientSchema.partial();

// 4. Project Schemas
export const createProjectSchema = z.object({
  title: z.string().min(3, "Project title is required"),
  clientName: z.string().min(2, "Client name is required"),
  status: z.enum(["Discovery", "In Progress", "Review", "Delivered"]).default("Discovery"),
  budget: z.number().min(0).default(45000),
  deadline: z.string().optional(),
  scope: z.string().default(""),
  features: z.array(z.string()).default([]),
});

export const updateProjectSchema = createProjectSchema.partial();

// 5. AI Agent Schemas
export const updateAgentConfigSchema = z.object({
  status: z.enum(["Active", "Idle", "Paused"]).optional(),
  dailyTarget: z.number().int().min(1).max(500).optional(),
  confidenceThreshold: z.number().min(50).max(100).optional(),
  model: z.string().optional(),
  systemPrompt: z.string().optional(),
});

// 6. Campaign Schemas
export const createCampaignSchema = z.object({
  name: z.string().min(3, "Campaign name is required"),
  channel: z.enum(["Email", "WhatsApp", "Multi-channel"]).default("Email"),
  templateSubject: z.string().min(3, "Email subject is required"),
  dryRunMode: z.boolean().default(true),
});

export const updateCampaignSchema = createCampaignSchema.partial();

// 7. Workspace Settings Schema
export const updateSettingsSchema = z.object({
  organizationName: z.string().min(2).optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  notificationEmail: z.string().email().optional(),
  geminiApiKey: z.string().optional(),
  openAiApiKey: z.string().optional(),
  resendApiKey: z.string().optional(),
});

