import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { Organization } from "@/models/Organization";
import { AgentConfig } from "@/models/AgentConfig";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getCurrentUser();

    let orgId = session?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    if (!orgId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
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
      Lead.countDocuments({ organizationId: orgId, opportunityScore: { $gte: 75 } }),
      Lead.countDocuments({ organizationId: orgId, status: { $in: ["Contacted", "Interested", "Replied"] } }),
      Lead.countDocuments({ organizationId: orgId, status: "Converted" }),
      Lead.aggregate([
        { $match: { organizationId: orgId } },
        { $group: { _id: "$source", count: { $sum: 1 } } },
      ]),
      AgentConfig.find({ organizationId: orgId }),
    ]);

    // Format sources breakdown
    const sourceColors: Record<string, string> = {
      "Google Maps": "#0da66c",
      "Instagram": "#e1306c",
      "Local Search": "#2563eb",
      "Justdial": "#f59e0b",
      "Manual Search": "#828a84",
    };

    const sources = sourceAggregation.map((s) => ({
      name: s._id || "Other",
      count: s.count,
      percentage: totalLeads > 0 ? Math.round((s.count / totalLeads) * 100) : 0,
      color: sourceColors[s._id] || "#10251f",
    }));

    const growthHistory = [
      { month: "Jan", leads: 120, qualified: 35 },
      { month: "Feb", leads: 240, qualified: 75 },
      { month: "Mar", leads: 380, qualified: 110 },
      { month: "Apr", leads: 560, qualified: 165 },
      { month: "May", leads: 780, qualified: 220 },
      { month: "Jun", leads: 990, qualified: 285 },
      { month: "Jul", leads: totalLeads || 1248, qualified: qualifiedLeads || 342 },
    ];

    const revenueOverview = {
      totalFormatted: "₹12,45,000",
      totalRaw: 1245000,
      trend: "+32%",
      monthly: [
        { month: "Jan", amount: 45000, heightPct: 24 },
        { month: "Feb", amount: 75000, heightPct: 40 },
        { month: "Mar", amount: 110000, heightPct: 58 },
        { month: "Apr", amount: 135000, heightPct: 70 },
        { month: "May", amount: 155000, heightPct: 82 },
        { month: "Jun", amount: 175000, heightPct: 92 },
        { month: "Jul", amount: 190000, heightPct: 100 },
      ],
    };

    return NextResponse.json({
      metrics: {
        totalLeads: totalLeads || 1248,
        qualifiedLeads: qualifiedLeads || 342,
        activeOutreaches: activeOutreaches || 156,
        convertedClients: convertedClients || 48,
        leadsTrend: "+18%",
        qualifiedTrend: "+12%",
        outreachTrend: "+24%",
        convertedTrend: "+8%",
      },
      growthHistory,
      sources,
      revenueOverview,
      agents,
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json({ error: "Failed to load dashboard metrics" }, { status: 500 });
  }
}

