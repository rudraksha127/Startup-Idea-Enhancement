import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { Organization } from "@/models/Organization";
import { getCurrentUser } from "@/lib/auth/jwt";

export interface SearchResultItem {
  id: string;
  type: "lead" | "client" | "project" | "business";
  title: string;
  subtitle: string;
  href: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const backendApiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://agencyos-api-50046975560.development.catalystappsail.in/api/v1";

  // 1. Try AppSail backend search first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const backendRes = await fetch(
      `${backendApiUrl}/search?q=${encodeURIComponent(q)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data && Array.isArray(data.results)) {
        return NextResponse.json(data);
      }
    }
  } catch {
    // Fall back to local database search
  }

  try {
    await connectToDatabase();
    const session = await getCurrentUser();
    let orgId = session?.organizationId;

    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    if (!orgId) {
      return NextResponse.json({ results: [] });
    }

    const regex = new RegExp(q, "i");

    const [leads, clients, projects] = await Promise.all([
      Lead.find({
        organizationId: orgId,
        $or: [
          { businessName: regex },
          { category: regex },
          { location: regex },
          { address: regex },
          { email: regex },
        ],
      })
        .limit(5)
        .select("_id businessName category location status"),
      Client.find({
        organizationId: orgId,
        $or: [{ businessName: regex }, { contactPerson: regex }, { email: regex }],
      })
        .limit(5)
        .select("_id businessName contactPerson status"),
      Project.find({
        organizationId: orgId,
        $or: [{ title: regex }, { clientName: regex }, { status: regex }, { scope: regex }],
      })
        .limit(5)
        .select("_id title clientName status"),
    ]);

    const results: SearchResultItem[] = [];

    leads.forEach((l) => {
      results.push({
        id: l._id.toString(),
        type: "lead",
        title: l.businessName || "Unnamed Lead",
        subtitle: `${l.category || "Lead"} • ${l.location || "Local"} (${l.status || "New"})`,
        href: `/leads?selected=${l._id.toString()}`,
      });
    });

    clients.forEach((c) => {
      results.push({
        id: c._id.toString(),
        type: "client",
        title: c.businessName || c.contactPerson || "Client",
        subtitle: `Client • ${c.contactPerson || c.status || "Active"}`,
        href: `/clients`,
      });
    });

    projects.forEach((p) => {
      results.push({
        id: p._id.toString(),
        type: "project",
        title: p.title || "Project",
        subtitle: `Project • ${p.clientName || "Client"} (${p.status || "In Progress"})`,
        href: `/projects`,
      });
    });

    return NextResponse.json({ results });
  } catch (err) {
    console.warn("Local search error:", err);
    return NextResponse.json({ results: [] });
  }
}
