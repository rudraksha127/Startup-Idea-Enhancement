import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { requireApiAuth } from "@/lib/auth/jwt";
import {
  runRealWebsiteAudit,
  UnsafeAuditUrlError,
} from "@/lib/audit/website-audit-engine";
import mongoose from "mongoose";

function mapLeadToAuditItem(lead: any) {
  const scores = lead.performanceScores || {};
  const audit = lead.websiteAudit || {};
  const issues = Array.isArray(audit.issues) ? audit.issues : [];

  return {
    id: lead._id?.toString() || lead.slug,
    leadId: lead._id?.toString(),
    url: lead.website || "",
    businessName: lead.businessName || "Unknown Business",
    category: lead.category || "General",
    location: lead.location || lead.address || "—",
    overallScore: Number(lead.websiteScore ?? scores.website ?? 0),
    opportunityScore: Number(((lead.opportunityScore ?? 0) / 10).toFixed(1)),
    dataMode: audit.lcp === "Unreachable" ? "unreachable" : lead.website ? "live_html" : "no_website",
    performanceScores: {
      performance: Number(scores.performance ?? 0),
      mobile: Number(scores.mobile ?? 0),
      seo: Number(scores.seo ?? 0),
      accessibility: Number(scores.accessibility ?? 0),
      security: Number(scores.security ?? 0),
    },
    metrics: {
      lcp: audit.lcp || "Not audited",
      fcp: audit.fcp || "Not audited",
      ttfb: audit.fid || "Not audited",
      cls: audit.cls || "Not audited",
    },
    findings: issues.map((issue: any) => ({
      title: issue.title || "Audit Observation",
      severity: issue.type === "critical" ? "High" : issue.type === "warning" ? "Medium" : "Low",
      description: issue.detail || "",
      impact:
        issue.type === "critical"
          ? "Critical Technical Bottleneck"
          : issue.type === "warning"
          ? "Conversion / SEO Opportunity"
          : "Verified Healthy Signal",
    })),
    createdAt: lead.updatedAt
      ? new Date(lead.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
      : "Recorded",
  };
}

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const orgId = auth.session.organizationId;

    if (mongoose.connection.readyState !== 1 || !mongoose.isValidObjectId(orgId)) {
      return NextResponse.json({
        success: true,
        audits: [],
        persistenceMode: "degraded",
      });
    }

    const auditedLeads = await Lead.find({
      organizationId: orgId,
      $or: [
        { "websiteAudit.issues.0": { $exists: true } },
        { websiteScore: { $gt: 0 } },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      audits: auditedLeads.map(mapLeadToAuditItem),
    });
  } catch (error) {
    console.error("Error in GET /api/audits:", error);
    return NextResponse.json({ error: "Failed to load audit history" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const businessName =
      typeof body?.businessName === "string" && body.businessName.trim()
        ? body.businessName.trim()
        : url.replace(/^https?:\/\//i, "").split("/")[0] || "Target Business";
    const category = typeof body?.category === "string" ? body.category.trim() : "Local Business";
    const location = typeof body?.location === "string" ? body.location.trim() : "India";
    const leadId = typeof body?.leadId === "string" ? body.leadId.trim() : "";

    if (!url) {
      return NextResponse.json({ error: "A target website URL is required" }, { status: 400 });
    }

    const report = await runRealWebsiteAudit({
      url,
      businessName,
      category,
    });

    await connectToDatabase();
    const orgId = auth.session.organizationId;

    if (leadId && mongoose.connection.readyState === 1 && mongoose.isValidObjectId(orgId)) {
      const leadQuery: any = { organizationId: orgId };
      if (mongoose.Types.ObjectId.isValid(leadId)) {
        leadQuery.$or = [{ _id: leadId }, { slug: leadId }];
      } else {
        leadQuery.slug = leadId;
      }
      const matchedLead = await Lead.findOne(leadQuery);
      if (matchedLead) {
        matchedLead.website = report.normalizedUrl || url;
        matchedLead.performanceScores = report.performanceScores;
        matchedLead.websiteScore = report.overallScore;
        matchedLead.opportunityScore = report.opportunityScore;
        matchedLead.websiteAudit = {
          lcp: report.metrics.lcp,
          fid: report.metrics.fid,
          cls: report.metrics.cls,
          fcp: report.metrics.fcp,
          issues: report.issues,
        };
        matchedLead.actionPlan = report.actionPlan;
        matchedLead.aiInsights = report.aiInsights;
        await matchedLead.save();
      }
    }

    const auditItem = {
      id: `aud_${Date.now()}`,
      leadId: leadId || undefined,
      url: report.normalizedUrl || url,
      businessName,
      category,
      location,
      overallScore: report.overallScore,
      opportunityScore: Number((report.opportunityScore / 10).toFixed(1)),
      dataMode: report.dataMode,
      reachable: report.reachable,
      httpStatus: report.httpStatus,
      detectedTech: report.detectedTech,
      performanceScores: {
        performance: report.performanceScores.performance,
        mobile: report.performanceScores.mobile,
        seo: report.performanceScores.seo,
        accessibility: report.performanceScores.accessibility,
        security: report.performanceScores.security,
      },
      metrics: {
        lcp: report.metrics.lcp,
        fcp: report.metrics.fcp,
        ttfb: `${report.metrics.ttfbMs}ms`,
        cls: report.metrics.cls,
      },
      findings: report.issues.map((issue) => ({
        title: issue.title,
        severity: issue.type === "critical" ? "High" : issue.type === "warning" ? "Medium" : "Low",
        description: issue.detail,
        impact:
          issue.type === "critical"
            ? "Critical Technical Bottleneck"
            : issue.type === "warning"
            ? "Conversion / SEO Opportunity"
            : "Verified Healthy Signal",
      })),
      createdAt: new Date(report.auditedAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    return NextResponse.json({
      success: true,
      audit: auditItem,
      report,
    });
  } catch (error) {
    if (error instanceof UnsafeAuditUrlError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error in POST /api/audits:", error);
    return NextResponse.json({ error: "Failed to execute website audit" }, { status: 500 });
  }
}
