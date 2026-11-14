import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UsersRepository } from "../../repositories/users.repository.js";
import { OrganizationsRepository } from "../../repositories/organizations.repository.js";
import { ENV } from "../../config/env.js";

export class AuthService {
  static async registerUser(data: {
    name: string;
    email: string;
    password: string;
    organizationName: string;
  }) {
    const existingUser = await UsersRepository.findByEmail(data.email.toLowerCase());
    if (existingUser) {
      throw new Error("ACCOUNT_EXISTS");
    }

    const orgSlug =
      data.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Date.now().toString(36);

    const org = await OrganizationsRepository.create({
      orgId: `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.organizationName,
      slug: orgSlug,
      plan: "Pro",
      credits: 250,
    });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await UsersRepository.create({
      userId: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: "owner",
      organizationId: org.orgId,
    });

    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: org.orgId,
      },
      ENV.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarInitials: user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "AG",
      },
      organization: {
        id: org.orgId,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        credits: org.credits,
      },
      token,
    };
  }

  static async loginUser(data: { email: string; password: string }) {
    const user = await UsersRepository.findByEmail(data.email.toLowerCase());
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      throw new Error("INVALID_CREDENTIALS");
    }

    let org = await OrganizationsRepository.findById(user.organizationId);
    if (!org) {
      org = await OrganizationsRepository.create({
        orgId: user.organizationId || `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: `${user.name}'s Agency`,
        slug: `agency-${user.userId.slice(-6)}`,
        plan: "Pro",
        credits: 250,
      });
      if (user.organizationId !== org.orgId) {
        await UsersRepository.update(user.userId, { organizationId: org.orgId });
      }
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: org.orgId,
      },
      ENV.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarInitials: user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "AG",
      },
      organization: {
        id: org.orgId,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        credits: org.credits,
      },
      token,
    };
  }

  static async getUserProfile(userId: string) {
    const user = await UsersRepository.findById(userId);
    if (!user) return null;
    const org = await OrganizationsRepository.findById(user.organizationId);
    return {
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarInitials: user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "AG",
      },
      organization: org
        ? {
            id: org.orgId,
            name: org.name,
            slug: org.slug,
            plan: org.plan,
            credits: org.credits,
          }
        : null,
    };
  }
}
