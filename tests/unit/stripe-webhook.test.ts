import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../backend/src/app.js";
import { BillingService } from "../../backend/src/modules/billing/billing.service.js";

describe("Milestone 4: Stripe Billing Webhooks & Idempotency", () => {
  it("processes checkout.session.completed webhook and updates invoice status", async () => {
    // 1. Create a dummy test invoice first
    const invoice = await BillingService.createInvoice("507f191e810c19729de860ea", {
      clientName: "Webhook Test Client",
      clientEmail: "stripe-test@example.com",
      amount: 1500,
      currency: "USD",
      dueDate: "2026-11-30",
      lineItems: [{ description: "Autonomous Growth Retainer", quantity: 1, unitPrice: 1500, total: 1500 }],
    });

    const eventId = "evt_test_checkout_" + Date.now();
    const eventPayload = {
      id: eventId,
      type: "checkout.session.completed",
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: "cs_test_session_123",
          client_reference_id: (invoice as any)._id?.toString() || "test-id",
          customer_email: "stripe-test@example.com",
          amount_total: 150000,
          currency: "usd",
          payment_status: "paid",
        },
      },
    };

    const res = await request(app)
      .post("/api/v1/billing/webhook")
      .set("stripe-signature", "t=1700000000,v1=mock_signature_test")
      .send(eventPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.received).toBe(true);
    expect(res.body.eventId).toBe(eventId);
    expect(res.body.action).toBe("INVOICE_PAID");
  });

  it("enforces idempotency and ignores duplicate webhook event IDs", async () => {
    const duplicateEventId = "evt_idempotent_duplicate_" + Date.now();
    const eventPayload = {
      id: duplicateEventId,
      type: "invoice.paid",
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: "in_test_12345",
          amount_paid: 250000,
        },
      },
    };

    // First call
    const firstRes = await request(app)
      .post("/api/v1/billing/webhook")
      .send(eventPayload);

    expect(firstRes.status).toBe(200);
    expect(firstRes.body.received).toBe(true);

    // Second call with identical event ID
    const secondRes = await request(app)
      .post("/api/v1/billing/webhook")
      .send(eventPayload);

    expect(secondRes.status).toBe(200);
    expect(secondRes.body.success).toBe(true);
    expect(secondRes.body.duplicate).toBe(true);
    expect(secondRes.body.action).toBe("DUPLICATE_IGNORED");
  });

  it("handles payment failure webhook gracefully", async () => {
    const failedEventId = "evt_failed_charge_" + Date.now();
    const eventPayload = {
      id: failedEventId,
      type: "invoice.payment_failed",
      data: {
        object: {
          id: "in_failed_456",
          attempt_count: 3,
        },
      },
    };

    const res = await request(app)
      .post("/api/v1/billing/webhook")
      .send(eventPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.action).toBe("PAYMENT_FAILED_LOGGED");
  });
});
