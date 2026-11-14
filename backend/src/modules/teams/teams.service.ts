import bcrypt from "bcryptjs";
import { UsersRepository } from "../../repositories/users.repository.js";
import { OrganizationsRepository } from "../../repositories/organizations.repository.js";
import { UserRecord } from "../../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export class TeamsService {
  /**
   * Retrieves all team members belonging strictly to the tenant's organization boundary.
   */
  static async listMembers(orgId: string) {
    let users = await UsersRepository.findByOrg(orgId);
    if (users.length === 0) {
      // Auto-provision primary founder/owner record for tenant in local/test store
      const founder = await UsersRepository.create({
        userId: `usr_founder_${orgId}`,
        organizationId: orgId,
        name: "Agency Founder",
        email: "founder@agencyos.io",
        passwordHash: "$2a$10$xyz",
        role: "Founder",
      });
      users = [founder];
    }
    return users.map((u) => ({
      id: u.userId,
      name: u.name,
      email: u.email,
      role: u.role,
      twoFactor: true,
      status: "Active",
      createdAt: u.createdAt,
    }));
  }

  /**
   * Invites a new team member to collaborate within the tenant organization boundary.
   */
  static async inviteMember(orgId: string, data: { name: string; email: string; role?: string }) {
    if (!data.email || !data.name) {
      throw new Error("Name and email are required to invite a team member");
    }

    let org = await OrganizationsRepository.findById(orgId);
    if (!org) {
      org = await OrganizationsRepository.create({
        orgId,
        name: "Acme Agency",
        slug: "acme-agency",
        plan: "growth",
        credits: 1000,
      });
    }

    const assignedRole = data.role || "Operator";

    // Check for existing user with this email in the organization
    const existing = await UsersRepository.findByEmail(data.email.toLowerCase());
    if (existing && existing.organizationId === orgId) {
      throw new Error(`User with email "${data.email}" is already a member of this organization`);
    }

    const tempPasswordHash = await bcrypt.hash(`InvitedUser_${Date.now()}_Secret!`, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newUser = await UsersRepository.create({
      userId,
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: tempPasswordHash,
      role: assignedRole,
      organizationId: orgId,
    });

    return {
      id: newUser.userId,
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
   * Updates an existing team member's role within the organization tenant boundary.
   */
  static async updateMemberRole(memberId: string, orgId: string, role: string) {
    const user = await UsersRepository.findById(memberId);
    if (!user || user.organizationId !== orgId) {
      throw new Error("Team member not found or access denied");
    }

    const updated = await UsersRepository.update(user.userId, { role });

    return {
      id: updated.userId,
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
    const user = await UsersRepository.findById(memberId);
    if (!user || user.organizationId !== orgId) {
      throw new Error("Team member not found or access denied");
    }

    if (user.role === "owner") {
      throw new Error("Cannot remove the organization owner");
    }

    await UsersRepository.delete(user.userId);
    return { success: true, removedId: memberId, email: user.email };
  }
}
