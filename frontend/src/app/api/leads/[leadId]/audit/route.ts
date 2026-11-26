import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { AgentExecution } from "@/models/AgentExecution";
import { requireApiAuth } from "@/lib/auth/jwt";
import { DEFAULT_LEADS } from "@/lib/data/default-leads";
import {
  runRealWebsiteAudit,
  UnsafeAuditUrlError,
} from "@/lib/audit/website-audit-engine";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ leadId: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  const startTime = Date.now();
  try {
    const { leadId } = await context.params;
    const body = await req.json().catch(() => ({}));
    await connectToDatabase();
    const orgId = auth.session.organizationId;

    // Try finding lead in DB first scoped strictly to caller organization
    let lead: any = null;
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(orgId)) {
      const query: any = { organizationId: orgId };

      if (mongoose.Types.ObjectId.isValid(leadId)) {
        query.$or = [{ _id: leadId }, { slug: leadId }];
      } else {
        query.slug = leadId;
      }
      lead = await Lead.findOne(query);
    } else {
      const defaultMatch = DEFAULT_LEADS.find(
        (l) =>
          l.slug === leadId ||
          l.slug.toLowerCase() === leadId.toLowerCase() ||
          (l as any)._id === leadId
      );
      if (defaultMatch) {
        lead = { ...defaultMatch, _id: leadId };
      }
    }

    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    const targetUrl = typeof body?.url === "string" && body.url.trim() ? body.url.trim() : lead.website;
    const auditReport = await runRealWebsiteAudit({
      url: targetUrl,
      businessName: lead.businessName,
      category: lead.category,
      rating: lead.rating,
      reviewCount: lead.reviewCount,
    });

    lead.performanceScores = auditReport.performanceScores;
    lead.websiteScore = auditReport.overallScore;
    lead.opportunityScore = auditReport.opportunityScore;
    lead.websiteAudit = {
      lcp: auditReport.metrics.lcp,
      fid: auditReport.metrics.fid,
      cls: auditReport.metrics.cls,
      fcp: auditReport.metrics.fcp,
      issues: auditReport.issues,
    };
    lead.actionPlan = auditReport.actionPlan;
    lead.aiInsights = auditReport.aiInsights;
    lead.painPoints = auditReport.issues
      .filter((i) => i.type !== "passed")
      .map((i) => i.title);

    if (mongoose.connection.readyState === 1 && lead.save) {
      await lead.save();
    }

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(orgId)) {
      try {
        await AgentExecution.create({
          agentId: "audit-analyst",
          agentName: "Website Audit Agent",
          organizationId: orgId,
          triggeredBy: auth.session.userId,
          agentType: "audit",
          status: "COMPLETED",
          statusHistory: [
            { status: "RUNNING", timestamp: new Date(startTime) },
            { status: "COMPLETED", timestamp: new Date() },
          ],
          requiresApproval: false,
          inputPayload: {
            leadId: lead._id?.toString(),
            businessName: lead.businessName,
            website: auditReport.normalizedUrl || targetUrl,
            category: lead.category,
          },
          outputPayload: {
            dataMode: auditReport.dataMode,
            performanceScores: auditReport.performanceScores,
            opportunityScore: auditReport.opportunityScore,
            issuesCount: auditReport.issues.length,
            detectedTech: auditReport.detectedTech,
          },
          tokensUsed: 0,
          durationMs: Date.now() - startTime,
          costEstimatedUsd: 0,
          autonomyLevel: "Autonomous",
        });
      } catch (logErr) {
        console.warn("Failed to log agent execution to MongoDB:", logErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Live website audit completed (${auditReport.dataMode}) for ${lead.businessName}`,
      dataMode: auditReport.dataMode,
      report: auditReport,
      lead,
      executionMetrics: {
        durationMs: Date.now() - startTime,
        agent: "audit-analyst",
      },
    });
  } catch (error) {
    if (error instanceof UnsafeAuditUrlError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error("Error executing lead audit:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute live lead audit" },
      { status: 500 }
    );
  }
}

