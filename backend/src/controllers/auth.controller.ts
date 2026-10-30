import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Organization } from "../models/Organization.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { ENV } from "../config/env.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: input.email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: "Account already exists",
        message: "An account with this email address is already registered.",
      });
    }

    const orgSlug =
      input.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Date.now().toString(36);

    const org = await Organization.create({
      name: input.organizationName,
      slug: orgSlug,
      plan: "Pro",
      credits: 250,
    });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const initials =
      input.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "AG";

    const user = await User.create({
      name: input.name,
      email: input.email.toLowerCase(),
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

    res.cookie("agencyos_token", token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarInitials: user.avatarInitials,
        organization: {
          id: org._id,
          name: org.name,
          slug: org.slug,
          plan: org.plan,
          credits: org.credits,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);

    const user = await User.findOne({ email: input.email.toLowerCase() }).populate(
      "organizationId"
    );
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "No account found matching this email and password.",
      });
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "No account found matching this email and password.",
      });
    }

    const org = user.organizationId as any;

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

    res.cookie("agencyos_token", token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarInitials: user.avatarInitials,
        organization: {
          id: org._id,
          name: org.name,
          slug: org.slug,
          plan: org.plan,
          credits: org.credits,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export function logout(req: Request, res: Response) {
  res.clearCookie("agencyos_token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId).populate("organizationId");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const org = user.organizationId as any;

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarInitials: user.avatarInitials,
        organization: {
          id: org?._id,
          name: org?.name,
          slug: org?.slug,
          plan: org?.plan,
          credits: org?.credits,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

