import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { OutreachMessage } from "@/models/OutreachMessage";
import { Organization } from "@/models/Organization";
import { Lead } from "@/models/Lead";

export async function POST(req: NextRequest) {
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

    let org = await Organization.findOne({ slug: "agencyos-demo" });
    if (!org) org = await Organization.findOne();

    // Verify or find a sample lead if not provided
    let targetLeadId = leadId;
    if (!targetLeadId && org) {
      const sampleLead = await Lead.findOne({ organizationId: org._id });
      if (sampleLead) targetLeadId = sampleLead._id;
    }

    // Save outbound message event with dry-run status
    if (org && targetLeadId) {
      await OutreachMessage.create({
        organizationId: org._id,
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

