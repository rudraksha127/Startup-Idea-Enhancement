import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import mongoose from "mongoose";

const DEFAULT_MEMBERS = [
  { id: "mem-1", name: "Alex Rivera", email: "alex@agencyos.ai", role: "Owner / Founder", twoFactor: true, status: "Active" },
  { id: "mem-2", name: "Sarah Chen", email: "sarah@agencyos.ai", role: "Lead Developer", twoFactor: true, status: "Active" },
  { id: "mem-3", name: "Marcus Vance", email: "marcus@agencyos.ai", role: "Growth & Outreach", twoFactor: false, status: "Active" },
  { id: "mem-4", name: "Elena Rostova", email: "elena@agencyos.ai", role: "Client Success", twoFactor: true, status: "Invited" },
];

export async function GET(req: NextRequest) {
  try {
    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1) {
        let org = await Organization.findOne({ slug: "agencyos-demo" });
        if (!org) org = await Organization.findOne();

        if (org) {
          const users = await User.find({ organizationId: org._id }).select("-passwordHash").lean();
          if (users.length > 0) {
            const members = users.map((u) => ({
              id: u._id.toString(),
              name: u.name,
              email: u.email,
              role: u.role,
              twoFactor: true,
              status: "Active",
              createdAt: u.createdAt,
            }));
            return NextResponse.json({ success: true, members });
          }
        }
      }
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ success: true, members: DEFAULT_MEMBERS });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

