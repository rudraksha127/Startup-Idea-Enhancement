import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      uptime: process.uptime(),
      version: "0.1.0",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: (error as Error).message,
      },
      { status: 503 }
    );
  }
}

