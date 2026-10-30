import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { AgentConfig } from "@/models/AgentConfig";
import { Organization } from "@/models/Organization";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    let org = await Organization.findOne({ slug: "agencyos-demo" });
    if (!org) org = await Organization.findOne();

    const agent = await AgentConfig.findById(id);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    // Increment processed count and update lastRunAt
    agent.processedToday = (agent.processedToday || 0) + 1;
    agent.lastRunAt = new Date();
    await agent.save();

    return NextResponse.json({
      success: true,
      data: agent,
      message: `Agent ${agent.name} executed successfully. Target progress: ${agent.processedToday}/${agent.dailyTarget}`,
      runLog: {
        timestamp: new Date().toISOString(),
        durationMs: 420,
        tokensUsed: 650,
        status: "Success",
      },
    });
  } catch (error) {
    console.error("Error running agent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to run agent" },
      { status: 500 }
    );
  }
}

