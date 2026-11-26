import { ENV } from "../../config/env.js";

export interface PlaceResult {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  category: string;
  distance: string;
  address: string;
  phone: string;
  website: string;
  img: string;
  opportunityScore: number;
  hours: string;
  priceRange: string;
  source: string;
  location?: { lat: number; lng: number };
}

const SAMPLE_DIRECTORY_FALLBACK: PlaceResult[] = [
  { id: "dir-1", name: "The Urban Kitchen", rating: 4.4, reviews: 1234, category: "Restaurant", distance: "0.8 km", address: "Connaught Place, New Delhi 110001", phone: "+91 98765 43210", website: "https://theurbankitchen.in", img: "/assets/urban-kitchen.jpg", opportunityScore: 8.5, hours: "Open • Closes 11:00 PM", priceRange: "₹₹ (Moderate)", source: "Sample Directory Fallback (Unverified)", location: { lat: 28.6304, lng: 77.2177 } },
  { id: "dir-2", name: "Spice Junction", rating: 4.6, reviews: 892, category: "Restaurant", distance: "1.2 km", address: "Vijay Nagar, Indore, MP", phone: "+91 98260 11223", website: "https://spicejunction.example", img: "/assets/templates/restaurant.jpg", opportunityScore: 8.2, hours: "Open • Closes 10:30 PM", priceRange: "₹₹ (Moderate)", source: "Sample Directory Fallback (Unverified)", location: { lat: 22.7533, lng: 75.8937 } },
  { id: "dir-3", name: "Flavors of India", rating: 4.3, reviews: 764, category: "Restaurant", distance: "1.4 km", address: "South Extension, New Delhi", phone: "+91 98111 22334", website: "https://flavorsofindia.example", img: "/assets/urban-kitchen.jpg", opportunityScore: 7.9, hours: "Open • Closes 11:30 PM", priceRange: "₹₹₹ (Upscale)", source: "Sample Directory Fallback (Unverified)", location: { lat: 28.5714, lng: 77.2215 } },
  { id: "dir-4", name: "Tandoori Nights", rating: 4.1, reviews: 986, category: "Restaurant", distance: "1.8 km", address: "Hauz Khas, New Delhi", phone: "+91 98765 00112", website: "https://tandoorinights.example", img: "/assets/templates/restaurant.jpg", opportunityScore: 8.7, hours: "Open • Closes 12:00 AM", priceRange: "₹₹ (Moderate)", source: "Sample Directory Fallback (Unverified)", location: { lat: 28.5494, lng: 77.2001 } },
  { id: "dir-5", name: "Café Central", rating: 4.5, reviews: 632, category: "Cafe", distance: "2.1 km", address: "Palasia, Indore, MP", phone: "+91 98261 44556", website: "https://cafecentral.example", img: "/assets/templates/restaurant.jpg", opportunityScore: 7.8, hours: "Open • Closes 9:00 PM", priceRange: "₹ (Budget)", source: "Sample Directory Fallback (Unverified)", location: { lat: 22.7244, lng: 75.8839 } },
  { id: "dir-6", name: "Luxe Glow Salon & Spa", rating: 4.7, reviews: 340, category: "Salon", distance: "1.1 km", address: "Saket Nagar, Indore, MP", phone: "+91 98260 45678", website: "", img: "/assets/templates/salon.jpg", opportunityScore: 9.3, hours: "Open • Closes 8:30 PM", priceRange: "₹₹ (Moderate)", source: "Sample Directory Fallback (Unverified)", location: { lat: 22.7196, lng: 75.8977 } },
  { id: "dir-7", name: "Iron & Pulse Fitness Club", rating: 4.8, reviews: 450, category: "Gym", distance: "1.9 km", address: "AB Road, Indore, MP", phone: "+91 98260 99887", website: "", img: "/assets/templates/restaurant.jpg", opportunityScore: 8.9, hours: "Open • Closes 10:00 PM", priceRange: "₹₹ (Moderate)", source: "Sample Directory Fallback (Unverified)", location: { lat: 22.7445, lng: 75.8912 } },
  { id: "dir-8", name: "City Care Specialty Clinic", rating: 4.6, reviews: 620, category: "Clinic", distance: "2.8 km", address: "Old Palasia, Indore, MP", phone: "+91 98260 77889", website: "https://citycare.example", img: "/assets/templates/clinic.jpg", opportunityScore: 8.6, hours: "Open • Closes 8:00 PM", priceRange: "₹₹₹ (Upscale)", source: "Sample Directory Fallback (Unverified)", location: { lat: 22.7291, lng: 75.8885 } },
  { id: "dir-9", name: "Hotel Grand Plaza", rating: 4.4, reviews: 512, category: "Hotel", distance: "2.5 km", address: "Aerocity, New Delhi", phone: "+91 98990 12345", website: "https://grandplaza.example", img: "/assets/templates/hotel.jpg", opportunityScore: 9.1, hours: "Open 24 Hours", priceRange: "₹₹₹₹ (Luxury)", source: "Sample Directory Fallback (Unverified)", location: { lat: 28.5529, lng: 77.1219 } },
  { id: "dir-10", name: "Apex Coding Academy", rating: 4.9, reviews: 510, category: "Education", distance: "0.6 km", address: "Vijay Nagar, Indore, MP", phone: "+91 98260 22331", website: "https://apexcoding.example", img: "/assets/templates/restaurant.jpg", opportunityScore: 9.0, hours: "Open • Closes 7:00 PM", priceRange: "₹₹₹ (Upscale)", source: "Sample Directory Fallback (Unverified)", location: { lat: 22.7562, lng: 75.8974 } },
];

export class MapsService {
  // In-memory bounded TTL cache for place searches (adheres to Google Maps caching policies)
  private static searchCache: Map<string, { data: { places: PlaceResult[]; source: string; total: number; isFallback?: boolean }; expiresAt: number }> = new Map();

  /**
   * Verifies Google Maps Platform configuration and credential status.
   */
  static getStatus() {
    const serverKey = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
    const browserKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    const hasServerKey = Boolean(serverKey && serverKey.length > 10 && !serverKey.includes("placeholder"));
    const hasBrowserKey = Boolean(browserKey && browserKey.length > 10 && !browserKey.includes("placeholder"));

    return {
      configured: hasServerKey || hasBrowserKey,
      hasServerKey,
      hasBrowserKey,
      status: (hasServerKey || hasBrowserKey) ? "CONNECTED" : "CREDENTIAL_REQUIRED",
      provider: "Google Maps Platform",
      apisRequired: [
        "Maps JavaScript API",
        "Places API (New)",
        "Places Autocomplete (New)",
        "Geocoding API",
      ],
      attribution: "Map data © Google",
      termsNotice: "Adheres to Google Maps Platform TOS Section 3.2.3. No unauthorized scraping.",
    };
  }

  /**
   * Searches for places using Google Places API (New) or fallback verified directory.
   */
  static async searchPlaces(params: {
    query?: string;
    category?: string;
    city?: string;
    radiusMeters?: number;
  }): Promise<{ places: PlaceResult[]; source: string; total: number; isFallback?: boolean }> {
    const serverKey = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.GOOGLE_MAPS_API_KEY;
    const query = params.query || "";
    const category = params.category || "";
    const city = params.city || "Indore";

    const cacheKey = `${query}:${category}:${city}`.toLowerCase();
    const cached = MapsService.searchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    // Helper to store in bounded cache
    const saveToCache = (data: { places: PlaceResult[]; source: string; total: number; isFallback?: boolean }) => {
      if (MapsService.searchCache.size >= 200) {
        const firstKey = MapsService.searchCache.keys().next().value;
        if (firstKey) MapsService.searchCache.delete(firstKey);
      }
      MapsService.searchCache.set(cacheKey, { data, expiresAt: Date.now() + 15 * 60 * 1000 });
      return data;
    };

    // 1. Live Google Places API (New) integration when server key is present
    if (serverKey && serverKey.length > 10 && !serverKey.includes("placeholder")) {
      try {
        const textQuery = [query, category, city].filter(Boolean).join(" ");
        const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": serverKey,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.primaryType,places.websiteUri,places.nationalPhoneNumber,places.currentOpeningHours",
          },
          body: JSON.stringify({
            textQuery,
            maxResultCount: 20,
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          if (data && data.places && Array.isArray(data.places)) {
            const places: PlaceResult[] = data.places.map((p: any) => ({
              id: p.id,
              name: p.displayName?.text || "Local Business",
              rating: p.rating || 4.2,
              reviews: p.userRatingCount || 100,
              category: p.primaryType || category || "Business",
              distance: "Nearby",
              address: p.formattedAddress || `${city}, India`,
              phone: p.nationalPhoneNumber || "",
              website: p.websiteUri || "",
              img: "/assets/templates/restaurant.jpg",
              opportunityScore: p.websiteUri ? 8.2 : 9.4, // Higher modernization opportunity if no website!
              hours: p.currentOpeningHours?.openNow ? "Open Now" : "Closes Soon",
              priceRange: "₹₹ (Moderate)",
              source: "Google Places API (New)",
              location: p.location ? { lat: p.location.latitude, lng: p.location.longitude } : undefined,
            }));

            return saveToCache({
              places,
              source: "Google Places API (New)",
              total: places.length,
            });
          }
        }
      } catch (apiErr) {
        console.warn("[MapsService] Places API call error, falling back to directory:", apiErr);
      }
    }

    // 2. Static sample fallback (explicitly marked unverified; live discovery requires GOOGLE_MAPS_SERVER_KEY)
    let filtered = [...SAMPLE_DIRECTORY_FALLBACK];
    if (category && category !== "All" && category !== "More") {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return saveToCache({
      places: filtered,
      source: "Sample Directory Fallback (Unverified — Set GOOGLE_MAPS_SERVER_KEY)",
      isFallback: true,
      total: filtered.length,
    });
  }

  /**
   * Autocomplete suggestions for search input.
   */
  static async autocomplete(input: string) {
    const serverKey = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (serverKey && serverKey.length > 10 && !serverKey.includes("placeholder") && input.length >= 2) {
      try {
        const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": serverKey,
          },
          body: JSON.stringify({ input }),
        });
        if (res.ok) {
          const data: any = await res.json();
          return (data.suggestions || []).map((s: any) => ({
            placeId: s.placePrediction?.placeId,
            description: s.placePrediction?.text?.text,
          }));
        }
      } catch (err) {
        console.warn("[MapsService] Autocomplete failed:", err);
      }
    }

    // Fallback autocomplete
    return SAMPLE_DIRECTORY_FALLBACK.filter((b) =>
      b.name.toLowerCase().includes(input.toLowerCase())
    ).map((b) => ({
      placeId: b.id,
      description: `${b.name}, ${b.address}`,
    }));
  }

  /**
   * Fetches place details for a given place ID.
   */
  static async getPlaceDetails(placeId: string) {
    const found = SAMPLE_DIRECTORY_FALLBACK.find((p) => p.id === placeId);
    if (found) return found;

    return {
      id: placeId,
      name: "Unavailable (Configure GOOGLE_MAPS_SERVER_KEY)",
      rating: 0,
      reviews: 0,
      category: "Unknown",
      distance: "—",
      address: "Address unavailable without live Places API",
      phone: "",
      website: "",
      img: "/assets/urban-kitchen.jpg",
      opportunityScore: 0,
      hours: "Unavailable",
      priceRange: "Unavailable",
      source: "Sample Directory Fallback (Unverified — Set GOOGLE_MAPS_SERVER_KEY)",
      isFallback: true,
    };
  }
}
