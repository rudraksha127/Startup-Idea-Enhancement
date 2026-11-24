import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { AgentConfig } from "@/models/AgentConfig";
import { Organization } from "@/models/Organization";
import { getCurrentUser } from "@/lib/auth/jwt";
import mongoose from "mongoose";

/**
 * M0 subtraction: this route no longer returns a canonical catalogue with
 * invented `processedToday` counts, and it no longer seeds "Active" agents.
 * If the database is unavailable it fails closed.
 */
export async function GET() {
  try {
    await connectToDatabase();

    if (mongoose.connection.readyState !== 1) {
      return NextResponse.json(
        {
          agents: [],
          error: "database_unavailable",
          message: "The database is not reachable. No agents were loaded.",
        },
        { status: 503 }
      );
    }

    const session = await getCurrentUser();
    let orgId = session?.organizationId || null;

    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString() || null;
    }

    if (!orgId) {
      return NextResponse.json(
        {
          agents: [],
          error: "organization_unavailable",
          message: "No organization is available. No agents were loaded.",
        },
        { status: 503 }
      );
    }

    const agents = await AgentConfig.find({ organizationId: orgId });
    return NextResponse.json({ agents });
  } catch (error: any) {
    console.error("Agents API error:", error);
    return NextResponse.json(
      {
        agents: [],
        error: "database_unavailable",
        message: "The database is not reachable. No agents were loaded.",
      },
      { status: 503 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, dailyTarget } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "invalid_id" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    if (mongoose.connection.readyState !== 1) {
      return NextResponse.json(
        { success: false, error: "database_unavailable" },
        { status: 503 }
      );
    }

    const agent = await AgentConfig.findByIdAndUpdate(
      id,
      { $set: { ...(status ? { status } : {}), ...(dailyTarget ? { dailyTarget } : {}) } },
      { new: true }
    );

    if (!agent) {
      return NextResponse.json(
        { success: false, error: "agent_not_found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, agent });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update agent" },
      { status: 500 }
    );
  }
}
