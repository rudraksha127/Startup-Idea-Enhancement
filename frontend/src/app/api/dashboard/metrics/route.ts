import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { Organization } from "@/models/Organization";
import { AgentConfig } from "@/models/AgentConfig";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET() {
  const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://agencyos-api-50046975560.development.catalystappsail.in/api/v1";

  // 1. Try Zoho Catalyst AppSail backend first with 4s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const backendRes = await fetch(`${backendApiUrl}/dashboard/metrics`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data && data.metrics) {
        const totalLeads = data.metrics.totalLeads ?? 0;
        const qualifiedLeads = data.metrics.qualifiedLeads ?? data.metrics.contacted ?? 0;
        const activeOutreaches = data.metrics.activeOutreaches ?? data.metrics.meetingsBooked ?? 0;
        const convertedClients = data.metrics.convertedClients ?? data.metrics.activeProjects ?? 0;

        return NextResponse.json({
          metrics: {
            totalLeads,
            qualifiedLeads,
            activeOutreaches,
            convertedClients,
            leadsTrend: data.metrics.leadsTrend || "No prior period",
            qualifiedTrend: data.metrics.qualifiedTrend || "No prior period",
            outreachTrend: data.metrics.outreachTrend || "No prior period",
            convertedTrend: data.metrics.convertedTrend || "No prior period",
          },
          growthHistory: Array.isArray(data.growthHistory) ? data.growthHistory : [],
          sources: totalLeads > 0 && Array.isArray(data.sources) ? data.sources : [],
          revenueOverview: data.revenueOverview || {
            totalFormatted: data.metrics.pipelineValue || "₹0",
            totalRaw: 0,
            trend: "No prior period",
            monthly: [],
          },
          agents: Array.isArray(data.agents) ? data.agents : [],
        }, {
          headers: {
            "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
          },
        });
      }
    }
  } catch (backendErr) {
    console.warn("Backend metrics fetch fallback to local DB:", backendErr);
  }

  // 2. Try MongoDB if available
  try {
    await connectToDatabase();
    const session = await getCurrentUser();

    let orgId = session?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    const defaultAgents = [
      { name: "Research Agent", role: "Scanning locations", status: "Idle", processedToday: 0, dailyTarget: 50 },
      { name: "Outreach Agent", role: "Sending emails", status: "Idle", processedToday: 0, dailyTarget: 50 },
      { name: "Reply Manager", role: "Handling responses", status: "Idle", processedToday: 0, dailyTarget: 25 },
      { name: "Sales Agent", role: "Booking meetings", status: "Idle", processedToday: 0, dailyTarget: 20 },
      { name: "Content Agent", role: "Creating content", status: "Idle", processedToday: 0, dailyTarget: 15 },
    ];

    if (!orgId) {
      return NextResponse.json({
        metrics: {
          totalLeads: 0,
          qualifiedLeads: 0,
          activeOutreaches: 0,
          convertedClients: 0,
          leadsTrend: "No prior period",
          qualifiedTrend: "No prior period",
          outreachTrend: "No prior period",
          convertedTrend: "No prior period",
        },
        growthHistory: [],
        sources: [],
        revenueOverview: { totalFormatted: "₹0", totalRaw: 0, trend: "No prior period", monthly: [] },
        agents: defaultAgents,
      });
    }

    const [
      totalLeads,
      qualifiedLeads,
      activeOutreaches,
      convertedClients,
      sourceAggregation,
      agents,
    ] = await Promise.all([
      Lead.countDocuments({ organizationId: orgId }),
      Lead.countDocuments({ organizationId: orgId, $or: [{ status: "Contacted" }, { lastContactedAt: { $ne: null } }] }),
      Lead.countDocuments({ organizationId: orgId, status: { $in: ["Interested", "Replied"] } }),
      Lead.countDocuments({ organizationId: orgId, status: "Converted" }),
      Lead.aggregate([
        { $match: { organizationId: orgId } },
        { $group: { _id: "$source", count: { $sum: 1 } } },
      ]),
      AgentConfig.find({ organizationId: orgId }),
    ]);

    const sourceColors: Record<string, string> = {
      "Google Maps": "#0da66c",
      "Instagram": "#e1306c",
      "Local Search": "#2563eb",
      "Justdial": "#f59e0b",
      "Manual Search": "#828a84",
    };

    const sources = totalLeads > 0
      ? sourceAggregation.map((s) => ({
          name: s._id || "Other",
          count: s.count,
          percentage: Math.round((s.count / totalLeads) * 100),
          color: sourceColors[s._id] || "#10251f",
        }))
      : [];

    const growthHistory: any[] = [];

    const revenueOverview = {
      totalFormatted: "₹0",
      totalRaw: 0,
      trend: "No prior period",
      monthly: [],
    };

    return NextResponse.json({
      metrics: {
        totalLeads,
        qualifiedLeads,
        activeOutreaches,
        convertedClients,
        leadsTrend: "No prior period",
        qualifiedTrend: "No prior period",
        outreachTrend: "No prior period",
        convertedTrend: "No prior period",
      },
      growthHistory,
      sources,
      revenueOverview,
      agents: agents.length > 0
        ? agents.map((a) => ({
            name: a.name,
            role: a.role || "Specialist Agent",
            status: a.status || "Idle",
            processedToday: a.processedToday || 0,
            dailyTarget: a.dailyTarget || 20,
          }))
        : defaultAgents,
    });
  } catch {
    const defaultAgents = [
      { name: "Research Agent", role: "Scanning locations", status: "Idle", processedToday: 0, dailyTarget: 50 },
      { name: "Outreach Agent", role: "Sending emails", status: "Idle", processedToday: 0, dailyTarget: 50 },
      { name: "Reply Manager", role: "Handling responses", status: "Idle", processedToday: 0, dailyTarget: 25 },
      { name: "Sales Agent", role: "Booking meetings", status: "Idle", processedToday: 0, dailyTarget: 20 },
      { name: "Content Agent", role: "Creating content", status: "Idle", processedToday: 0, dailyTarget: 15 },
    ];

    return NextResponse.json({
      metrics: {
        totalLeads: 0,
        qualifiedLeads: 0,
        activeOutreaches: 0,
        convertedClients: 0,
        leadsTrend: "No prior period",
        qualifiedTrend: "No prior period",
        outreachTrend: "No prior period",
        convertedTrend: "No prior period",
      },
      growthHistory: [],
      sources: [],
      revenueOverview: { totalFormatted: "₹0", totalRaw: 0, trend: "No prior period", monthly: [] },
      agents: defaultAgents,
    });
  }
}
