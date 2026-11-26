import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Client } from "@/models/Client";
import { requireApiAuth } from "@/lib/auth/jwt";
import { updateClientSchema } from "@agencyos/validation";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const parsed = updateClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(auth.session.organizationId)) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const updated = await Client.findOneAndUpdate(
      { _id: id, organizationId: auth.session.organizationId },
      parsed.data,
      { new: true }
    );
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Client updated successfully",
    });
  } catch (error) {
    console.error("Error in PATCH /api/clients/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update client" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(auth.session.organizationId)) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const deleted = await Client.findOneAndDelete({
      _id: id,
      organizationId: auth.session.organizationId,
    });
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/clients/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete client" },
      { status: 500 }
    );
  }
}

