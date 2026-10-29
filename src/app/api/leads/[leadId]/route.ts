import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
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

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Lead detail error:", error);
    return NextResponse.json({ error: "Failed to fetch lead details" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
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

    const updates = await req.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { organizationId: orgId };
    if (mongoose.Types.ObjectId.isValid(leadId)) {
      query.$or = [{ _id: leadId }, { slug: leadId }];
    } else {
      query.slug = leadId;
    }

    // If status is updated to Contacted, set lastContactedAt
    if (updates.status === "Contacted" && !updates.lastContactedAt) {
      const today = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      updates.lastContactedAt = today;
    }

    const lead = await Lead.findOneAndUpdate(query, { $set: updates }, { new: true });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("Lead update error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
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

    const deleted = await Lead.findOneAndDelete(query);
    if (!deleted) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Lead removed" });
  } catch (error) {
    console.error("Lead deletion error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}

