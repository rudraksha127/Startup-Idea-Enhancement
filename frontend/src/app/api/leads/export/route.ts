import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { requireApiAuth } from "@/lib/auth/jwt";
import mongoose from "mongoose";
import Papa from "papaparse";

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const orgId = auth.session.organizationId;

    if (mongoose.connection.readyState !== 1 || !mongoose.isValidObjectId(orgId)) {
      return new NextResponse("Business Name,Category,Status\n", {
        headers: { "Content-Type": "text/csv; charset=utf-8" },
      });
    }

    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids");
    const status = searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { organizationId: orgId };
    if (ids) {
      const idList = ids.split(",").filter(Boolean);
      if (idList.length > 0) {
        query._id = { $in: idList };
      }
    } else if (status && status !== "All") {
      query.status = status;
    }

    const leads = await Lead.find(query).lean();

    const rows = leads.map((l) => ({
      "Business Name": l.businessName,
      Category: l.category,
      Location: l.location,
      Address: l.address,
      Phone: l.phone,
      Email: l.email,
      Website: l.website,
      Source: l.source,
      Rating: l.rating,
      "Review Count": l.reviewCount,
      Status: l.status,
      "Website Score": l.websiteScore,
      "Opportunity Score": l.opportunityScore,
      "Last Contacted": l.lastContactedAt || "—",
    }));

    const csv = Papa.unparse(rows);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="agencyos-leads-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV Export error:", error);
    return new NextResponse("Failed to export leads", { status: 500 });
  }
}

