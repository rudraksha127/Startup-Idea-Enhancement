import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Campaign } from "@/models/Campaign";
import { requireApiAuth } from "@/lib/auth/jwt";
import { updateCampaignSchema } from "@agencyos/validation";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const parsed = updateCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(auth.session.organizationId)) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    const updated = await Campaign.findOneAndUpdate(
      { _id: id, organizationId: auth.session.organizationId },
      parsed.data,
      { new: true }
    );
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Campaign updated to ${updated.status}`,
    });
  } catch (error) {
    console.error("Error in PATCH /api/outreach/campaigns/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

