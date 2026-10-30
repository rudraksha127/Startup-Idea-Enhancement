import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { senderName = "Prospect", company = "Business", lastMessage = "", intent = "INTERESTED" } = body;

    const lower = lastMessage.toLowerCase();
    let replyText = "";
    let detectedIntent = "INTERESTED";

    if (lower.includes("price") || lower.includes("pricing") || lower.includes("package") || lower.includes("cost")) {
      detectedIntent = "PRICING_INQUIRY";
      replyText = `Hi ${senderName.split(" ")[0]},\n\nThanks for following up! 🙏\n\nFor businesses like ${company}, our complete Digital Growth package typically starts at ₹45,000 to ₹65,000 all-inclusive, which covers:\n• High-performance responsive website (loads in under 1.8s)\n• Instant online table/appointment booking\n• Local Google Maps SEO and schema integration\n• 30 days of complimentary maintenance\n\nAre you available for a quick 10-minute Google Meet tomorrow afternoon so I can walk you through the live demo we built for ${company}?`;
    } else if (lower.includes("meeting") || lower.includes("call") || lower.includes("time") || lower.includes("schedule")) {
      detectedIntent = "MEETING_REQUEST";
      replyText = `Hi ${senderName.split(" ")[0]},\n\nSounds wonderful! I'd love to connect.\n\nI have availability tomorrow at 11:30 AM or 3:00 PM IST. Alternatively, feel free to pick any slot that fits your schedule: https://cal.com/agencyos/15min\n\nLooking forward to speaking!`;
    } else if (lower.includes("previous work") || lower.includes("portfolio") || lower.includes("sample") || lower.includes("examples")) {
      detectedIntent = "PORTFOLIO_REQUEST";
      replyText = `Hi ${senderName.split(" ")[0]},\n\nGreat question! We've recently delivered high-converting websites for similar brands in your niche, such as The Imperial Diner (3.8x booking lift) and CityCare (52% mobile speed improvement).\n\nYou can explore our interactive live case studies and design system here: https://agencyos.ai/showcase\n\nWould you like me to tailor a specific blueprint for ${company}?`;
    } else {
      replyText = `Hi ${senderName.split(" ")[0]},\n\nThanks for getting back to me! 🙏\n\nWe'd love to help ${company} capture more high-intent digital customers and eliminate mobile bounce rates. I've prepared a custom interactive preview showing how your modern site would look and function.\n\nCould we jump on a brief 10-minute call this week to review the concept?`;
    }

    return NextResponse.json({
      success: true,
      replyText,
      detectedIntent,
      suggestedNextStep: detectedIntent === "MEETING_REQUEST" ? "Send Calendar Invite" : "Schedule 10m Discovery Call",
      agent: "reply-assistant",
    });
  } catch (error) {
    console.error("Error generating AI reply:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate AI reply" },
      { status: 500 }
    );
  }
}

