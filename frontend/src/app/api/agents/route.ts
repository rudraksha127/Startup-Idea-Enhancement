import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { AgentConfig } from "@/models/AgentConfig";
import { requireApiAuth } from "@/lib/auth/jwt";
import mongoose from "mongoose";

const CANONICAL_13_AGENTS = [
  { agentId: "market-research", name: "Market Research Agent", category: "Research", role: "Analyzes industry demand, competitor landscape, and regional market saturation.", dailyTarget: 50, confidenceThreshold: 85, model: "gemini-2.0-flash", autonomy: "Autonomous" },
  { agentId: "prospect-discovery", name: "Prospect Discovery Agent", category: "Discovery", role: "Discovers prospective local business leads matching agency ICP criteria.", dailyTarget: 100, confidenceThreshold: 90, model: "gemini-2.0-flash", autonomy: "Semi-Autonomous" },
  { agentId: "lead-enrichment", name: "Lead Enrichment & Verification Agent", category: "Verification", role: "Enriches prospect profiles with verified contact points and freshness flags.", dailyTarget: 60, confidenceThreshold: 88, model: "gemini-2.0-flash", autonomy: "Autonomous" },
  { agentId: "website-audit", name: "Website Audit Agent", category: "Audit", role: "Generates technical performance, SEO, mobile UX, and conversion barrier reports.", dailyTarget: 40, confidenceThreshold: 92, model: "gemini-2.0-flash", autonomy: "Autonomous" },
  { agentId: "lead-qualification", name: "Lead Qualification & Scoring Agent", category: "Qualification", role: "Calculates explainable 0-100 opportunity score and tier qualification.", dailyTarget: 50, confidenceThreshold: 85, model: "gemini-2.0-flash", autonomy: "Autonomous" },
  { agentId: "outreach-strategy", name: "Outreach Strategy Agent", category: "Outreach", role: "Creates multi-step email/WhatsApp personalized pitch drafts with dry-run safety.", dailyTarget: 30, confidenceThreshold: 88, model: "gemini-2.0-flash", autonomy: "Supervised" },
  { agentId: "reply-classification", name: "Reply Classification Agent", category: "CRM", role: "Classifies prospect responses, flags opt-outs, and routes meeting requests.", dailyTarget: 25, confidenceThreshold: 94, model: "gemini-2.0-flash", autonomy: "Autonomous" },
  { agentId: "meeting-coordination", name: "Meeting Coordination Agent", category: "Operations", role: "Manages agency calendar synchronization and discovery call bookings.", dailyTarget: 20, confidenceThreshold: 90, model: "gemini-2.0-flash", autonomy: "Supervised" },
  { agentId: "proposal-scope", name: "Proposal & Scope Agent", category: "Sales", role: "Drafts comprehensive commercial proposals, SOWs, and milestones.", dailyTarget: 15, confidenceThreshold: 92, model: "gemini-2.0-flash", autonomy: "Supervised" },
  { agentId: "client-onboarding", name: "Client Onboarding Agent", category: "Operations", role: "Accelerates client transition from won proposal to active project records.", dailyTarget: 15, confidenceThreshold: 85, model: "gemini-2.0-flash", autonomy: "Semi-Autonomous" },
  { agentId: "project-planning", name: "Project Planning Agent", category: "Delivery", role: "Structures agile delivery sprints, milestones, and task dependencies.", dailyTarget: 20, confidenceThreshold: 88, model: "gemini-2.0-flash", autonomy: "Autonomous" },
  { agentId: "website-qa", name: "Website QA & Delivery Agent", category: "QA", role: "Ensures zero broken links, accessibility AA compliance, and staging release gates.", dailyTarget: 15, confidenceThreshold: 95, model: "gemini-2.0-flash", autonomy: "Supervised" },
  { agentId: "maintenance-monitoring", name: "Maintenance & Monitoring Agent", category: "Reliability", role: "24/7 client uptime watchdog, SSL expiry alerts, and renewal tracking.", dailyTarget: 100, confidenceThreshold: 98, model: "gemini-2.0-flash", autonomy: "Autonomous" },
];

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    let isConnected = false;
    const orgId = auth.session.organizationId;

    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(orgId)) {
        isConnected = true;
      }
    } catch {
      // Offline fallback
    }

    if (!isConnected) {
      return NextResponse.json({
        agents: CANONICAL_13_AGENTS.map((a, idx) => ({
          _id: (idx + 1).toString(),
          agentId: a.agentId,
          name: a.name,
          category: a.category,
          role: a.role,
          status: "Active",
          dailyTarget: a.dailyTarget,
          processedToday: Math.floor(a.dailyTarget * 0.75),
          confidenceThreshold: a.confidenceThreshold,
          model: a.model,
          autonomy: a.autonomy,
        })),
      });
    }

    let agents = await AgentConfig.find({ organizationId: orgId });
    if (agents.length === 0) {
      await AgentConfig.insertMany(
        CANONICAL_13_AGENTS.map((a) => ({
          name: a.name,
          role: a.role,
          status: "Active",
          dailyTarget: a.dailyTarget,
          processedToday: Math.floor(a.dailyTarget * 0.75),
          confidenceThreshold: a.confidenceThreshold,
          organizationId: new mongoose.Types.ObjectId(orgId!),
        }))
      );
      agents = await AgentConfig.find({ organizationId: orgId });
    }

    return NextResponse.json({ agents });
  } catch (error) {
    console.error("Agents API error:", error);
    return NextResponse.json({ agents: CANONICAL_13_AGENTS });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, dailyTarget } = body;

    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
        const agent = await AgentConfig.findByIdAndUpdate(
          id,
          { $set: { ...(status ? { status } : {}), ...(dailyTarget ? { dailyTarget } : {}) } },
          { new: true }
        );
        return NextResponse.json({ success: true, agent });
      }
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ success: true, id, status, dailyTarget });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update agent" }, { status: 500 });
  }
}
