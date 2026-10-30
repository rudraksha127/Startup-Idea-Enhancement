import { Lead } from "../../models/Lead.js";
import { CreateLeadInput } from "../../validators/lead.validator.js";

export interface GetLeadsQuery {
  orgId: string;
  search?: string;
  status?: string;
  category?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: 1 | -1;
  page?: number;
  limit?: number;
}

export class LeadsService {
  static async getLeads(params: GetLeadsQuery) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const sortBy = params.sortBy || "opportunityScore";
    const sortOrder = params.sortOrder || -1;

    const query: Record<string, any> = { organizationId: params.orgId };

    if (params.status && params.status !== "All") query.status = params.status;
    if (params.category && params.category !== "All") query.category = params.category;
    if (params.location && params.location !== "All") {
      query.location = { $regex: params.location, $options: "i" };
    }

    if (params.search) {
      query.$or = [
        { businessName: { $regex: params.search, $options: "i" } },
        { address: { $regex: params.search, $options: "i" } },
        { category: { $regex: params.search, $options: "i" } },
        { phone: { $regex: params.search, $options: "i" } },
        { email: { $regex: params.search, $options: "i" } },
      ];
    }

    const [
      totalMatching,
      leads,
      allCount,
      newCount,
      contactedCount,
      interestedCount,
      repliedCount,
      convertedCount,
      archivedCount,
    ] = await Promise.all([
      Lead.countDocuments(query),
      Lead.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Lead.countDocuments({ organizationId: params.orgId }),
      Lead.countDocuments({ organizationId: params.orgId, status: "New" }),
      Lead.countDocuments({ organizationId: params.orgId, status: "Contacted" }),
      Lead.countDocuments({ organizationId: params.orgId, status: "Interested" }),
      Lead.countDocuments({ organizationId: params.orgId, status: "Replied" }),
      Lead.countDocuments({ organizationId: params.orgId, status: "Converted" }),
      Lead.countDocuments({ organizationId: params.orgId, status: "Archived" }),
    ]);

    return {
      leads,
      total: totalMatching,
      page,
      limit,
      totalPages: Math.ceil(totalMatching / limit),
      counts: {
        All: allCount,
        New: newCount,
        Contacted: contactedCount,
        Interested: interestedCount,
        Replied: repliedCount,
        Converted: convertedCount,
        Archived: archivedCount,
      },
    };
  }

  static async getLeadById(idOrSlug: string, orgId: string) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const query = isObjectId
      ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }], organizationId: orgId }
      : { slug: idOrSlug, organizationId: orgId };

    return Lead.findOne(query);
  }

  static async createLead(input: CreateLeadInput, orgId: string) {
    const slug =
      input.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Date.now().toString(36);

    return Lead.create({
      ...input,
      slug,
      organizationId: orgId,
      performanceScores: {
        website: input.websiteScore || 65,
        seo: 50,
        performance: 45,
        mobile: 40,
        accessibility: 70,
        security: 80,
      },
      painPoints: ["Legacy web design", "No direct online booking"],
      competitors: [],
      actionPlan: [
        {
          phase: "Immediate",
          title: "Initial Outreach & Audit Presentation",
          description: "Send personalized website audit breakdown highlighting performance score.",
          timeEstimate: "1-2 days",
        },
      ],
      websiteAudit: {
        lcp: "4.2s",
        fid: "180ms",
        cls: "0.22",
        fcp: "2.4s",
        issues: [
          { type: "critical", title: "Slow First Contentful Paint", detail: "Exceeds Google recommended standard." },
        ],
      },
      aiInsights: {
        summary: `Promising opportunity in ${input.location}. High potential to increase organic customer capture.`,
        strengths: ["Strong local presence"],
        weaknesses: ["Under-optimized digital presence"],
        pitchAngle: "Offer conversion-focused responsive website upgrade.",
      },
    });
  }

  static async updateLeadStatus(idOrSlug: string, status: string, orgId: string) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const query = isObjectId
      ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }], organizationId: orgId }
      : { slug: idOrSlug, organizationId: orgId };

    return Lead.findOneAndUpdate(
      query,
      { status, lastContactedAt: new Date().toLocaleDateString("en-GB") },
      { new: true }
    );
  }
}
