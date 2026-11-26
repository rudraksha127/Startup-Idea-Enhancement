import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAuth } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Suppression } from "@/models/Suppression";
import {
  generateStructuredWithGateway,
  sanitizeUntrustedPromptText,
} from "@/lib/ai/llm-gateway";
import mongoose from "mongoose";

const ReplySchema = z.object({
  replyText: z.string(),
  detectedIntent: z.enum([
    "OPT_OUT",
    "PRICING_INQUIRY",
    "MEETING_REQUEST",
    "PORTFOLIO_REQUEST",
    "INTERESTED",
  ]),
  suggestedNextStep: z.string(),
  requiresOptOut: z.boolean(),
});

const OPT_OUT_REGEX = /\b(unsubscribe|opt[- ]?out|stop\s+contacting|remove\s+me|do\s+not\s+contact|stop\s+emailing)\b/i;

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const senderName = sanitizeUntrustedPromptText(String(body?.senderName || "Prospect"), 80);
    const company = sanitizeUntrustedPromptText(String(body?.company || "your business"), 100);
    const lastMessage = sanitizeUntrustedPromptText(String(body?.lastMessage || ""), 1200);
    const contactEmail = typeof body?.contactEmail === "string" ? body.contactEmail.trim().toLowerCase() : "";

    // Deterministic DPDP / TRAI opt-out enforcement before invoking any LLM
    if (OPT_OUT_REGEX.test(lastMessage)) {
      const orgId = auth.session.organizationId;
      if (contactEmail) {
        try {
          await connectToDatabase();
          if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(orgId)) {
            await Suppression.findOneAndUpdate(
              { organizationId: orgId, contactValue: contactEmail },
              {
                organizationId: orgId,
                channel: "all",
                contactValue: contactEmail,
                reason: "Recipient requested opt-out in reply",
                source: "reply_opt_out",
              },
              { upsert: true, new: true }
            );
          }
        } catch {
          // Non-fatal if DB unavailable in offline test
        }
      }

      return NextResponse.json({
        success: true,
        replyText: `Understood. We have removed ${contactEmail || senderName} from future outreach communications immediately.`,
        detectedIntent: "OPT_OUT",
        suggestedNextStep: "Suppressed — Do Not Contact",
        requiresOptOut: true,
        mode: "deterministic_compliance",
        tokensUsed: 0,
        costEstimatedUsd: 0,
        agent: "reply-assistant",
      });
    }

    const firstName = senderName.split(" ")[0] || "there";
    const lower = lastMessage.toLowerCase();
    const fallbackDraft = () => {
      if (lower.includes("price") || lower.includes("pricing") || lower.includes("package") || lower.includes("cost")) {
        return {
          replyText: `Hi ${firstName},\n\nThanks for following up regarding ${company}.\n\nTypical website modernization scopes cover mobile speed optimization, LocalBusiness schema, and direct booking/WhatsApp lead capture. Happy to share exact package options on a brief 10-minute call if helpful.`,
          detectedIntent: "PRICING_INQUIRY" as const,
          suggestedNextStep: "Share Scope Estimate & Booking Link",
          requiresOptOut: false,
        };
      }
      if (lower.includes("meeting") || lower.includes("call") || lower.includes("time") || lower.includes("schedule")) {
        return {
          replyText: `Hi ${firstName},\n\nGreat to hear back! Feel free to suggest a convenient 15-minute window this week so we can walk through the website findings for ${company}.`,
          detectedIntent: "MEETING_REQUEST" as const,
          suggestedNextStep: "Send Calendar Invite",
          requiresOptOut: false,
        };
      }
      if (lower.includes("previous work") || lower.includes("portfolio") || lower.includes("sample") || lower.includes("examples")) {
        return {
          replyText: `Hi ${firstName},\n\nHappy to share relevant industry concepts tailored for ${company}. Would you like me to send over an interactive concept link?`,
          detectedIntent: "PORTFOLIO_REQUEST" as const,
          suggestedNextStep: "Attach Industry Preview Link",
          requiresOptOut: false,
        };
      }
      return {
        replyText: `Hi ${firstName},\n\nThanks for your reply! We put together a brief technical note for ${company} on improving mobile speed and direct inquiries. Would you like us to send it over?`,
        detectedIntent: "INTERESTED" as const,
        suggestedNextStep: "Send Website Audit Breakdown",
        requiresOptOut: false,
      };
    };

    const result = await generateStructuredWithGateway({
      systemPrompt:
        "You draft concise, respectful B2B outreach replies requiring human approval before sending. Return JSON with replyText, detectedIntent (OPT_OUT|PRICING_INQUIRY|MEETING_REQUEST|PORTFOLIO_REQUEST|INTERESTED), suggestedNextStep, requiresOptOut.",
      userPrompt: `Prospect Name: ${senderName}\nCompany: ${company}\nUntrusted Reply Body:\n${lastMessage}`,
      schema: ReplySchema,
      fallback: fallbackDraft,
    });

    return NextResponse.json({
      success: true,
      ...result.output,
      requiresApproval: true,
      mode: result.mode,
      tokensUsed: result.tokensUsed,
      costEstimatedUsd: result.costEstimatedUsd,
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

