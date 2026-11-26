import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { Campaign } from "@/models/Campaign";
import { OutreachMessage } from "@/models/OutreachMessage";
import { requireApiAuth } from "@/lib/auth/jwt";
import mongoose from "mongoose";

const EMPTY_ANALYTICS = {
  kpis: {
    totalLeads: 0,
    activeClients: 0,
    totalProjects: 0,
    activeCampaigns: 0,
    emailsSent: 0,
    repliesReceived: 0,
    meetingsBooked: 0,
    conversionRate: "0.0%",
    mrr: "₹0",
    arr: "₹0",
  },
  funnel: [],
  channelPerformance: [],
  recentActivity: [],
};

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    if (mongoose.connection.readyState !== 1 || !mongoose.isValidObjectId(auth.session.organizationId)) {
      return NextResponse.json({
        success: true,
        data: EMPTY_ANALYTICS,
      });
    }

    const query: Record<string, unknown> = { organizationId: auth.session.organizationId };

    const [
      totalLeads,
      totalClients,
      totalProjects,
      totalCampaigns,
      totalMessages,
      recentLeads,
      campaignsList,
    ] = await Promise.all([
      Lead.countDocuments(query),
      Client.countDocuments(query),
      Project.countDocuments(query),
      Campaign.countDocuments(query),
      OutreachMessage.countDocuments(query),
      Lead.find(query).sort({ createdAt: -1 }).limit(5).lean(),
      Campaign.find(query).lean(),
    ]);

    const totalEmailsSent = campaignsList.reduce((acc, c) => acc + (c.sentCount || 0), totalMessages || 0);
    const totalReplies = campaignsList.reduce((acc, c) => acc + (c.repliedCount || 0), 0);

    const activities = recentLeads.length > 0
      ? recentLeads.map((l: any) => ({
          text: `Lead discovered: ${l.businessName} (${l.category || "Local Business"})`,
          time: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "Recently",
          type: "lead",
        }))
      : EMPTY_ANALYTICS.recentActivity;

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalLeads,
          activeClients: totalClients,
          totalProjects,
          activeCampaigns: totalCampaigns,
          emailsSent: totalEmailsSent,
          repliesReceived: totalReplies,
          meetingsBooked: 0,
          conversionRate: totalEmailsSent > 0 ? ((totalReplies / totalEmailsSent) * 100).toFixed(1) + "%" : "0.0%",
          mrr: "₹0",
          arr: "₹0",
        },
        funnel: EMPTY_ANALYTICS.funnel,
        channelPerformance: EMPTY_ANALYTICS.channelPerformance,
        recentActivity: activities,
      },
    });
  } catch (error) {
    console.warn("MongoDB offline in GET /api/analytics/overview, returning empty analytics:", error);
    return NextResponse.json({
      success: true,
      data: EMPTY_ANALYTICS,
    });
  }
}
