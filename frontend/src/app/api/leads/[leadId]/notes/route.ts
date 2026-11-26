import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { LeadNote } from "@/models/LeadNote";
import { requireApiAuth } from "@/lib/auth/jwt";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ leadId: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    const { leadId } = await context.params;
    await connectToDatabase();
    const orgId = auth.session.organizationId;

    if (mongoose.connection.readyState !== 1 || !mongoose.isValidObjectId(orgId)) {
      return NextResponse.json({ notes: [] });
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
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    const { leadId } = await context.params;
    await connectToDatabase();
    const orgId = auth.session.organizationId;
    const authorName = auth.session.name || "Agency Member";
    const authorRole = auth.session.role || "Member";

    if (mongoose.connection.readyState !== 1 || !mongoose.isValidObjectId(orgId)) {
      return NextResponse.json({ error: "Organization persistence unavailable" }, { status: 503 });
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

