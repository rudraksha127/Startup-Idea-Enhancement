import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validations/auth";
import { comparePassword, signToken, COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid credentials format", details: result.error.format() }, { status: 400 });
    }

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase();

    // 1. Try Zoho Catalyst AppSail backend API first
    const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://agencyos-api-50046975560.development.catalystappsail.in/api/v1";
    try {
      const backendRes = await fetch(`${backendApiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        const token = data.token;
        const response = NextResponse.json({
          success: true,
          user: data.user,
        });

        response.cookies.set(COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        });

        return response;
      }
    } catch (backendErr) {
      console.warn("Backend auth fetch warning, falling back to local auth:", backendErr);
    }

    // 2. Try MongoDB if available
    try {
      await connectToDatabase();
      const user = await User.findOne({ email: normalizedEmail });
      if (user) {
        const isValid = await comparePassword(password, user.passwordHash);
        if (isValid) {
          const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId.toString(),
          });

          const response = NextResponse.json({
            success: true,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatarInitials: user.avatarInitials,
            },
          });

          response.cookies.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
          });

          return response;
        }
      }
    } catch {
      // MongoDB not connected
    }

    // 3. Built-in Founder fallback credentials
    if (normalizedEmail === "founder@agencyos.com" && password === "password123") {
      const token = signToken({
        userId: "usr_founder_seed",
        email: "founder@agencyos.com",
        name: "Rudraksh",
        role: "Founder",
        organizationId: "org_agencyos_workspace",
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: "usr_founder_seed",
          name: "Rudraksh",
          email: "founder@agencyos.com",
          role: "Founder",
          avatarInitials: "RU",
        },
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
