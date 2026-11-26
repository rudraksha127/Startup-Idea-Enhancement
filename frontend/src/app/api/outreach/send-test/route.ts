import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { OutreachMessage } from "@/models/OutreachMessage";
import { Lead } from "@/models/Lead";
import { requireApiAuth } from "@/lib/auth/jwt";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const body = await req.json();
    const { toEmail, subject, content, leadId } = body;

    if (!toEmail || !subject) {
      return NextResponse.json(
        { success: false, error: "Recipient email and subject are required" },
        { status: 400 }
      );
    }

    const orgId = auth.session.organizationId;
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(orgId)) {
      let targetLeadId = leadId;
      if (!targetLeadId) {
        const sampleLead = await Lead.findOne({ organizationId: orgId });
        if (sampleLead) targetLeadId = sampleLead._id;
      }

      if (targetLeadId) {
        await OutreachMessage.create({
          organizationId: orgId,
          leadId: targetLeadId,
          toEmail,
          recipientName: "Test Recipient",
          subject,
          body: content || "AgencyOS Outreach Preview",
          status: "Sent",
          templateUsed: "Dry-Run Simulator",
          sentAt: new Date(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      dryRun: true,
      message: `[DRY-RUN SIMULATED] Outbound email to ${toEmail} processed safely with zero external spam risk.`,
      dispatchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in POST /api/outreach/send-test:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch test outreach" },
      { status: 500 }
    );
  }
}

