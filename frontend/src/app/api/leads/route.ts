import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { requireApiAuth, forwardAuthHeaders } from "@/lib/auth/jwt";
import { createLeadSchema } from "@/lib/validations/lead";
import mongoose, { FilterQuery } from "mongoose";

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";
  const sortBy = searchParams.get("sortBy") || "opportunityScore";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));

  // 1. Try Zoho Catalyst AppSail backend first with 4s timeout
  const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://agencyos-api-50046975560.development.catalystappsail.in/api/v1";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const backendRes = await fetch(`${backendApiUrl}/leads?${searchParams.toString()}`, {
      headers: forwardAuthHeaders(req),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data && Array.isArray(data.leads)) {
        return NextResponse.json({
          leads: data.leads,
          total: data.total || data.leads.length,
          page,
          limit,
          totalPages: Math.ceil((data.total || data.leads.length) / limit) || (data.total > 0 ? 1 : 0),
          counts: data.counts || {
            All: data.leads.length,
            New: data.leads.filter((l: any) => l.status === "New" || l.qualificationStatus === "New").length,
            Contacted: data.leads.filter((l: any) => l.status === "Contacted" || l.qualificationStatus === "Contacted").length,
            Interested: data.leads.filter((l: any) => l.status === "Interested" || l.qualificationStatus === "Interested").length,
            Replied: data.leads.filter((l: any) => l.status === "Replied" || l.qualificationStatus === "Replied").length,
            Converted: data.leads.filter((l: any) => l.status === "Converted" || l.qualificationStatus === "Converted").length,
            Archived: data.leads.filter((l: any) => l.status === "Archived" || l.qualificationStatus === "Archived").length,
          },
        });
      }
    }
  } catch (backendErr) {
    console.warn("Backend leads fetch fallback to local DB:", backendErr);
  }

  // 2. Try MongoDB if available
  try {
    await connectToDatabase();
    const orgId = auth.session.organizationId;

    if (mongoose.connection.readyState !== 1 || !mongoose.isValidObjectId(orgId)) {
      return NextResponse.json({
        leads: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        counts: { All: 0, New: 0, Contacted: 0, Interested: 0, Replied: 0, Converted: 0, Archived: 0 },
      });
    }

    const query: FilterQuery<typeof Lead> = { organizationId: orgId };
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

    return NextResponse.json({
      leads,
      total: totalMatching,
      page,
      limit,
      totalPages: Math.ceil(totalMatching / limit) || (totalMatching > 0 ? 1 : 0),
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
  } catch {
    // 3. Pristine Clean Pipeline
    return NextResponse.json({
      leads: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      counts: {
        All: 0,
        New: 0,
        Contacted: 0,
        Interested: 0,
        Replied: 0,
        Converted: 0,
        Archived: 0,
      },
    });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const result = createLeadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
    }

    // 1. Try forwarding to Zoho Catalyst AppSail backend
    const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://agencyos-api-50046975560.development.catalystappsail.in/api/v1";
    try {
      const backendRes = await fetch(`${backendApiUrl}/leads`, {
        method: "POST",
        headers: forwardAuthHeaders(req, { "Content-Type": "application/json" }),
        body: JSON.stringify(result.data),
      });
      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data, { status: 201 });
      }
    } catch (backendErr) {
      console.warn("Backend lead creation failed, falling back to local DB:", backendErr);
    }

    await connectToDatabase();
    const orgId = auth.session.organizationId;

    if (mongoose.connection.readyState !== 1 || !mongoose.isValidObjectId(orgId)) {
      return NextResponse.json({ error: "Organization persistence unavailable" }, { status: 503 });
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
        website: result.data.websiteScore || 0,
        seo: 0,
        performance: 0,
        mobile: 0,
        accessibility: 0,
        security: 0,
      },
      painPoints: [],
      competitors: [],
      actionPlan: [],
      websiteAudit: {
        lcp: "Not audited",
        fid: "Not audited",
        cls: "Not audited",
        fcp: "Not audited",
        issues: [],
      },
      aiInsights: {
        summary: `Lead captured for ${result.data.businessName} in ${result.data.location}. Run a live audit to measure technical scores and opportunities.`,
        strengths: [],
        weaknesses: [],
        pitchAngle: "Run Website Audit first to generate an evidence-backed pitch angle.",
      },
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    console.error("Create lead error:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
