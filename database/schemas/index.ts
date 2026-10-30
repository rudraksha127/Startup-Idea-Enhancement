import { z } from "zod";

export const OrganizationSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  plan: z.enum(["Starter", "Professional", "Enterprise"]).default("Starter"),
  tier: z.enum(["Free", "Pro", "Enterprise"]).default("Pro"),
  settings: z.record(z.any()).optional(),
});

export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["Founder", "Admin", "Operator", "Developer"]),
  organizationId: z.string(),
  avatarInitials: z.string().optional(),
});

export const LeadSchema = z.object({
  organizationId: z.string(),
  businessName: z.string().min(1),
  category: z.string(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  status: z.enum(["New", "Contacted", "Meeting Booked", "Proposal Sent", "Closed Won", "Lost"]),
  opportunityScore: z.number().min(0).max(100).default(50),
  source: z.string().default("Direct Discovery"),
});

export const InvoiceSchema = z.object({
  organizationId: z.string(),
  invoiceNumber: z.string(),
  clientName: z.string(),
  amount: z.number().positive(),
  currency: z.string().default("INR"),
  status: z.enum(["Draft", "Pending", "Paid", "Overdue"]),
  dueDate: z.string(),
  paidAt: z.date().optional(),
});

export const AgentExecutionSchema = z.object({
  organizationId: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  status: z.enum(["Running", "Completed", "Failed", "Paused", "Awaiting_Approval"]),
  triggerType: z.enum(["Manual", "Scheduled", "Webhook", "Cascade"]),
  inputData: z.record(z.any()).optional(),
  outputData: z.record(z.any()).optional(),
  cost: z.number().min(0).default(0),
  tokensUsed: z.number().min(0).default(0),
});

