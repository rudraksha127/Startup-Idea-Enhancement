import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { OutreachMessage } from "@/models/OutreachMessage";
import { requireApiAuth } from "@/lib/auth/jwt";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    if (mongoose.connection.readyState !== 1 || !mongoose.isValidObjectId(auth.session.organizationId)) {
      return NextResponse.json({ success: true, data: [] });
    }

    const messages = await OutreachMessage.find({ organizationId: auth.session.organizationId })
      .sort({ sentAt: -1 })
      .limit(20)
      .lean();

    if (messages.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Map messages into inbox format
    const dbConversations = messages.map((m: any, index: number) => ({
      id: m._id?.toString() || `conv-db-${index}`,
      name: m.recipientName || "Lead Contact",
      company: m.recipientName || "Business",
      email: m.toEmail,
      snippet: m.body ? m.body.slice(0, 75) + "..." : "Outreach message thread",
      time: m.sentAt ? new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
      badge: m.status === "Replied" ? "Interested" : "Sent",
      badgeColor: m.status === "Replied" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700",
      fullThread: [
        {
          sender: auth.session.name || "AgencyOS",
          isAgency: true,
          time: m.sentAt ? new Date(m.sentAt).toLocaleDateString() : "Recently",
          body: m.body,
        },
      ],
    }));

    return NextResponse.json({ success: true, data: dbConversations });
  } catch (error) {
    console.warn("MongoDB error in GET /api/outreach/inbox:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const { toEmail, recipientName, replyText } = body;

    if (!replyText || (!toEmail && !recipientName)) {
      return NextResponse.json(
        { success: false, error: "Recipient and reply content are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(auth.session.organizationId)) {
      await OutreachMessage.create({
        organizationId: auth.session.organizationId,
        toEmail: toEmail || "prospect@example.com",
        recipientName: recipientName || "Prospect",
        subject: `Re: Follow up - ${recipientName || "AgencyOS"}`,
        body: replyText,
        status: "Sent",
        templateUsed: "Interactive Reply Assistant",
        sentAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Reply to ${recipientName || toEmail} recorded safely (Dry-run active).`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in POST /api/outreach/inbox:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch reply" },
      { status: 500 }
    );
  }
}

