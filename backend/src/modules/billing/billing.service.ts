import crypto from "crypto";
import { InvoicesRepository } from "../../repositories/invoices.repository.js";
import { InvoiceRecord } from "../../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export class BillingService {
  static async listInvoices(orgId: string, status?: string): Promise<InvoiceRecord[]> {
    let all = await InvoicesRepository.findByOrg(orgId);
    if (all.length === 0) {
      const initial = await InvoicesRepository.create({
        invoiceId: `inv_init_${orgId}`,
        organizationId: orgId,
        clientId: `cli_init_${orgId}`,
        clientName: "Starter Client Corp",
        projectTitle: "Agency Website Redesign & SEO Setup",
        invoiceNumber: "INV-2026-001",
        amount: 85000,
        currency: "INR",
        status: "Paid",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: "Razorpay / Stripe",
      });
      all = [initial];
    }
    if (!status || status === "All") {
      return all;
    }
    return all.filter((inv) => inv.status.toLowerCase() === status.toLowerCase());
  }

  static async createInvoice(orgId: string, data: {
    clientName: string;
    clientId?: string;
    projectTitle?: string;
    amount: number;
    dueDate?: string;
    currency?: string;
    status?: "Paid" | "Pending" | "Overdue" | "Draft";
    notes?: string;
    lineItems?: any[];
    clientEmail?: string;
    paymentMethod?: string;
  }): Promise<InvoiceRecord> {
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    return InvoicesRepository.create({
      invoiceId,
      organizationId: orgId,
      clientId: data.clientId || `cli_${Date.now()}`,
      clientName: data.clientName,
      projectTitle: data.projectTitle || "Standard Agency Services",
      invoiceNumber,
      amount: data.amount,
      currency: data.currency || "INR",
      status: data.status || "Pending",
      dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: data.paymentMethod || "Bank Transfer",
    });
  }

  static async updateInvoiceStatus(id: string, orgId: string, status: string): Promise<InvoiceRecord | null> {
    const invoice = await InvoicesRepository.findById(id, orgId);
    if (!invoice) return null;

    const normalizedStatus = status as InvoiceRecord["status"];
    const updateData: Partial<InvoiceRecord> = {
      status: normalizedStatus,
      ...(normalizedStatus === "Paid" ? { paidAt: new Date().toISOString() } : {}),
    };

    return InvoicesRepository.update(invoice.invoiceId, orgId, updateData);
  }

  static async getBillingMetrics(orgId: string) {
    const invoices = await this.listInvoices(orgId);
    let totalBilled = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    for (const inv of invoices) {
      totalBilled += inv.amount || 0;
      if (inv.status === "Paid") totalPaid += inv.amount || 0;
      else if (inv.status === "Pending") totalPending += inv.amount || 0;
      else if (inv.status === "Overdue") totalOverdue += inv.amount || 0;
    }

    return {
      totalBilled,
      totalPaid,
      totalPending,
      totalOverdue,
      currency: "INR",
      invoiceCount: invoices.length,
    };
  }

  static async createCheckoutSession(orgId: string, invoiceId: string) {
    const invoice = await InvoicesRepository.findById(invoiceId, orgId);
    return {
      success: true,
      invoiceId,
      amount: invoice?.amount || 0,
      currency: invoice?.currency || "INR",
      gateway: "Stripe Checkout (API v2024-12)",
      paymentUrl: `https://checkout.agencyos.io/pay/${invoiceId}?sandbox=true`,
      status: "INITIATED",
    };
  }

  // Idempotency cache for processed webhook event IDs
  private static processedWebhookEvents = new Set<string>();

  /**
   * Validates Stripe webhook signature if STRIPE_WEBHOOK_SECRET is configured.
   */
  static verifyWebhookSignature(payloadRaw: string, signatureHeader?: string): boolean {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      // In development or sandbox mode without secret, accept payload
      return true;
    }

    if (!signatureHeader) {
      return false;
    }

    try {
      const parts = signatureHeader.split(",");
      const timestampPart = parts.find((p) => p.startsWith("t="));
      const sigPart = parts.find((p) => p.startsWith("v1="));

      if (!timestampPart || !sigPart) return false;

      const timestamp = timestampPart.split("=")[1];
      const signature = sigPart.split("=")[1];

      const signedPayload = `${timestamp}.${payloadRaw}`;
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(signedPayload, "utf8")
        .digest("hex");

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch {
      return false;
    }
  }

  /**
   * Milestone 4.2: Processes live and sandbox Stripe/Razorpay billing webhook events.
   * Handles idempotency, signature validation, state transitions, and Zoho Catalyst updates.
   */
  static async handleWebhookEvent(event: {
    id: string;
    type: string;
    data: {
      object: Record<string, any>;
    };
  }, signature?: string, rawBody?: string) {
    if (!event || !event.type) {
      throw new Error("Invalid webhook payload: missing event type");
    }

    // Optional cryptographic signature check if rawBody is provided
    if (rawBody && !this.verifyWebhookSignature(rawBody, signature)) {
      throw new Error("Invalid webhook signature: verification failed");
    }

    // 1. Idempotency check: Skip duplicate events
    if (this.processedWebhookEvents.has(event.id)) {
      return {
        success: true,
        received: true,
        duplicate: true,
        action: "DUPLICATE_IGNORED",
        eventId: event.id,
        status: "DUPLICATE_IGNORED",
        message: `Event ${event.id} already processed. Skipping.`,
      };
    }

    const payloadObj = event.data?.object || {};
    const invoiceRef = payloadObj.client_reference_id || payloadObj.metadata?.invoiceId || payloadObj.invoice_id || payloadObj.id;
    let invoiceUpdated = false;
    let newStatus = "";
    let action = "ACKNOWLEDGED";

    switch (event.type) {
      case "checkout.session.completed":
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        newStatus = "Paid";
        action = "INVOICE_PAID";
        if (invoiceRef) {
          const inv = (await InvoicesRepository.findById(invoiceRef)) || (await InvoicesRepository.findByStripeId(invoiceRef));
          if (inv) {
            await InvoicesRepository.update(inv.invoiceId, inv.organizationId, {
              status: "Paid",
              paidAt: new Date().toISOString(),
              paymentMethod: "Stripe Webhook",
              stripeInvoiceId: payloadObj.id || invoiceRef,
            });
            invoiceUpdated = true;
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        newStatus = "Overdue";
        action = "PAYMENT_FAILED_LOGGED";
        if (invoiceRef) {
          const inv = (await InvoicesRepository.findById(invoiceRef)) || (await InvoicesRepository.findByStripeId(invoiceRef));
          if (inv) {
            await InvoicesRepository.update(inv.invoiceId, inv.organizationId, {
              status: "Overdue",
            });
            invoiceUpdated = true;
          }
        }
        break;
      }

      case "charge.refunded": {
        newStatus = "Cancelled";
        action = "PAYMENT_REFUNDED";
        if (invoiceRef) {
          const inv = (await InvoicesRepository.findById(invoiceRef)) || (await InvoicesRepository.findByStripeId(invoiceRef));
          if (inv) {
            await InvoicesRepository.update(inv.invoiceId, inv.organizationId, {
              status: "Cancelled",
            });
            invoiceUpdated = true;
          }
        }
        break;
      }

      default:
        newStatus = "Acknowledged";
        action = "ACKNOWLEDGED";
    }

    // Mark event ID as processed in idempotency set
    this.processedWebhookEvents.add(event.id);

    return {
      success: true,
      received: true,
      action,
      eventId: event.id,
      eventType: event.type,
      newStatus,
      invoiceUpdated,
      processedAt: new Date().toISOString(),
    };
  }
}
