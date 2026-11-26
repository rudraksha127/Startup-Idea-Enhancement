import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { getAuthSession, hasAdminRole, normalizeRole, VALID_ROLES } from "@/lib/auth/jwt";
import mongoose from "mongoose";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: authentication required" }, { status: 401 });
    }

    if (!hasAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Forbidden: only Organization Owners or Admins can modify member roles" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    if (!role || typeof role !== "string") {
      return NextResponse.json({ error: "Role string is required" }, { status: 400 });
    }

    const matchedRole = normalizeRole(role);
    if (!matchedRole) {
      return NextResponse.json(
        { error: `Invalid role specified. Valid roles are: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    // Only Founders/Owners can assign Founder role
    if (
      matchedRole === "Founder" &&
      !session.role.toLowerCase().includes("owner") &&
      !session.role.toLowerCase().includes("founder")
    ) {
      return NextResponse.json(
        { error: "Forbidden: only Organization Founders can appoint other Founders" },
        { status: 403 }
      );
    }

    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
        const targetUser = await User.findById(id);
        if (!targetUser) {
          return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        // Enforce multi-tenant boundary
        if (
          targetUser.organizationId &&
          session.organizationId &&
          targetUser.organizationId.toString() !== session.organizationId
        ) {
          return NextResponse.json(
            { error: "Forbidden: target member belongs to a different organization" },
            { status: 403 }
          );
        }

        targetUser.role = matchedRole;
        await targetUser.save();

        return NextResponse.json({
          success: true,
          member: {
            id: targetUser._id.toString(),
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role,
          },
        });
      }
    } catch (dbErr: any) {
      return NextResponse.json({ error: dbErr?.message || "Database update failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      member: { id, role: matchedRole, updated: true },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: authentication required" }, { status: 401 });
    }

    if (!hasAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Forbidden: only Organization Owners or Admins can remove team members" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent deleting self
    if (session.userId === id) {
      return NextResponse.json(
        { error: "Forbidden: cannot delete your own active session account" },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
        const targetUser = await User.findById(id);
        if (!targetUser) {
          return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        // Enforce multi-tenant boundary
        if (
          targetUser.organizationId &&
          session.organizationId &&
          targetUser.organizationId.toString() !== session.organizationId
        ) {
          return NextResponse.json(
            { error: "Forbidden: target member belongs to a different organization" },
            { status: 403 }
          );
        }

        await User.findByIdAndDelete(id);
      }
    } catch (dbErr: any) {
      return NextResponse.json({ error: dbErr?.message || "Database deletion failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, removedId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

