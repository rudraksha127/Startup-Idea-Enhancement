import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Client } from "@/models/Client";
import { Organization } from "@/models/Organization";
import { createClientSchema } from "@agencyos/validation";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://agencyos-api-50046975560.development.catalystappsail.in/api/v1";

  // 1. Try Zoho Catalyst AppSail backend first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const backendRes = await fetch(`${backendApiUrl}/clients?${searchParams.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch (backendErr) {
    console.warn("AppSail clients fetch fallback:", backendErr);
  }

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let org = await Organization.findOne({ slug: "agencyos-demo" });
    if (!org) {
      org = await Organization.findOne();
    }

    const query: Record<string, unknown> = {};
    if (org) query.organizationId = org._id;
    if (status && status !== "All") query.status = status;
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const clients = await Client.find(query).sort({ updatedAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: clients,
      total: clients.length,
    });
  } catch (error) {
    console.error("Error in GET /api/clients:", error);
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = createClientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    let org = await Organization.findOne({ slug: "agencyos-demo" });
    if (!org) {
      org = await Organization.findOne();
    }

    if (!org) {
      return NextResponse.json(
        { success: false, error: "No organization found" },
        { status: 400 }
      );
    }

    const client = await Client.create({
      ...parsed.data,
      organizationId: org._id,
      onboardedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: client,
      message: `Client ${client.businessName} successfully created`,
    });
  } catch (error) {
    console.error("Error in POST /api/clients:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create client" },
      { status: 500 }
    );
  }
}

