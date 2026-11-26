import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { OutreachMessage } from "@/models/OutreachMessage";
import { requireApiAuth } from "@/lib/auth/jwt";
import { getEmailProvider } from "@/lib/providers";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ leadId: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    const { leadId } = await context.params;
    await connectToDatabase();
    const orgId = auth.session.organizationId;

    if (mongoose.connection.readyState !== 1 || !mongoose.isValidObjectId(orgId)) {
      return NextResponse.json({ error: "Organization persistence unavailable" }, { status: 503 });
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

    const body = await req.json();
    const { toEmail, subject, body: messageBody, templateUsed } = body;

    if (!toEmail || !subject || !messageBody) {
      return NextResponse.json({ error: "Recipient email, subject, and body are required" }, { status: 400 });
    }

    const emailProvider = getEmailProvider();
    const deliveryResult = await emailProvider.sendEmail({
      to: toEmail,
      subject,
      body: messageBody,
    });

    const outreach = await OutreachMessage.create({
      organizationId: orgId,
      leadId: lead._id,
      toEmail,
      recipientName: lead.businessName,
      subject,
      body: messageBody,
      templateUsed: templateUsed || "Website Redesign Pitch",
      status: "Sent",
      sentAt: new Date(),
    });

    if (lead.status === "New") {
      lead.status = "Contacted";
      lead.lastContactedAt = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      await lead.save();
    }

    return NextResponse.json({
      success: true,
      outreach,
      delivery: deliveryResult,
      message: deliveryResult.mode === "mock" ? "Email draft recorded (mock mode active: connect Resend/SMTP to deliver live)" : "Email delivered successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Outreach API error:", error);
    return NextResponse.json({ error: "Failed to record outreach" }, { status: 500 });
  }
}

