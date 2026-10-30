import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Client } from "@/models/Client";
import { Organization } from "@/models/Organization";
import { createClientSchema } from "@agencyos/validation";

export async function GET(req: NextRequest) {
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
    return NextResponse.json(
      { success: false, error: "Failed to fetch clients" },
      { status: 500 }
    );
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

