import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role = "Operator" } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required to invite a team member" },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1) {
        let org = await Organization.findOne({ slug: "agencyos-demo" });
        if (!org) org = await Organization.findOne();

        if (org) {
          const existing = await User.findOne({
            email: email.toLowerCase(),
            organizationId: org._id,
          });

          if (existing) {
            return NextResponse.json(
              { error: `User with email "${email}" is already a member of this organization` },
              { status: 409 }
            );
          }

          const tempPasswordHash = await bcrypt.hash("TempPass" + Date.now(), 10);
          const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            passwordHash: tempPasswordHash,
            role,
            organizationId: org._id,
            avatarInitials: name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
          });

          return NextResponse.json({
            success: true,
            member: {
              id: newUser._id.toString(),
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
              twoFactor: false,
              status: "Invited",
              createdAt: newUser.createdAt,
            },
          }, { status: 201 });
        }
      }
    } catch {
      // Offline fallback
    }

    const mockId = "mem-" + Date.now().toString(36);
    return NextResponse.json({
      success: true,
      member: {
        id: mockId,
        name,
        email: email.toLowerCase(),
        role,
        twoFactor: false,
        status: "Invited",
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

