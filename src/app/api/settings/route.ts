import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Organization } from "@/models/Organization";
import { User } from "@/models/User";
import { updateSettingsSchema } from "@agencyos/validation";

export async function GET() {
  try {
    await connectToDatabase();
    let org = await Organization.findOne({ slug: "agencyos-demo" });
    if (!org) org = await Organization.findOne();

    const user = await User.findOne({ email: "founder@agencyos.com" });

    return NextResponse.json({
      success: true,
      data: {
        organizationName: org?.name || "AgencyOS Workspace",
        slug: org?.slug || "agencyos-demo",
        plan: org?.plan || "Pro",
        credits: org?.credits || 250,
        currency: "INR (₹)",
        timezone: "Asia/Kolkata (IST)",
        founderName: user?.name || "Rudraksh",
        founderEmail: user?.email || "founder@agencyos.com",
        geminiConfigured: true,
        openAiConfigured: true,
        resendConfigured: false,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    let org = await Organization.findOne({ slug: "agencyos-demo" });
    if (!org) org = await Organization.findOne();

    if (org && parsed.data.organizationName) {
      org.name = parsed.data.organizationName;
      await org.save();
    }

    return NextResponse.json({
      success: true,
      message: "Workspace settings updated successfully",
      data: parsed.data,
    });
  } catch (error) {
    console.error("Error in PATCH /api/settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

