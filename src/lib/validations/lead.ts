import { z } from "zod";

export const leadStatusEnum = z.enum([
  "New",
  "Contacted",
  "Interested",
  "Replied",
  "Converted",
  "Archived",
]);

export const leadCategoryEnum = z.enum([
  "Restaurant",
  "Retail",
  "Beauty",
  "Healthcare",
  "Fitness",
  "Hotel",
  "Automotive",
  "Cafe",
  "Other",
]);

export const leadSourceEnum = z.enum([
  "Google Maps",
  "Instagram",
  "Local Search",
  "Justdial",
  "Manual Search",
  "Other",
]);

export const createLeadSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  category: leadCategoryEnum.default("Other"),
  location: z.string().default("New Delhi"),
  address: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  source: leadSourceEnum.default("Manual Search"),
  rating: z.coerce.number().min(0).max(5).default(4.5),
  reviewCount: z.coerce.number().int().min(0).default(0),
  status: leadStatusEnum.default("New"),
  websiteScore: z.coerce.number().min(0).max(100).default(60),
  opportunityScore: z.coerce.number().min(0).max(100).default(75),
  imageUrl: z.string().default("/assets/templates/restaurant.jpg"),
});

export const updateLeadSchema = createLeadSchema.partial();

export const leadFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  sortBy: z.enum(["opportunityScore", "websiteScore", "rating", "businessName", "createdAt"]).optional().default("opportunityScore"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadFilterInput = z.infer<typeof leadFilterSchema>;

