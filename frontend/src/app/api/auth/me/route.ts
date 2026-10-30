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

    await connectToDatabase();
    const user = await User.findById(session.userId).select("-passwordHash");
    const organization = await Organization.findById(session.organizationId);

    return NextResponse.json({
      authenticated: true,
      user,
      organization,
    });
  } catch (error) {
    console.error("Auth Me API error:", error);
    return NextResponse.json({ authenticated: false, error: "Session validation failed" }, { status: 500 });
  }
}

