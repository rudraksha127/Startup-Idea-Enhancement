import { describe, it, expect } from "vitest";
import { createLeadSchema, leadFilterSchema } from "@/lib/validations/lead";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

describe("Zod Validation Schemas", () => {
  it("validates valid lead creation payloads with default scores", () => {
    const payload = {
      businessName: "The Urban Kitchen",
      category: "Restaurant",
      location: "New Delhi",
      rating: 4.6,
      opportunityScore: 92,
    };

    const parsed = createLeadSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.businessName).toBe("The Urban Kitchen");
      expect(parsed.data.category).toBe("Restaurant");
      expect(parsed.data.status).toBe("New");
    }
  });

  it("fails lead creation when business name is empty", () => {
    const payload = {
      businessName: "",
      category: "Restaurant",
    };

    const parsed = createLeadSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it("validates auth login schema email and password length", () => {
    const valid = loginSchema.safeParse({
      email: "test@agencyos.com",
      password: "password123",
    });
    expect(valid.success).toBe(true);

    const invalidEmail = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(invalidEmail.success).toBe(false);

    const shortPassword = loginSchema.safeParse({
      email: "test@agencyos.com",
      password: "123",
    });
    expect(shortPassword.success).toBe(false);
  });

  it("validates registration schema with workspace name", () => {
    const valid = registerSchema.safeParse({
      name: "Rudraksh",
      email: "rudraksh@apexdigital.com",
      password: "password123",
      organizationName: "Apex Digital Studio",
    });
    expect(valid.success).toBe(true);
  });

  it("handles lead filter query parameters and default limits", () => {
    const parsed = leadFilterSchema.safeParse({
      page: "2",
      limit: "20",
      sortBy: "rating",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.page).toBe(2);
      expect(parsed.data.limit).toBe(20);
      expect(parsed.data.sortBy).toBe("rating");
    }
  });
});

