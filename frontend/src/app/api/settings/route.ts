import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Organization } from "@/models/Organization";
import { User } from "@/models/User";
import { getAuthSession, hasAdminRole } from "@/lib/auth/jwt";
import { updateSettingsSchema } from "@agencyos/validation";
import mongoose from "mongoose";

const DEFAULT_SETTINGS = {
  organizationName: "AgencyOS Headquarters",
  slug: "agencyos-demo",
  plan: "Pro",
  credits: 250,
  currency: "INR (₹)",
  timezone: "Asia/Kolkata (IST)",
  founderName: "Rudraksh",
  founderEmail: "founder@agencyos.ai",
  geminiConfigured: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("placeholder")),
  openAiConfigured: Boolean(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("placeholder")),
  resendConfigured: Boolean(process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("placeholder")),
  mapsConfigured: Boolean(process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY),
};

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: authentication required" }, { status: 401 });
    }

    await connectToDatabase();
    if (mongoose.connection.readyState !== 1) {
      return NextResponse.json({
        success: true,
        data: {
          ...DEFAULT_SETTINGS,
          founderName: session.name,
          founderEmail: session.email,
        },
      });
    }

    let org: any = null;
    if (session.organizationId && mongoose.isValidObjectId(session.organizationId)) {
      org = await Organization.findById(session.organizationId);
    }
    if (!org) {
      org = await Organization.findOne();
    }

    const user = await User.findById(session.userId);

    return NextResponse.json({
      success: true,
      data: {
        organizationName: org?.name || DEFAULT_SETTINGS.organizationName,
        slug: org?.slug || DEFAULT_SETTINGS.slug,
        plan: org?.plan || DEFAULT_SETTINGS.plan,
        credits: org?.credits || DEFAULT_SETTINGS.credits,
        currency: DEFAULT_SETTINGS.currency,
        timezone: DEFAULT_SETTINGS.timezone,
        founderName: user?.name || session.name || DEFAULT_SETTINGS.founderName,
        founderEmail: user?.email || session.email || DEFAULT_SETTINGS.founderEmail,
        geminiConfigured: DEFAULT_SETTINGS.geminiConfigured,
        openAiConfigured: DEFAULT_SETTINGS.openAiConfigured,
        resendConfigured: DEFAULT_SETTINGS.resendConfigured,
        mapsConfigured: DEFAULT_SETTINGS.mapsConfigured,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: DEFAULT_SETTINGS,
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: authentication required" }, { status: 401 });
    }

    if (!hasAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Forbidden: only Organization Owners or Admins can update settings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    if (mongoose.connection.readyState === 1 && session.organizationId) {
      if (mongoose.isValidObjectId(session.organizationId)) {
        await Organization.findByIdAndUpdate(session.organizationId, {
          $set: {
            name: parsed.data.organizationName,
            updatedAt: new Date(),
          },
        });
      }
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
