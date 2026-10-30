import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Invoice } from "@/models/Invoice";
import { Organization } from "@/models/Organization";
import mongoose from "mongoose";

const DEFAULT_INVOICES = [
  { invoiceNumber: "INV-2024-028", clientName: "The Urban Kitchen", projectTitle: "Website Redesign & SEO Setup", amount: 65000, currency: "INR", status: "Paid", dueDate: "28 Mar 2026", paymentMethod: "Bank Transfer" },
  { invoiceNumber: "INV-2024-027", clientName: "Spice Junction Bistro", projectTitle: "WhatsApp Bot & Online Ordering", amount: 48000, currency: "INR", status: "Pending", dueDate: "15 Apr 2026", paymentMethod: "UPI / Razorpay" },
  { invoiceNumber: "INV-2024-026", clientName: "CarePoint Dental Clinic", projectTitle: "Clinic Appointment Portal", amount: 75000, currency: "INR", status: "Paid", dueDate: "10 Mar 2026", paymentMethod: "Credit Card" },
  { invoiceNumber: "INV-2024-025", clientName: "Iron & Pulse Fitness Club", projectTitle: "Gym Member Portal & App", amount: 92000, currency: "INR", status: "Overdue", dueDate: "25 Feb 2026", paymentMethod: "Bank Transfer" },
  { invoiceNumber: "INV-2024-024", clientName: "Grand Plaza Luxury Hotel", projectTitle: "Direct Booking Engine & CMS", amount: 125000, currency: "INR", status: "Paid", dueDate: "20 Feb 2026", paymentMethod: "Wire Transfer" },
  { invoiceNumber: "INV-2024-023", clientName: "Luxe Glow Salon & Spa", projectTitle: "Stylist Slot Booking System", amount: 42000, currency: "INR", status: "Draft", dueDate: "30 Apr 2026", paymentMethod: "Bank Transfer" },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1) {
        let org = await Organization.findOne({ slug: "agencyos-demo" });
        if (!org) org = await Organization.findOne();
        if (org) {
          const count = await Invoice.countDocuments({ organizationId: org._id });
          if (count === 0) {
            await Invoice.insertMany(
              DEFAULT_INVOICES.map((i) => ({ ...i, organizationId: org._id }))
            );
          }
          const query: any = { organizationId: org._id };
          if (status && status !== "All") {
            query.status = status;
          }
          const invoices = await Invoice.find(query).sort({ createdAt: -1 }).lean();
          return NextResponse.json({ success: true, invoices });
        }
      }
    } catch {
      // Offline fallback
    }

    let filtered = [...DEFAULT_INVOICES];
    if (status && status !== "All") {
      filtered = filtered.filter((i) => i.status.toLowerCase() === status.toLowerCase());
    }
    return NextResponse.json({
      success: true,
      invoices: filtered.map((i, idx) => ({ _id: (idx + 1).toString(), ...i })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1) {
        let org = await Organization.findOne({ slug: "agencyos-demo" });
        if (!org) org = await Organization.findOne();
        if (org) {
          const invoice = await Invoice.create({
            ...body,
            organizationId: org._id,
            invoiceNumber,
            currency: "INR",
            status: body.status || "Pending",
          });
          return NextResponse.json({ success: true, invoice }, { status: 201 });
        }
      }
    } catch {
      // Offline fallback
    }

    return NextResponse.json(
      {
        success: true,
        invoice: {
          _id: "inv-" + Date.now().toString(36),
          invoiceNumber,
          ...body,
          currency: "INR",
          status: body.status || "Pending",
          createdAt: new Date(),
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

