import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { LeadNote } from "@/models/LeadNote";
import { Organization } from "@/models/Organization";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET() {
  const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://agencyos-api-50046975560.development.catalystappsail.in/api/v1";

  // 1. Try Zoho Catalyst AppSail backend first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const backendRes = await fetch(`${backendApiUrl}/dashboard/activities`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data && Array.isArray(data.activities)) {
        return NextResponse.json(data, {
          headers: {
            "Cache-Control": "public, s-maxage=15, stale-while-revalidate=59",
          },
        });
      }
    }
  } catch (backendErr) {
    console.warn("Backend activities fetch fallback to local DB:", backendErr);
  }

  try {
    await connectToDatabase();
    const session = await getCurrentUser();

    let orgId = session?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    const defaultActivities = [
      { id: "act-1", type: "search", title: "New lead found", detail: "Glow Beauty Salon — New Delhi", time: "2m ago", icon: "search" },
      { id: "act-2", type: "mail", title: "Email sent", detail: "To: hello@fitzonegym.in", time: "5m ago", icon: "mail" },
      { id: "act-3", type: "reply", title: "Client replied", detail: "The Urban Kitchen", time: "12m ago", icon: "reply" },
      { id: "act-4", type: "project", title: "New project created", detail: "Hotel Grand Plaza — Website", time: "18m ago", icon: "folder" },
      { id: "act-5", type: "ai", title: "AI agent completed research", detail: "City Care Clinic", time: "25m ago", icon: "settings" },
      { id: "act-6", type: "meeting", title: "Meeting scheduled", detail: "Style Fashion Store", time: "32m ago", icon: "calendar" },
    ];

    if (!orgId) {
      return NextResponse.json({ activities: defaultActivities });
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
        : defaultActivities,
    });
  } catch (error) {
    console.warn("Dashboard activity fallback to default activities:", error);
    const defaultActivities = [
      { id: "act-1", type: "search", title: "New lead found", detail: "Glow Beauty Salon — New Delhi", time: "2m ago", icon: "search" },
      { id: "act-2", type: "mail", title: "Email sent", detail: "To: hello@fitzonegym.in", time: "5m ago", icon: "mail" },
      { id: "act-3", type: "reply", title: "Client replied", detail: "The Urban Kitchen", time: "12m ago", icon: "reply" },
      { id: "act-4", type: "project", title: "New project created", detail: "Hotel Grand Plaza — Website", time: "18m ago", icon: "folder" },
      { id: "act-5", type: "ai", title: "AI agent completed research", detail: "City Care Clinic", time: "25m ago", icon: "settings" },
      { id: "act-6", type: "meeting", title: "Meeting scheduled", detail: "Style Fashion Store", time: "32m ago", icon: "calendar" },
    ];
    return NextResponse.json({ activities: defaultActivities });
  }
}

