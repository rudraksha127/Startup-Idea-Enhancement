import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Invoice } from "@/models/Invoice";
import mongoose from "mongoose";

// Idempotency cache for processed webhook event IDs
const processedWebhookEvents = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, type, data } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Invalid webhook payload: missing event type" },
        { status: 400 }
      );
    }

    if (id && processedWebhookEvents.has(id)) {
      return NextResponse.json({
        received: true,
        eventId: id,
        status: "DUPLICATE_IGNORED",
        message: `Event ${id} already processed. Skipping.`,
      });
    }

    const payloadObj = data?.object || {};
    const invoiceId = payloadObj.metadata?.invoiceId || payloadObj.invoice_id || payloadObj.id;
    let invoiceUpdated = false;
    let newStatus = "";

    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1 && invoiceId) {
        if (type === "checkout.session.completed" || type === "invoice.paid" || type === "invoice.payment_succeeded") {
          newStatus = "Paid";
          await Invoice.findOneAndUpdate(
            {
              $or: [
                { _id: mongoose.isValidObjectId(invoiceId) ? new mongoose.Types.ObjectId(invoiceId) : null },
                { invoiceNumber: invoiceId },
              ].filter(Boolean),
            },
            {
              $set: {
                status: "Paid",
                paidAt: new Date(),
                paymentMethod: "Stripe Webhook",
              },
            }
          );
          invoiceUpdated = true;
        } else if (type === "invoice.payment_failed") {
          newStatus = "Overdue";
          await Invoice.findOneAndUpdate(
            {
              $or: [
                { _id: mongoose.isValidObjectId(invoiceId) ? new mongoose.Types.ObjectId(invoiceId) : null },
                { invoiceNumber: invoiceId },
              ].filter(Boolean),
            },
            { $set: { status: "Overdue" } }
          );
          invoiceUpdated = true;
        }
      }
    } catch {
      // Safe fallback
    }

    if (id) {
      processedWebhookEvents.add(id);
    }

    return NextResponse.json({
      received: true,
      eventId: id || "evt_mock_" + Date.now().toString(36),
      eventType: type,
      newStatus: newStatus || "Acknowledged",
      invoiceUpdated,
      processedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}

