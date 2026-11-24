import { NextResponse } from "next/server";

/**
 * M0 subtraction: the agent runtime does not exist yet.
 *
 * This route previously returned a hardcoded `CANONICAL_OUTPUTS` payload,
 * synthesised phone numbers, and invented token/duration figures. It now fails
 * closed. A real implementation lands with the agent runtime (M3–M7).
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "agent_runtime_not_available",
      message:
        "Agent execution is not implemented. No run was performed and no output was produced.",
    },
    { status: 501 }
  );
}
