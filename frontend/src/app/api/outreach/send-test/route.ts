import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { OutreachMessage } from "@/models/OutreachMessage";
import { Lead } from "@/models/Lead";
import { Suppression } from "@/models/Suppression";
import { requireApiAuth } from "@/lib/auth/jwt";
import { getEmailProvider } from "@/lib/providers";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const body = await req.json();
    const { toEmail, subject, content, leadId, dryRun = true } = body;

    if (!toEmail || !subject) {
      return NextResponse.json(
        { success: false, error: "Recipient email and subject are required" },
        { status: 400 }
      );
    }

    const orgId = auth.session.organizationId;
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(orgId)) {
      const suppressed = await Suppression.findOne({
        organizationId: orgId,
        contactValue: String(toEmail).toLowerCase().trim(),
      }).lean();
      if (suppressed) {
        return NextResponse.json(
          { success: false, error: "Recipient is on the organization suppression list" },
          { status: 403 }
        );
      }
    }

    const provider = getEmailProvider({ dryRun: Boolean(dryRun) });
    const delivery = await provider.sendEmail({
      to: toEmail,
      subject,
      body: content || "AgencyOS Outreach Preview",
    });

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
          status: delivery.mode === "live" ? "Sent" : "Draft",
          templateUsed: delivery.mode === "live" ? "Resend Live Test" : "Dry-Run Simulator",
          sentAt: delivery.mode === "live" ? new Date() : undefined,
        });
      }
    }

    return NextResponse.json({
      success: delivery.success,
      dryRun: delivery.mode === "mock",
      delivery,
      message:
        delivery.mode === "live"
          ? `Live email delivered to ${toEmail} (${delivery.messageId})`
          : `[DRY-RUN SIMULATED] Outbound email draft to ${toEmail} recorded safely without external dispatch.`,
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

