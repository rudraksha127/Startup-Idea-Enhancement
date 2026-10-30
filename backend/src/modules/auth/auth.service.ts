import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../models/User.js";
import { Organization } from "../../models/Organization.js";
import { ENV } from "../../config/env.js";

export class AuthService {
  static async registerUser(data: {
    name: string;
    email: string;
    password: string;
    organizationName: string;
  }) {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new Error("ACCOUNT_EXISTS");
    }

    const orgSlug =
      data.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Date.now().toString(36);

    const org = await Organization.create({
      name: data.organizationName,
      slug: orgSlug,
      plan: "Pro",
      credits: 250,
    });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const initials =
      data.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "AG";

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: "Founder",
      organizationId: org._id,
      avatarInitials: initials,
    });

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: org._id.toString(),
      },
      ENV.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarInitials: user.avatarInitials,
      },
      organization: {
        id: org._id.toString(),
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        credits: org.credits,
      },
      token,
    };
  }

  static async loginUser(data: { email: string; password: string }) {
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      throw new Error("INVALID_CREDENTIALS");
    }

    let org = await Organization.findById(user.organizationId);
    if (!org) {
      org = await Organization.create({
        name: `${user.name}'s Agency`,
        slug: `agency-${user._id.toString().slice(-6)}`,
        plan: "Pro",
        credits: 250,
      });
      user.organizationId = org._id;
      await user.save();
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: org._id.toString(),
      },
      ENV.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarInitials: user.avatarInitials,
      },
      organization: {
        id: org._id.toString(),
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        credits: org.credits,
      },
      token,
    };
  }

  static async getUserProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) return null;
    const org = await Organization.findById(user.organizationId);
    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarInitials: user.avatarInitials,
      },
      organization: org
        ? {
            id: org._id.toString(),
            name: org.name,
            slug: org.slug,
            plan: org.plan,
            credits: org.credits,
          }
        : null,
    };
  }
}

