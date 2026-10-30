import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { Organization } from "@/models/Organization";
import { getCurrentUser } from "@/lib/auth/jwt";
import { createLeadSchema } from "@/lib/validations/lead";
import { FilterQuery } from "mongoose";
import { DEFAULT_LEADS } from "@/lib/data/default-leads";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";
  const sortBy = searchParams.get("sortBy") || "opportunityScore";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));

  try {
    await connectToDatabase();
    const session = await getCurrentUser();

    let orgId = session?.organizationId;
    if (!orgId) {
      let defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      if (!defaultOrg) {
        defaultOrg = await Organization.create({
          name: "AgencyOS Workspace",
          slug: "agencyos-demo",
          plan: "Pro",
          credits: 250,
        });
      }
      orgId = defaultOrg._id.toString();
    }

    // Ensure the organization has leads in the database; if count is 0, auto-seed DEFAULT_LEADS!
    const existingCount = await Lead.countDocuments({ organizationId: orgId });
    if (existingCount === 0) {
      await Lead.insertMany(
        DEFAULT_LEADS.map((leadData) => ({
          ...leadData,
          organizationId: orgId,
        }))
      );
    }

    // Build query filter
    const query: FilterQuery<typeof Lead> = { organizationId: orgId };

    if (status && status !== "All") {
      query.status = status;
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (location && location !== "All") {
      query.location = { $regex: location, $options: "i" };
    }

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Status counts for tabs
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

    const counts = {
      All: allCount,
      New: newCount,
      Contacted: contactedCount,
      Interested: interestedCount,
      Replied: repliedCount,
      Converted: convertedCount,
      Archived: archivedCount,
    };

    return NextResponse.json({
      leads,
      total: totalMatching,
      page,
      limit,
      totalPages: Math.ceil(totalMatching / limit),
      counts,
    });
  } catch (error) {
    console.error("Leads listing fallback (DB offline or error):", error);
    // Graceful offline fallback: filter DEFAULT_LEADS
    let filtered = [...DEFAULT_LEADS];
    if (status && status !== "All") {
      filtered = filtered.filter((l) => l.status === status);
    }
    if (category && category !== "All") {
      filtered = filtered.filter((l) => l.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.businessName.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          (l.location && l.location.toLowerCase().includes(q))
      );
    }

    const totalMatching = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      leads: paginated,
      total: totalMatching,
      page,
      limit,
      totalPages: Math.ceil(totalMatching / limit),
      counts: {
        All: DEFAULT_LEADS.length,
        New: DEFAULT_LEADS.filter((l) => l.status === "New").length,
        Contacted: DEFAULT_LEADS.filter((l) => l.status === "Contacted").length,
        Interested: DEFAULT_LEADS.filter((l) => l.status === "Interested").length,
        Replied: DEFAULT_LEADS.filter((l) => l.status === "Replied").length,
        Converted: DEFAULT_LEADS.filter((l) => l.status === "Converted").length,
        Archived: DEFAULT_LEADS.filter((l) => l.status === "Archived").length,
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getCurrentUser();

    let orgId = session?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createLeadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
    }

    const slug =
      result.data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Date.now().toString(36);

    const lead = await Lead.create({
      ...result.data,
      slug,
      organizationId: orgId,
      performanceScores: {
        website: result.data.websiteScore || 65,
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
        summary: `Promising opportunity in ${result.data.location}. High potential to increase organic customer capture.`,
        strengths: ["Strong local presence"],
        weaknesses: ["Under-optimized digital presence"],
        pitchAngle: "Offer conversion-focused responsive website upgrade.",
      },
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    console.error("Create lead error:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
