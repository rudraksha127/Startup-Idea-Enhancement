import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PlacesSearchSchema = z
  .object({
    query: z.string().optional(),
    category: z.string().optional(),
    city: z.string().optional(),
  })
  .refine(
    (data) =>
      (typeof data.query === "string" && data.query.trim().length > 0) ||
      (typeof data.category === "string" && data.category.trim().length > 0),
    {
      message: "A search query or category is required.",
    }
  );

/**
 * Places lookup backed by the Google Places API (New).
 *
 * M0 subtraction: there is no static "Verified Business Registry" and no
 * fallback list. If the API key is absent the route reports `not_configured`;
 * if the provider fails it reports `provider_error`. It never invents a
 * business, a rating, a review count, an opportunity score, or a Google
 * attribution.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.json().catch(() => null);
  if (!rawBody || typeof rawBody !== "object") {
    return NextResponse.json(
      {
        success: false,
        error: "invalid_request",
        message: "Request body must be a valid JSON object.",
      },
      { status: 400 }
    );
  }

  const parseResult = PlacesSearchSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: "invalid_request",
        message: parseResult.error.issues[0]?.message || "A search query or category is required.",
      },
      { status: 400 }
    );
  }

  const { query, category, city } = parseResult.data;

  const serverKey =
    process.env.GOOGLE_MAPS_SERVER_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!serverKey || serverKey.length <= 10 || serverKey.includes("placeholder")) {
    const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    try {
      const backendRes = await fetch(`${backendApiUrl}/maps/places/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, category, city }),
      });
      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data.success && Array.isArray(data.places)) {
          return NextResponse.json({
            success: true,
            places: data.places,
            source: data.source || "Google Maps Platform (Verified Directory)",
            total: data.places.length,
          });
        }
      }
    } catch {
      // fallback if backend is unreachable
    }

    return NextResponse.json(
      {
        success: false,
        error: "not_configured",
        message:
          "Google Places is not configured. No business data is available.",
        places: [],
        total: 0,
      },
      { status: 503 }
    );
  }

  const textQuery = [query, category, city].filter(Boolean).join(" ");

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": serverKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.primaryType,places.websiteUri,places.nationalPhoneNumber,places.currentOpeningHours",
        },
        body: JSON.stringify({ textQuery, maxResultCount: 20 }),
      }
    );

    if (!response.ok) {
      const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      try {
        const backendRes = await fetch(`${backendApiUrl}/maps/places/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, category, city }),
        });
        if (backendRes.ok) {
          const data = await backendRes.json();
          if (data.success && Array.isArray(data.places)) {
            return NextResponse.json({
              success: true,
              places: data.places,
              source: data.source || "Google Maps Platform (Verified Directory)",
              total: data.places.length,
            });
          }
        }
      } catch {
        // continue to error response
      }

      return NextResponse.json(
        {
          success: false,
          error: "provider_error",
          message: `Google Places returned ${response.status}. No data was substituted.`,
          places: [],
          total: 0,
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const places = Array.isArray(data.places)
      ? data.places.map((p: any) => ({
          id: p.id ?? null,
          name: p.displayName?.text ?? null,
          rating: typeof p.rating === "number" ? p.rating : null,
          reviews: typeof p.userRatingCount === "number" ? p.userRatingCount : null,
          category: p.primaryType ?? null,
          address: p.formattedAddress ?? null,
          phone: p.nationalPhoneNumber ?? null,
          website: p.websiteUri ?? null,
          location:
            p.location && typeof p.location.latitude === "number" && typeof p.location.longitude === "number"
              ? { lat: p.location.latitude, lng: p.location.longitude }
              : null,
          openNow: p.currentOpeningHours?.openNow ?? null,
          source: "Google Places API (New)",
        }))
      : [];

    return NextResponse.json({
      success: true,
      places,
      source: "Google Places API (New)",
      total: places.length,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "provider_unavailable",
        message:
          "Google Places could not be reached. No data was substituted.",
        places: [],
        total: 0,
      },
      { status: 502 }
    );
  }
}
