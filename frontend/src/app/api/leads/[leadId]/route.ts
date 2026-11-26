import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { requireApiAuth } from "@/lib/auth/jwt";
import { DEFAULT_LEADS } from "@/lib/data/default-leads";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ leadId: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  const { leadId } = await context.params;
  try {
    await connectToDatabase();
    const orgId = auth.session.organizationId;

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(orgId)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = { organizationId: orgId };

      if (mongoose.Types.ObjectId.isValid(leadId)) {
        query.$or = [{ _id: leadId }, { slug: leadId }];
      } else {
        query.slug = leadId;
      }

      const lead = await Lead.findOne(query);
      if (lead) {
        return NextResponse.json({ lead });
      }
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Fallback: check DEFAULT_LEADS when DB is offline
    const fallbackLead = DEFAULT_LEADS.find(
      (l) =>
        l.slug === leadId ||
        l.slug.toLowerCase() === leadId.toLowerCase() ||
        (l as any)._id === leadId
    );

    if (fallbackLead) {
      return NextResponse.json({ lead: { ...fallbackLead, _id: leadId }, isSampleFallback: true });
    }

    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  } catch (error) {
    console.warn("MongoDB error in GET /api/leads/[leadId]:", error);
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  const { leadId } = await context.params;
  try {
    await connectToDatabase();
    const orgId = auth.session.organizationId;

    const updates = await req.json();

    if (updates.status === "Contacted" && !updates.lastContactedAt) {
      const today = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      updates.lastContactedAt = today;
    }

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(orgId)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = { organizationId: orgId };

      if (mongoose.Types.ObjectId.isValid(leadId)) {
        query.$or = [{ _id: leadId }, { slug: leadId }];
      } else {
        query.slug = leadId;
      }

      const lead = await Lead.findOneAndUpdate(query, { $set: updates }, { new: true });
      if (lead) {
        return NextResponse.json({ success: true, lead });
      }
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const fallbackLead = DEFAULT_LEADS.find((l) => l.slug === leadId || (l as any)._id === leadId);
    return NextResponse.json({
      success: true,
      lead: fallbackLead ? { ...fallbackLead, ...updates, _id: leadId } : { _id: leadId, ...updates },
    });
  } catch (error) {
    console.error("Lead update error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  const { leadId } = await context.params;
  try {
    await connectToDatabase();
    const orgId = auth.session.organizationId;

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(orgId)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = { organizationId: orgId };

      if (mongoose.Types.ObjectId.isValid(leadId)) {
        query.$or = [{ _id: leadId }, { slug: leadId }];
      } else {
        query.slug = leadId;
      }

      const deleted = await Lead.findOneAndDelete(query);
      if (!deleted) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true, message: "Lead removed" });
  } catch (error) {
    console.error("Lead deletion error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
