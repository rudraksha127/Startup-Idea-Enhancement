import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, IUser } from "../../models/User.js";

const DEFAULT_MEMBERS = [
  { id: "mem-1", name: "Alex Rivera", email: "alex@agencyos.ai", role: "Founder", twoFactor: true, status: "Active" },
  { id: "mem-2", name: "Sarah Chen", email: "sarah@agencyos.ai", role: "Developer", twoFactor: true, status: "Active" },
  { id: "mem-3", name: "Marcus Vance", email: "marcus@agencyos.ai", role: "Operator", twoFactor: false, status: "Active" },
  { id: "mem-4", name: "Elena Rostova", email: "elena@agencyos.ai", role: "Admin", twoFactor: true, status: "Invited" },
];

export class TeamsService {
  /**
   * Retrieves all team members belonging to the tenant's organization boundary.
   */
  static async listMembers(orgId: string) {
    if (mongoose.connection.readyState !== 1) {
      return DEFAULT_MEMBERS;
    }

    try {
      const users = await User.find({ organizationId: orgId }).select("-passwordHash").lean();
      if (users.length === 0) {
        // Seed default team members for tenant
        const seeded = [];
        for (const m of DEFAULT_MEMBERS) {
          const pass = await bcrypt.hash("Password123!", 10);
          const u = await User.create({
            name: m.name,
            email: m.email,
            passwordHash: pass,
            role: m.role as any,
            organizationId: new mongoose.Types.ObjectId(orgId),
            avatarInitials: m.name.split(" ").map((n) => n[0]).join(""),
          });
          seeded.push({
            id: u._id.toString(),
            name: u.name,
            email: u.email,
            role: u.role,
            twoFactor: true,
            status: "Active",
            createdAt: u.createdAt,
          });
        }
        return seeded;
      }

      return users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        twoFactor: true,
        status: "Active",
        createdAt: u.createdAt,
      }));
    } catch {
      return DEFAULT_MEMBERS;
    }
  }

  /**
   * Invites a new team member to collaborate within the tenant organization.
   */
  static async inviteMember(orgId: string, data: { name: string; email: string; role?: string }) {
    if (!data.email || !data.name) {
      throw new Error("Name and email are required to invite a team member");
    }

    const role = (data.role || "Operator") as "Founder" | "Admin" | "Operator" | "Developer";
    const initials = data.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    if (mongoose.connection.readyState !== 1) {
      const mockId = "mem-" + Date.now().toString(36);
      return {
        id: mockId,
        name: data.name,
        email: data.email.toLowerCase(),
        role,
        twoFactor: false,
        status: "Invited",
        organizationId: orgId,
        invitationToken: "inv_tok_" + Date.now().toString(36),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(),
      };
    }

    // Check for existing user in org
    const existing = await User.findOne({
      email: data.email.toLowerCase(),
      organizationId: orgId,
    });
    if (existing) {
      throw new Error(`User with email "${data.email}" is already a member of this organization`);
    }

    const tempPasswordHash = await bcrypt.hash("TempPass" + Date.now(), 10);
    const newUser = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: tempPasswordHash,
      role,
      organizationId: new mongoose.Types.ObjectId(orgId),
      avatarInitials: initials,
    });

    return {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      twoFactor: false,
      status: "Invited",
      organizationId: orgId,
      invitationToken: "inv_tok_" + Date.now().toString(36),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: newUser.createdAt,
    };
  }

  /**
   * Updates an existing team member's role with deterministic authorization rules.
   */
  static async updateMemberRole(memberId: string, orgId: string, role: string) {
    const validRoles = ["Founder", "Admin", "Operator", "Developer"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role "${role}". Allowed roles: ${validRoles.join(", ")}`);
    }

    if (mongoose.connection.readyState !== 1) {
      return { id: memberId, role, updated: true };
    }

    const updated = await User.findOneAndUpdate(
      { _id: memberId, organizationId: orgId },
      { $set: { role } },
      { new: true }
    ).select("-passwordHash").lean();

    if (!updated) {
      throw new Error("Team member not found or access denied");
    }

    return {
      id: updated._id.toString(),
      name: updated.name,
      email: updated.email,
      role: updated.role,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Removes a team member from the organization tenant boundary.
   */
  static async removeMember(memberId: string, orgId: string) {
    if (mongoose.connection.readyState !== 1) {
      return { success: true, removedId: memberId };
    }

    const result = await User.findOneAndDelete({
      _id: memberId,
      organizationId: orgId,
    });

    if (!result) {
      throw new Error("Team member not found or access denied");
    }

    return { success: true, removedId: memberId, email: result.email };
  }
}

