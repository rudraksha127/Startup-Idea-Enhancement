import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    try {
      await connectToDatabase();
      const user = await User.findById(session.userId).select("-passwordHash");
      const organization = await Organization.findById(session.organizationId);

      if (user) {
        return NextResponse.json({
          authenticated: true,
          user,
          organization,
        });
      }
    } catch {
      // Database offline, use session token data
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
        avatarInitials: session.name ? session.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "RU",
      },
      organization: {
        id: session.organizationId,
        name: "AgencyOS Workspace",
        slug: "agencyos-demo",
        plan: "Pro",
        credits: 250,
      },
    });
  } catch (error) {
    console.error("Auth Me API error:", error);
    return NextResponse.json({ authenticated: false, error: "Session validation failed" }, { status: 500 });
  }
}
