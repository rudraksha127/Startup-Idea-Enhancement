import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Project } from "@/models/Project";
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
      return NextResponse.json({ projects: [] });
    }

    const projects = await Project.find({ organizationId: orgId }).sort({ createdAt: -1 });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Projects API error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

