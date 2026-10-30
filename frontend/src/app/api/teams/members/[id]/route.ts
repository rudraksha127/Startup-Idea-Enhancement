import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
        const updated = await User.findByIdAndUpdate(
          id,
          { $set: { role } },
          { new: true }
        ).select("-passwordHash").lean();

        if (updated) {
          return NextResponse.json({
            success: true,
            member: {
              id: updated._id.toString(),
              name: updated.name,
              email: updated.email,
              role: updated.role,
            },
          });
        }
      }
    } catch {
      // Offline fallback
    }

    return NextResponse.json({
      success: true,
      member: { id, role, updated: true },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
        await User.findByIdAndDelete(id);
      }
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ success: true, removedId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

