import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { Organization } from "@/models/Organization";
import { getCurrentUser } from "@/lib/auth/jwt";
import Papa from "papaparse";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getCurrentUser();

    let orgId = session?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawCsv = formData.get("csv") as string | null;

    let csvContent = "";
    if (file) {
      csvContent = await file.text();
    } else if (rawCsv) {
      csvContent = rawCsv;
    } else {
      return NextResponse.json({ error: "No CSV file or text provided" }, { status: 400 });
    }

    const parsed = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
      return NextResponse.json({ error: "Failed to parse CSV file", details: parsed.errors }, { status: 400 });
    }

    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i];
      const businessName = row["Business Name"] || row["businessName"] || row["Name"] || row["name"];
      if (!businessName) {
        errors.push(`Row ${i + 1}: Missing business name`);
        continue;
      }

      const slug =
        businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
        "-" +
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 5);

      try {
        await Lead.create({
          organizationId: orgId,
          slug,
          businessName: businessName.trim(),
          category: row["Category"] || row["category"] || "Other",
          location: row["Location"] || row["location"] || "New Delhi",
          address: row["Address"] || row["address"] || "",
          phone: row["Phone"] || row["phone"] || "",
          email: row["Email"] || row["email"] || "",
          website: row["Website"] || row["website"] || "",
          source: row["Source"] || row["source"] || "CSV Import",
          rating: parseFloat(row["Rating"] || row["rating"] || "4.5") || 4.5,
          reviewCount: parseInt(row["Review Count"] || row["reviews"] || "0", 10) || 0,
          status: row["Status"] || row["status"] || "New",
          websiteScore: parseInt(row["Website Score"] || "60", 10) || 60,
          opportunityScore: parseInt(row["Opportunity Score"] || "75", 10) || 75,
          imageUrl: "/assets/templates/restaurant.jpg",
          performanceScores: {
            website: 60,
            seo: 50,
            performance: 45,
            mobile: 40,
            accessibility: 70,
            security: 80,
          },
          painPoints: ["Imported lead requiring initial audit"],
          competitors: [],
          actionPlan: [],
          websiteAudit: {
            lcp: "3.5s",
            fid: "120ms",
            cls: "0.15",
            fcp: "2.0s",
            issues: [],
          },
          aiInsights: {
            summary: "Imported via CSV. Needs initial research sweep.",
            strengths: [],
            weaknesses: [],
            pitchAngle: "Standard web presence audit",
          },
        });
        importedCount++;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Database error";
        errors.push(`Row ${i + 1} (${businessName}): ${errorMsg}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedCount,
      totalRows: parsed.data.length,
      errors,
    });
  } catch (error) {
    console.error("CSV Import error:", error);
    return NextResponse.json({ error: "Failed to process CSV import" }, { status: 500 });
  }
}

