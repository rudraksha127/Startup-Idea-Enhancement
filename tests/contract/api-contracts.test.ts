import { describe, it, expect } from "vitest";
import { LeadSchema, InvoiceSchema, UserSchema } from "../../database/schemas/index.js";

describe("API & Database Zod Contracts Validation", () => {
  it("validates compliant lead payload against LeadSchema", () => {
    const validLead = {
      organizationId: "507f191e810c19729de860ea",
      businessName: "CarePoint Dental Clinic",
      category: "Dental Care",
      status: "New" as const,
      opportunityScore: 78,
      source: "Google Maps Platform",
    };

    const parsed = LeadSchema.safeParse(validLead);
    expect(parsed.success).toBe(true);
  });

  it("rejects non-compliant lead payload missing organizationId", () => {
    const invalidLead = {
      businessName: "CarePoint Dental Clinic",
      category: "Dental Care",
      status: "New",
    };

    const parsed = LeadSchema.safeParse(invalidLead);
    expect(parsed.success).toBe(false);
  });

  it("validates compliant invoice payload against InvoiceSchema", () => {
    const validInvoice = {
      organizationId: "507f191e810c19729de860ea",
      invoiceNumber: "INV-2026-101",
      clientName: "Hotel Grand Plaza",
      amount: 85000,
      currency: "INR",
      status: "Paid" as const,
      dueDate: "2026-11-30",
    };

    const parsed = InvoiceSchema.safeParse(validInvoice);
    expect(parsed.success).toBe(true);
  });

  it("validates user roles strictly via UserSchema", () => {
    const validUser = {
      email: "operator@agencyos.io",
      name: "Sam Operator",
      role: "Operator" as const,
      organizationId: "507f191e810c19729de860ea",
    };

    const parsed = UserSchema.safeParse(validUser);
    expect(parsed.success).toBe(true);

    const invalidUser = {
      ...validUser,
      role: "SuperAdminOfUniverse",
    };
    expect(UserSchema.safeParse(invalidUser).success).toBe(false);
  });
});

