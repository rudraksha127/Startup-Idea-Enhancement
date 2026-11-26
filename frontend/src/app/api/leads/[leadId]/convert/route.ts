import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { requireApiAuth } from "@/lib/auth/jwt";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ leadId: string }>;
}

/**
 * Converts a Lead into a Client (and optional initial Project) within the caller's organization.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    const { leadId } = await context.params;
    const body = await req.json().catch(() => ({}));
    await connectToDatabase();
    const orgId = auth.session.organizationId;

    if (mongoose.connection.readyState !== 1 || !mongoose.isValidObjectId(orgId)) {
      return NextResponse.json({ error: "Organization persistence unavailable" }, { status: 503 });
    }

    const leadQuery: Record<string, unknown> = { organizationId: orgId };
    if (mongoose.Types.ObjectId.isValid(leadId)) {
      leadQuery.$or = [{ _id: leadId }, { slug: leadId }];
    } else {
      leadQuery.slug = leadId;
    }

    const lead = await Lead.findOne(leadQuery);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const retainerValue = typeof body?.monthlyRetainer === "number" ? body.monthlyRetainer : 25000;

    const client = await Client.create({
      organizationId: orgId,
      leadId: lead._id,
      businessName: lead.businessName,
      contactPerson: typeof body?.contactPerson === "string" && body.contactPerson.trim() ? body.contactPerson.trim() : lead.businessName,
      email: lead.email || body?.email || "pending@client.local",
      phone: lead.phone || body?.phone || "Not provided",
      address: lead.address || lead.location || "India",
      website: lead.website || "",
      status: "Onboarding",
      monthlyRetainer: retainerValue,
      totalPaid: 0,
      onboardedAt: new Date(),
    });

    let project = null;
    if (body?.createProject !== false) {
      const projectTitle =
        typeof body?.projectTitle === "string" && body.projectTitle.trim()
          ? body.projectTitle.trim()
          : `${lead.businessName} — Website Modernization`;
      project = await Project.create({
        organizationId: orgId,
        leadId: lead._id,
        title: projectTitle,
        clientName: lead.businessName,
        status: "Discovery",
        budget: retainerValue,
        scope: lead.aiInsights?.pitchAngle || "",
      });
    }

    lead.status = "Converted";
    await lead.save();

    return NextResponse.json(
      {
        success: true,
        lead,
        client,
        project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error converting lead to client:", error);
    return NextResponse.json({ error: "Failed to convert lead to client" }, { status: 500 });
  }
}
