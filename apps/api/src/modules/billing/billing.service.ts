import mongoose from "mongoose";
import { Invoice, IInvoice } from "../../models/Invoice.js";

const DEFAULT_INVOICES = [
  { invoiceNumber: "INV-2024-028", clientName: "The Urban Kitchen", projectTitle: "Website Redesign & SEO Setup", amount: 65000, currency: "INR", status: "Paid" as const, dueDate: "28 Mar 2026", paymentMethod: "Bank Transfer" },
  { invoiceNumber: "INV-2024-027", clientName: "Spice Junction Bistro", projectTitle: "WhatsApp Bot & Online Ordering", amount: 48000, currency: "INR", status: "Pending" as const, dueDate: "15 Apr 2026", paymentMethod: "UPI / Razorpay" },
  { invoiceNumber: "INV-2024-026", clientName: "CarePoint Dental Clinic", projectTitle: "Clinic Appointment Portal", amount: 75000, currency: "INR", status: "Paid" as const, dueDate: "10 Mar 2026", paymentMethod: "Credit Card" },
  { invoiceNumber: "INV-2024-025", clientName: "Iron & Pulse Fitness Club", projectTitle: "Gym Member Portal & App", amount: 92000, currency: "INR", status: "Overdue" as const, dueDate: "25 Feb 2026", paymentMethod: "Bank Transfer" },
  { invoiceNumber: "INV-2024-024", clientName: "Grand Plaza Luxury Hotel", projectTitle: "Direct Booking Engine & CMS", amount: 125000, currency: "INR", status: "Paid" as const, dueDate: "20 Feb 2026", paymentMethod: "Wire Transfer" },
  { invoiceNumber: "INV-2024-023", clientName: "Luxe Glow Salon & Spa", projectTitle: "Stylist Slot Booking System", amount: 42000, currency: "INR", status: "Draft" as const, dueDate: "30 Apr 2026", paymentMethod: "Bank Transfer" },
];

export class BillingService {
  static async listInvoices(orgId: string, status?: string) {
    if (mongoose.connection.readyState !== 1) {
      let filtered = [...DEFAULT_INVOICES];
      if (status && status !== "All") {
        filtered = filtered.filter((i) => i.status.toLowerCase() === status.toLowerCase());
      }
      return filtered.map((i, idx) => ({ _id: (idx + 1).toString(), ...i }));
    }

    const count = await Invoice.countDocuments({ organizationId: orgId });
    if (count === 0) {
      await Invoice.insertMany(
        DEFAULT_INVOICES.map((i) => ({ ...i, organizationId: orgId }))
      );
    }

    const query: any = { organizationId: orgId };
    if (status && status !== "All") {
      query.status = status;
    }

    return await Invoice.find(query).sort({ createdAt: -1 }).lean();
  }

  static async createInvoice(orgId: string, data: {
    clientName: string;
    projectTitle: string;
    amount: number;
    dueDate: string;
    status?: "Paid" | "Pending" | "Overdue" | "Draft";
    notes?: string;
  }) {
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    if (mongoose.connection.readyState !== 1) {
      return {
        _id: "inv-" + Date.now().toString(36),
        organizationId: orgId,
        invoiceNumber,
        ...data,
        currency: "INR",
        status: data.status || "Pending",
        createdAt: new Date(),
      };
    }

    return await Invoice.create({
      ...data,
      organizationId: new mongoose.Types.ObjectId(orgId),
      invoiceNumber,
      currency: "INR",
      status: data.status || "Pending",
    });
  }

  static async updateInvoiceStatus(id: string, orgId: string, status: string) {
    if (mongoose.connection.readyState !== 1) {
      return { _id: id, status };
    }

    return await Invoice.findOneAndUpdate(
      { _id: id, organizationId: orgId },
      { $set: { status, ...(status === "Paid" ? { paidAt: new Date() } : {}) } },
      { new: true }
    );
  }

  static async getBillingMetrics(orgId: string) {
    const invoices = await this.listInvoices(orgId);
    let totalBilled = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    for (const inv of invoices as any[]) {
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
    return {
      success: true,
      invoiceId,
      gateway: "Razorpay / Stripe (Sandbox Mode)",
      paymentUrl: `https://checkout.agencyos.io/pay/${invoiceId}?sandbox=true`,
      status: "INITIATED",
    };
  }
}

