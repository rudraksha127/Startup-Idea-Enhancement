import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { LeadNote } from "@/models/LeadNote";
import { Organization } from "@/models/Organization";
import { getCurrentUser } from "@/lib/auth/jwt";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ leadId: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { leadId } = await context.params;
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { organizationId: orgId };
    if (mongoose.Types.ObjectId.isValid(leadId)) {
      query.$or = [{ _id: leadId }, { slug: leadId }];
    } else {
      query.slug = leadId;
    }

    const lead = await Lead.findOne(query);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const notes = await LeadNote.find({ leadId: lead._id, organizationId: orgId }).sort({ createdAt: -1 });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Fetch notes error:", error);
    return NextResponse.json({ error: "Failed to fetch lead notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { leadId } = await context.params;
    await connectToDatabase();
    const session = await getCurrentUser();

    let orgId = session?.organizationId;
    let authorName = session?.name || "Rudraksh";
    let authorRole = session?.role || "Founder";

    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { organizationId: orgId };
    if (mongoose.Types.ObjectId.isValid(leadId)) {
      query.$or = [{ _id: leadId }, { slug: leadId }];
    } else {
      query.slug = leadId;
    }

    const lead = await Lead.findOne(query);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const body = await req.json();
    if (!body.content || typeof body.content !== "string") {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 });
    }

    const note = await LeadNote.create({
      leadId: lead._id,
      organizationId: orgId,
      author: authorName,
      authorRole: authorRole,
      content: body.content.trim(),
      type: body.type || "note",
    });

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

