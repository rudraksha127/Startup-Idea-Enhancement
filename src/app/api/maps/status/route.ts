import { NextResponse } from "next/server";

export async function GET() {
  const serverKey = process.env.GOOGLE_MAPS_SERVER_KEY || "";
  const browserKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY || "";

  const hasServerKey = Boolean(serverKey && serverKey.length > 10 && !serverKey.includes("placeholder"));
  const hasBrowserKey = Boolean(browserKey && browserKey.length > 10 && !browserKey.includes("placeholder"));

  return NextResponse.json({
    success: true,
    configured: hasServerKey || hasBrowserKey,
    hasServerKey,
    hasBrowserKey,
    status: hasServerKey || hasBrowserKey ? "CONNECTED" : "CREDENTIAL_REQUIRED",
    provider: "Google Maps Platform",
    apisRequired: [
      "Maps JavaScript API",
      "Places API (New)",
      "Places Autocomplete (New)",
      "Geocoding API",
    ],
    attribution: "Map data © Google",
    termsNotice: "Adheres to Google Maps Platform TOS Section 3.2.3. No unauthorized scraping.",
  });
}

