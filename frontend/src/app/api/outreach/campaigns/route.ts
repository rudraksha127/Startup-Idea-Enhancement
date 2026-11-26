import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Campaign } from "@/models/Campaign";
import { requireApiAuth } from "@/lib/auth/jwt";
import { createCampaignSchema } from "@agencyos/validation";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    if (mongoose.connection.readyState !== 1 || !mongoose.isValidObjectId(auth.session.organizationId)) {
      return NextResponse.json({ success: true, data: [], total: 0 });
    }

    const campaigns = await Campaign.find({ organizationId: auth.session.organizationId })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: campaigns,
      total: campaigns.length,
    });
  } catch (error) {
    console.error("Error in GET /api/outreach/campaigns:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = createCampaignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    if (mongoose.connection.readyState !== 1 || !mongoose.isValidObjectId(auth.session.organizationId)) {
      return NextResponse.json(
        { success: false, error: "Organization persistence unavailable" },
        { status: 503 }
      );
    }

    const campaign = await Campaign.create({
      ...parsed.data,
      organizationId: auth.session.organizationId,
      leadsTargeted: 25,
      sentCount: 0,
      openedCount: 0,
      repliedCount: 0,
      convertedCount: 0,
    });

    return NextResponse.json({
      success: true,
      data: campaign,
      message: `Campaign "${campaign.name}" created successfully`,
    });
  } catch (error) {
    console.error("Error in POST /api/outreach/campaigns:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

