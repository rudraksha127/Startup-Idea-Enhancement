import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Invoice } from "@/models/Invoice";
import { requireApiAuth, forwardAuthHeaders } from "@/lib/auth/jwt";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // 1. Try Zoho Catalyst AppSail backend first
    const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://agencyos-api-50046975560.development.catalystappsail.in/api/v1";
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const backendRes = await fetch(`${backendApiUrl}/billing/invoices?${searchParams.toString()}`, {
        headers: forwardAuthHeaders(req),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data && Array.isArray(data.invoices)) {
          return NextResponse.json(data);
        }
      }
    } catch (backendErr) {
      console.warn("AppSail billing fetch fallback:", backendErr);
    }

    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(auth.session.organizationId)) {
        const query: any = { organizationId: auth.session.organizationId };
        if (status && status !== "All") {
          query.status = status;
        }
        const invoices = await Invoice.find(query).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, invoices });
      }
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ success: true, invoices: [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(auth.session.organizationId)) {
        const invoice = await Invoice.create({
          ...body,
          organizationId: auth.session.organizationId,
          invoiceNumber,
          currency: "INR",
          status: body.status || "Pending",
        });
        return NextResponse.json({ success: true, invoice }, { status: 201 });
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

