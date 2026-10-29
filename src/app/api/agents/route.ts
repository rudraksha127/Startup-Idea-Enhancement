import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { AgentConfig } from "@/models/AgentConfig";
import { Organization } from "@/models/Organization";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getCurrentUser();

    let orgId = session?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    if (!orgId) {
      return NextResponse.json({ agents: [] });
    }

    const agents = await AgentConfig.find({ organizationId: orgId });
    return NextResponse.json({ agents });
  } catch (error) {
    console.error("Agents API error:", error);
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getCurrentUser();

    let orgId = session?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, dailyTarget } = body;

    const agent = await AgentConfig.findOneAndUpdate(
      { _id: id, organizationId: orgId },
      { $set: { ...(status ? { status } : {}), ...(dailyTarget ? { dailyTarget } : {}) } },
      { new: true }
    );

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error("Agent update error:", error);
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}

