import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Template } from "@/models/Template";
import { Organization } from "@/models/Organization";
import { getCurrentUser } from "@/lib/auth/jwt";
import mongoose from "mongoose";

const DEFAULT_TEMPLATES = [
  {
    name: "Modern Restaurant & Bar",
    category: "Restaurant",
    categoryBadge: "bg-emerald-50 text-emerald-700",
    rating: 4.9,
    usesCount: 1248,
    description: "High-converting food and dining framework with online table booking, dynamic digital menu, and location schema.",
    img: "/assets/templates/restaurant.jpg",
    thumbnails: ["/assets/templates/restaurant.jpg", "/assets/urban-kitchen.jpg"],
    features: [
      "Table reservation system with instant WhatsApp confirmation",
      "Dynamic menu categories (Veg, Non-Veg, Chef Specials)",
      "Google Maps Local Business Schema injection",
      "PageSpeed 95+ mobile-first architecture",
    ],
    variations: [{ name: "Modern (Default)", preview: "/assets/templates/restaurant.jpg", isDefault: true }],
  },
  {
    name: "Specialty Cafe & Roastery",
    category: "Cafe",
    categoryBadge: "bg-amber-50 text-amber-700",
    rating: 4.8,
    usesCount: 892,
    description: "Warm artisanal cafe presentation with beverage tasting notes, barista stories, and event hosting bookings.",
    img: "/assets/templates/restaurant.jpg",
    thumbnails: ["/assets/templates/restaurant.jpg"],
    features: ["Daily specials showcase", "Coffee bean subscription", "Event calendar"],
    variations: [{ name: "Warm Amber", preview: "/assets/templates/restaurant.jpg", isDefault: true }],
  },
  {
    name: "CarePoint Dental & Medical Clinic",
    category: "Clinic",
    categoryBadge: "bg-blue-50 text-blue-700",
    rating: 4.9,
    usesCount: 764,
    description: "HIPAA/DPDP compliant healthcare practice website with appointment intake, doctor credentials, and insurance FAQs.",
    img: "/assets/templates/clinic.jpg",
    thumbnails: ["/assets/templates/clinic.jpg"],
    features: ["Online patient registration", "Doctor credentials showcase", "Treatment pricing calculator"],
    variations: [{ name: "Clinical Blue", preview: "/assets/templates/clinic.jpg", isDefault: true }],
  },
  {
    name: "Pulse Fitness Club & Gym",
    category: "Gym",
    categoryBadge: "bg-purple-50 text-purple-700",
    rating: 4.7,
    usesCount: 642,
    description: "High-energy athletic club and CrossFit layout with workout class schedules, membership tiers, and trainer portfolios.",
    img: "/assets/templates/restaurant.jpg",
    thumbnails: ["/assets/templates/restaurant.jpg"],
    features: ["Weekly fitness timetable", "Membership tier comparison", "Trainer booking packages"],
    variations: [{ name: "Neon Dark", preview: "/assets/templates/restaurant.jpg", isDefault: true }],
  },
  {
    name: "Grand Plaza Luxury Hotel",
    category: "Hotel",
    categoryBadge: "bg-indigo-50 text-indigo-700",
    rating: 4.9,
    usesCount: 432,
    description: "Luxury hospitality showcase featuring room suites preview, amenity gallery, direct booking engine, and local attractions.",
    img: "/assets/templates/hotel.jpg",
    thumbnails: ["/assets/templates/hotel.jpg"],
    features: ["Direct room booking engine", "Virtual tour integration", "Concierge guide"],
    variations: [{ name: "Luxury Gold", preview: "/assets/templates/hotel.jpg", isDefault: true }],
  },
  {
    name: "Glow Beauty Salon & Spa",
    category: "Salon",
    categoryBadge: "bg-pink-50 text-pink-700",
    rating: 4.8,
    usesCount: 689,
    description: "Modern aesthetic spa and beauty lounge framework with stylist slot booking, bridal packages, and gift cards.",
    img: "/assets/templates/salon.jpg",
    thumbnails: ["/assets/templates/salon.jpg"],
    features: ["Stylist slot reservation", "Bridal bundles menu", "Automated appointment alerts"],
    variations: [{ name: "Pastel Rose", preview: "/assets/templates/salon.jpg", isDefault: true }],
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1) {
        let org = await Organization.findOne({ slug: "agencyos-demo" });
        if (!org) org = await Organization.findOne();
        if (org) {
          const count = await Template.countDocuments({ organizationId: org._id });
          if (count === 0) {
            await Template.insertMany(
              DEFAULT_TEMPLATES.map((t) => ({ ...t, organizationId: org._id }))
            );
          }
          const query: any = { organizationId: org._id };
          if (category && category !== "All") {
            query.category = { $regex: new RegExp(`^${category}$`, "i") };
          }
          const templates = await Template.find(query).sort({ createdAt: -1 }).lean();
          return NextResponse.json({ success: true, templates });
        }
      }
    } catch {
      // Offline fallback
    }

    let filtered = [...DEFAULT_TEMPLATES];
    if (category && category !== "All") {
      filtered = filtered.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }
    return NextResponse.json({
      success: true,
      templates: filtered.map((t, i) => ({ _id: (i + 1).toString(), ...t })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    try {
      await connectToDatabase();
      if (mongoose.connection.readyState === 1) {
        let org = await Organization.findOne({ slug: "agencyos-demo" });
        if (!org) org = await Organization.findOne();
        if (org) {
          const template = await Template.create({
            ...body,
            organizationId: org._id,
            isCustom: true,
          });
          return NextResponse.json({ success: true, template }, { status: 201 });
        }
      }
    } catch {
      // Offline fallback
    }

    return NextResponse.json(
      { success: true, template: { _id: "tmpl-" + Date.now().toString(36), ...body, isCustom: true } },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

