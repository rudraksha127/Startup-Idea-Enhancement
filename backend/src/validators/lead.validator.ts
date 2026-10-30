import { z } from "zod";

export const createLeadSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  category: z.string().min(2, "Category is required"),
  location: z.string().default("Indore"),
  address: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  source: z.string().default("Manual Import"),
  rating: z.number().min(0).max(5).default(4.5),
  reviewCount: z.number().min(0).default(12),
  status: z
    .enum(["New", "Contacted", "Interested", "Replied", "Converted", "Archived"])
    .default("New"),
  websiteScore: z.number().min(0).max(100).default(65),
  opportunityScore: z.number().min(0).max(100).default(85),
  imageUrl: z.string().default("/assets/urban-kitchen.jpg"),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(["New", "Contacted", "Interested", "Replied", "Converted", "Archived"]),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

