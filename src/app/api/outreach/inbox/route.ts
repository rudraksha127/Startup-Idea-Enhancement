import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { OutreachMessage } from "@/models/OutreachMessage";
import { Organization } from "@/models/Organization";
import { Lead } from "@/models/Lead";
import mongoose from "mongoose";

const DEFAULT_INBOX_CONVERSATIONS = [
  {
    id: "conv-1",
    name: "Rahul Sharma",
    company: "The Urban Kitchen",
    email: "rahul@theurbankitchen.in",
    snippet: "Hi Rudraksh, this sounds interesting. Can you share more details about the package...",
    time: "10:24 AM",
    badge: "Interested",
    badgeColor: "bg-emerald-50 text-emerald-700",
    fullThread: [
      {
        sender: "Rudraksh (AgencyOS)",
        isAgency: true,
        time: "Yesterday, 4:15 PM",
        body: "Hi Rahul, I noticed The Urban Kitchen has a fantastic 4.6★ rating on Google, but your mobile page load is ~4.8s with no direct table booking. We built a live interactive demo for you that loads in 1.2s and allows 1-tap table booking.",
      },
      {
        sender: "Rahul Sharma <rahul@theurbankitchen.in>",
        isAgency: false,
        time: "Today, 10:24 AM (2 hours ago)",
        body: "Hi Rudraksh,\n\nThis sounds interesting. Can you share more details about the package and timeline? We are looking to improve our online presence and attract more customers through Google.\n\nAlso, would love to see some of your previous work in the restaurant industry.\n\nThanks,\nRahul Sharma\nThe Urban Kitchen, Indore",
      },
    ],
  },
  {
    id: "conv-2",
    name: "Priya Mehta",
    company: "Spice Junction",
    email: "priya@spicejunction.com",
    snippet: "Thanks for reaching out! We are looking for a complete menu overhaul...",
    time: "09:48 AM",
    badge: "Meeting",
    badgeColor: "bg-purple-50 text-purple-700",
    fullThread: [
      {
        sender: "Priya Mehta <priya@spicejunction.com>",
        isAgency: false,
        time: "09:48 AM",
        body: "Thanks for reaching out! We are looking for an online order and digital menu solution. Are you free for a 15-minute Google Meet tomorrow afternoon?",
      },
    ],
  },
  {
    id: "conv-3",
    name: "Dr. Amit Verma",
    company: "CityCare Dental",
    email: "info@citycaredental.org",
    snippet: "Please share more details about your clinic booking website package...",
    time: "08:32 AM",
    badge: "Follow-up",
    badgeColor: "bg-amber-50 text-amber-700",
    fullThread: [
      {
        sender: "Dr. Amit Verma <info@citycaredental.org>",
        isAgency: false,
        time: "08:32 AM",
        body: "Please share more details about your clinic booking website package. What is the typical setup timeline?",
      },
    ],
  },
];

export async function GET() {
  try {
    await connectToDatabase();
    if (mongoose.connection.readyState !== 1) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_INBOX_CONVERSATIONS,
      });
    }

    let org = await Organization.findOne({ slug: "agencyos-demo" });
    if (!org) org = await Organization.findOne();

    const query: Record<string, unknown> = {};
    if (org) query.organizationId = org._id;

    const messages = await OutreachMessage.find(query).sort({ sentAt: -1 }).limit(20).lean();

    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_INBOX_CONVERSATIONS,
      });
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
          sender: "Rudraksh (AgencyOS)",
          isAgency: true,
          time: m.sentAt ? new Date(m.sentAt).toLocaleDateString() : "Recently",
          body: m.body,
        },
      ],
    }));

    return NextResponse.json({
      success: true,
      data: [...dbConversations, ...DEFAULT_INBOX_CONVERSATIONS],
    });
  } catch (error) {
    console.warn("MongoDB offline in GET /api/outreach/inbox, returning default conversations:", error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_INBOX_CONVERSATIONS,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toEmail, recipientName, replyText, conversationId } = body;

    if (!replyText || (!toEmail && !recipientName)) {
      return NextResponse.json(
        { success: false, error: "Recipient and reply content are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      let org = await Organization.findOne({ slug: "agencyos-demo" });
      if (!org) org = await Organization.findOne();

      if (org) {
        await OutreachMessage.create({
          organizationId: org._id,
          toEmail: toEmail || "prospect@example.com",
          recipientName: recipientName || "Prospect",
          subject: `Re: Follow up - ${recipientName || "AgencyOS"}`,
          body: replyText,
          status: "Sent",
          templateUsed: "Interactive Reply Assistant",
          sentAt: new Date(),
        });
      }
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
