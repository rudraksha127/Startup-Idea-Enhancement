import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Project } from "@/models/Project";
import { requireApiAuth, forwardAuthHeaders } from "@/lib/auth/jwt";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://agencyos-api-50046975560.development.catalystappsail.in/api/v1";

  // 1. Try Zoho Catalyst AppSail backend first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const backendRes = await fetch(`${backendApiUrl}/projects`, {
      headers: forwardAuthHeaders(req),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch (backendErr) {
    console.warn("AppSail projects fetch fallback:", backendErr);
  }

  try {
    await connectToDatabase();
    if (mongoose.connection.readyState !== 1 || !mongoose.isValidObjectId(auth.session.organizationId)) {
      return NextResponse.json({ projects: [] });
    }

    const projects = await Project.find({ organizationId: auth.session.organizationId }).sort({ createdAt: -1 });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Projects API error:", error);
    return NextResponse.json({ projects: [] });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const orgId = auth.session.organizationId;

    if (!mongoose.isValidObjectId(orgId)) {
      return NextResponse.json({ error: "Organization persistence unavailable" }, { status: 503 });
    }

    const body = await req.json();
    const { title, clientName, budget, deadline, scope, features } = body;

    if (!title || !clientName) {
      return NextResponse.json({ error: "Title and client name are required" }, { status: 400 });
    }

    const project = await Project.create({
      organizationId: orgId,
      title,
      clientName,
      budget: budget || 45000,
      deadline: deadline || "30 days",
      scope: scope || "Full website redesign with responsive layout.",
      features: features || ["Responsive Design", "Contact Form", "SEO Optimization"],
      status: "Discovery",
      tasks: [
        { title: "Define technical requirements", completed: true, assignedTo: "Tech Lead" },
        { title: "Draft wireframe and design system", completed: false, assignedTo: "Design Team" },
        { title: "Build responsive frontend", completed: false, assignedTo: "Full-Stack Dev" },
      ],
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

