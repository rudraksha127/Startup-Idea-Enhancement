import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import mongoose from "mongoose";

function verifyHmacOrSecret(req: NextRequest, rawBody: string, secret: string): boolean {
  const providedSecret = req.headers.get("x-n8n-secret") || req.headers.get("x-webhook-secret");
  if (providedSecret && providedSecret.length === secret.length) {
    try {
      if (crypto.timingSafeEqual(Buffer.from(providedSecret), Buffer.from(secret))) {
        return true;
      }
    } catch {
      // fall through
    }
  }

  const providedSig = req.headers.get("x-n8n-signature");
  if (providedSig) {
    const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    const cleanSig = providedSig.replace(/^sha256=/i, "");
    if (cleanSig.length === expected.length) {
      try {
        return crypto.timingSafeEqual(Buffer.from(cleanSig), Buffer.from(expected));
      } catch {
        return false;
      }
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

    if (webhookSecret && !verifyHmacOrSecret(req, rawBody, webhookSecret)) {
      return NextResponse.json({ error: "Unauthorized: invalid webhook secret or HMAC signature" }, { status: 401 });
    }
    if (!webhookSecret && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Webhook verification not configured in production" },
        { status: 503 }
      );
    }

    const body = rawBody ? JSON.parse(rawBody) : {};
    const { type, leadId, website, businessName, opportunityScore, websiteScore, auditSummary } = body;

    let updatedLead = null;
    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1) {
        const query: any = {};
        if (leadId && mongoose.isValidObjectId(leadId)) {
          query._id = new mongoose.Types.ObjectId(leadId);
        } else if (website) {
          query.website = website;
        } else if (businessName) {
          query.businessName = businessName;
        }

        if (Object.keys(query).length > 0) {
          updatedLead = await Lead.findOneAndUpdate(
            query,
            {
              $set: {
                auditDate: new Date().toISOString(),
                ...(opportunityScore !== undefined ? { opportunityScore } : {}),
                ...(websiteScore !== undefined ? { websiteScore } : {}),
                ...(auditSummary ? { auditSummary } : {}),
              },
            },
            { new: true }
          ).lean();
        }
      }
    } catch {
      // Offline fallback
    }

    return NextResponse.json({
      success: true,
      processed: true,
      persisted: Boolean(updatedLead),
      type: type || "audit-sync",
      leadId: updatedLead?._id?.toString() || leadId || null,
      opportunityScore: opportunityScore ?? updatedLead?.opportunityScore ?? null,
      syncedAt: new Date().toISOString(),
      source: "n8n-inbound-webhook",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to process n8n webhook", details: error.message },
      { status: 500 }
    );
  }
}

