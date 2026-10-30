import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Lead } from "@/models/Lead";
import { Organization } from "@/models/Organization";
import { getCurrentUser } from "@/lib/auth/jwt";
import Papa from "papaparse";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getCurrentUser();

    let orgId = session?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    if (!orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
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

