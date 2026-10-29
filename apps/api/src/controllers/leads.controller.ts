import { Request, Response, NextFunction } from "express";
import { Lead } from "../models/Lead.js";
import { Organization } from "../models/Organization.js";
import { createLeadSchema, updateLeadStatusSchema } from "../validators/lead.validator.js";

export async function getLeads(req: Request, res: Response, next: NextFunction) {
  try {
    let orgId = req.user?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    const search = (req.query.search as string) || "";
    const status = (req.query.status as string) || "";
    const category = (req.query.category as string) || "";
    const location = (req.query.location as string) || "";
    const sortBy = (req.query.sortBy as string) || "opportunityScore";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt((req.query.limit as string) || "10", 10)));

    const query: Record<string, any> = { organizationId: orgId };

    if (status && status !== "All") query.status = status;
    if (category && category !== "All") query.category = category;
    if (location && location !== "All") query.location = { $regex: location, $options: "i" };

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
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
      Lead.countDocuments({ organizationId: orgId }),
      Lead.countDocuments({ organizationId: orgId, status: "New" }),
      Lead.countDocuments({ organizationId: orgId, status: "Contacted" }),
      Lead.countDocuments({ organizationId: orgId, status: "Interested" }),
      Lead.countDocuments({ organizationId: orgId, status: "Replied" }),
      Lead.countDocuments({ organizationId: orgId, status: "Converted" }),
      Lead.countDocuments({ organizationId: orgId, status: "Archived" }),
    ]);

    res.status(200).json({
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
    });
  } catch (error) {
    next(error);
  }
}

export async function getLeadById(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.leadId;
    const leadId = Array.isArray(rawId) ? rawId[0] : rawId;
    let orgId = req.user?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    const query = (leadId && leadId.match(/^[0-9a-fA-F]{24}$/))
      ? { $or: [{ _id: leadId }, { slug: leadId }] }
      : { slug: leadId };

    const lead = await Lead.findOne({ ...query, organizationId: orgId });
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.status(200).json({ lead });
  } catch (error) {
    next(error);
  }
}

export async function createLead(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createLeadSchema.parse(req.body);

    let orgId = req.user?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    const slug =
      input.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Date.now().toString(36);

    const lead = await Lead.create({
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

    res.status(201).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
}

export async function updateLeadStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.leadId;
    const leadId = Array.isArray(rawId) ? rawId[0] : rawId;
    const input = updateLeadStatusSchema.parse(req.body);

    let orgId = req.user?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    const query = (leadId && leadId.match(/^[0-9a-fA-F]{24}$/))
      ? { $or: [{ _id: leadId }, { slug: leadId }] }
      : { slug: leadId };

    const lead = await Lead.findOneAndUpdate(
      { ...query, organizationId: orgId },
      { status: input.status, lastContactedAt: new Date().toLocaleDateString("en-GB") },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.status(200).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
}
