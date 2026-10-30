import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Campaign } from "@/models/Campaign";
import { Organization } from "@/models/Organization";
import { createCampaignSchema } from "@agencyos/validation";

export async function GET() {
  try {
    await connectToDatabase();
    let org = await Organization.findOne({ slug: "agencyos-demo" });
    if (!org) org = await Organization.findOne();

    const query: Record<string, unknown> = {};
    if (org) query.organizationId = org._id;

    const campaigns = await Campaign.find(query).sort({ updatedAt: -1 }).lean();

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

    let org = await Organization.findOne({ slug: "agencyos-demo" });
    if (!org) org = await Organization.findOne();

    if (!org) {
      return NextResponse.json(
        { success: false, error: "No organization found" },
        { status: 400 }
      );
    }

    const campaign = await Campaign.create({
      ...parsed.data,
      organizationId: org._id,
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

