import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { LeadNote } from "@/models/LeadNote";
import { requireApiAuth, forwardAuthHeaders } from "@/lib/auth/jwt";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://agencyos-api-50046975560.development.catalystappsail.in/api/v1";

  // 1. Try Zoho Catalyst AppSail backend first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const backendRes = await fetch(`${backendApiUrl}/dashboard/activities`, {
      headers: forwardAuthHeaders(req),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data && Array.isArray(data.activities)) {
        return NextResponse.json(data);
      }
    }
  } catch (backendErr) {
    console.warn("Backend activities fetch fallback to local DB:", backendErr);
  }

  try {
    await connectToDatabase();
    const orgId = auth.session.organizationId;

    if (mongoose.connection.readyState !== 1 || !mongoose.isValidObjectId(orgId)) {
      return NextResponse.json({ activities: [] });
    }

    const notes = await LeadNote.find({ organizationId: orgId })
      .populate("leadId", "businessName location")
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      activities: notes.length > 0
        ? notes.map((n) => ({
            id: n._id.toString(),
            type: n.type,
            title: n.type === "audit" ? "Website audit completed" : n.type === "call" ? "Client call completed" : "New activity log",
            detail: (n.leadId as unknown as { businessName?: string })?.businessName
              ? `${(n.leadId as unknown as { businessName?: string }).businessName}: ${n.content}`
              : n.content,
            time: "Recently",
            icon: n.type === "call" ? "calendar" : n.type === "audit" ? "file" : "message",
          }))
        : [],
    });
  } catch (error) {
    console.warn("Dashboard activity fallback to clean baseline:", error);
    return NextResponse.json({ activities: [] });
  }
}

