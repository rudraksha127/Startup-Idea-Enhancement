"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Crosshair, Globe, Layers, Minus, Plus } from "lucide-react";

export interface MapBusinessPin {
  id: string;
  name: string;
  category: string;
  rating: number;
  address: string;
  opportunityScore: number;
  location?: { lat: number; lng: number };
}

interface LiveInteractiveMapProps {
  businesses: MapBusinessPin[];
  selectedBusiness: MapBusinessPin | null;
  city: string;
  mapMode: "map" | "satellite";
  onMapModeChange: (mode: "map" | "satellite") => void;
  searchInArea: boolean;
  onToggleSearchInArea: () => void;
  onSelectBusiness: (bizId: string) => void;
  onDrawAreaClick: () => void;
}

const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  indore: { lat: 22.735, lng: 75.885 },
  "new delhi": { lat: 28.6139, lng: 77.209 },
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  pune: { lat: 18.5204, lng: 73.8567 },
};

const CATEGORY_PIN_COLOR: Record<string, string> = {
  Restaurant: "#EF4444",
  Cafe: "#F97316",
  Salon: "#EAB308",
  Gym: "#10B981",
  Clinic: "#3B82F6",
  Hotel: "#3B82F6",
  Education: "#8B5CF6",
};

function latLngToWorldPx(lat: number, lng: number, zoom: number) {
  const scale = 256 * Math.pow(2, zoom);
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const clamped = Math.min(Math.max(sinLat, -0.9999), 0.9999);
  const x = ((lng + 180) / 360) * scale;
  const y = (0.5 - Math.log((1 + clamped) / (1 - clamped)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function resolveDefaultCenter(
  city: string,
  businesses: MapBusinessPin[],
  selectedBusiness: MapBusinessPin | null
) {
  if (selectedBusiness?.location?.lat && selectedBusiness?.location?.lng) {
    return selectedBusiness.location;
  }
  const withCoords = businesses.find((b) => b.location?.lat && b.location?.lng);
  if (withCoords?.location) return withCoords.location;

  const lower = city.toLowerCase();
  const matchedKey = Object.keys(CITY_CENTERS).find((k) => lower.includes(k));
  return matchedKey ? CITY_CENTERS[matchedKey] : CITY_CENTERS.indore;
}

export function LiveInteractiveMap({
  businesses,
  selectedBusiness,
  city,
  mapMode,
  onMapModeChange,
  searchInArea,
  onToggleSearchInArea,
  onSelectBusiness,
  onDrawAreaClick,
}: LiveInteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const googleMapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googleMapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googleMarkersRef = useRef<any[]>([]);

  const browserKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY || "";
  const hasGoogleBrowserKey = Boolean(
    browserKey && browserKey.length > 10 && !browserKey.includes("placeholder")
  );

  const [googleReady, setGoogleReady] = useState(false);
  const [googleFailed, setGoogleFailed] = useState(false);
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState(() =>
    resolveDefaultCenter(city, businesses, selectedBusiness)
  );
  const [viewportSize, setViewportSize] = useState({ width: 560, height: 690 });
  const dragStateRef = useRef<{ active: boolean; startX: number; startY: number; origCenter: { lat: number; lng: number } }>({
    active: false,
    startX: 0,
    startY: 0,
    origCenter: center,
  });

  // Update map center when city or selected business coordinates change
  useEffect(() => {
    setCenter(resolveDefaultCenter(city, businesses, selectedBusiness));
  }, [city, selectedBusiness?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track container dimensions for accurate slippy tile placement
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 0 && rect.height > 0) {
        setViewportSize({ width: rect.width, height: rect.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Dynamically load native Google Maps JS SDK when NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY is set
  useEffect(() => {
    if (!hasGoogleBrowserKey || googleFailed || typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    win.gm_authFailure = () => {
      setGoogleFailed(true);
      setGoogleReady(false);
    };
    if (win.google?.maps) {
      setGoogleReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-agencyos-gmaps="true"]');
    if (existing) {
      existing.addEventListener("load", () => setGoogleReady(true));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(browserKey)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.agencyosGmaps = "true";
    script.onload = () => setGoogleReady(true);
    script.onerror = () => {
      setGoogleFailed(true);
      setGoogleReady(false);
    };
    document.head.appendChild(script);
  }, [hasGoogleBrowserKey, googleFailed, browserKey]);

  // Render Google Maps JS instance + pins when Google SDK is ready
  useEffect(() => {
    if (!googleReady || googleFailed || !googleMapContainerRef.current || typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gmaps = (window as any).google?.maps;
    if (!gmaps) return;

    if (!googleMapInstanceRef.current) {
      googleMapInstanceRef.current = new gmaps.Map(googleMapContainerRef.current, {
        center,
        zoom,
        mapTypeId: mapMode === "satellite" ? "hybrid" : "roadmap",
        disableDefaultUI: true,
        gestureHandling: "greedy",
      });
    } else {
      googleMapInstanceRef.current.panTo(center);
      googleMapInstanceRef.current.setZoom(zoom);
      googleMapInstanceRef.current.setMapTypeId(mapMode === "satellite" ? "hybrid" : "roadmap");
    }

    // Fall back gracefully to OSM Slippy Map if Google injects Billing/Referer error overlay (.gm-err-container)
    const errCheckTimer = setTimeout(() => {
      if (googleMapContainerRef.current?.querySelector(".gm-err-container")) {
        setGoogleFailed(true);
        setGoogleReady(false);
      }
    }, 1200);

    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = businesses
      .filter((b) => b.location?.lat && b.location?.lng)
      .map((biz) => {
        const marker = new gmaps.Marker({
          position: biz.location,
          map: googleMapInstanceRef.current,
          title: `${biz.name} (${biz.category})`,
        });
        marker.addListener("click", () => onSelectBusiness(biz.id));
        return marker;
      });

    return () => clearTimeout(errCheckTimer);
  }, [googleReady, googleFailed, center, zoom, mapMode, businesses, onSelectBusiness]);

  // Compute visible slippy map tiles for dynamic OSM / Satellite fallback
  const { centerWorld, tiles } = useMemo(() => {
    const cw = latLngToWorldPx(center.lat, center.lng, zoom);
    const halfW = viewportSize.width / 2;
    const halfH = viewportSize.height / 2;
    const minTileX = Math.floor((cw.x - halfW) / 256);
    const maxTileX = Math.floor((cw.x + halfW) / 256);
    const minTileY = Math.floor((cw.y - halfH) / 256);
    const maxTileY = Math.floor((cw.y + halfH) / 256);
    const numTiles = Math.pow(2, zoom);

    const tileList: Array<{ key: string; left: number; top: number; url: string }> = [];
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        if (ty < 0 || ty >= numTiles) continue;
        const wrappedX = ((tx % numTiles) + numTiles) % numTiles;
        const left = tx * 256 - (cw.x - halfW);
        const top = ty * 256 - (cw.y - halfH);
        const url =
          mapMode === "satellite"
            ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${ty}/${wrappedX}`
            : `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${ty}.png`;
        tileList.push({ key: `${zoom}-${tx}-${ty}`, left, top, url });
      }
    }
    return { centerWorld: cw, tiles: tileList };
  }, [center.lat, center.lng, zoom, viewportSize.width, viewportSize.height, mapMode]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (googleReady) return;
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origCenter: center,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (googleReady || !dragStateRef.current.active) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    const scale = 256 * Math.pow(2, zoom);
    const origWorld = latLngToWorldPx(
      dragStateRef.current.origCenter.lat,
      dragStateRef.current.origCenter.lng,
      zoom
    );
    const newX = origWorld.x - dx;
    const newY = origWorld.y - dy;
    const lng = (newX / scale) * 360 - 180;
    const n = Math.PI - (2 * Math.PI * newY) / scale;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    setCenter({
      lat: Math.max(-85, Math.min(85, lat)),
      lng: ((lng + 540) % 360) - 180,
    });
  };

  const handlePointerUp = () => {
    dragStateRef.current.active = false;
  };

  return (
    <div
      ref={containerRef}
      className="xl:col-span-5 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] overflow-hidden shadow-xs relative flex flex-col h-[690px]"
    >
      {/* Top Left Mode & Provider Controls */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1 p-0.5 bg-white/95 dark:bg-[#151D1A]/95 rounded-lg border border-gray-200/90 shadow-md backdrop-blur">
        <button
          type="button"
          onClick={() => onMapModeChange("map")}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
            mapMode === "map"
              ? "bg-[#171918] text-white shadow-xs"
              : "text-gray-600 dark:text-gray-400 hover:text-black"
          }`}
        >
          Map
        </button>
        <button
          type="button"
          onClick={() => onMapModeChange("satellite")}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
            mapMode === "satellite"
              ? "bg-[#171918] text-white shadow-xs"
              : "text-gray-600 dark:text-gray-400 hover:text-black"
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Top Right Map Toolbar */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSearchInArea}
          className="h-7.5 px-3 rounded-lg bg-white/95 dark:bg-[#151D1A]/95 text-gray-800 dark:text-gray-200 text-xs font-medium border border-gray-200/90 shadow-md backdrop-blur inline-flex items-center gap-1.5 hover:bg-white"
        >
          <input
            type="checkbox"
            checked={searchInArea}
            readOnly
            className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-0 cursor-pointer"
          />
          <span>Search in this area</span>
        </button>

        <button
          type="button"
          onClick={onDrawAreaClick}
          className="h-7.5 px-3 rounded-lg bg-white/95 dark:bg-[#151D1A]/95 text-gray-800 dark:text-gray-200 text-xs font-medium border border-gray-200/90 shadow-md backdrop-blur inline-flex items-center gap-1.5 hover:bg-white"
        >
          <Layers size={13} className="text-gray-600" />
          <span>Draw Area</span>
        </button>
      </div>

      {/* Google Maps Native Canvas (when NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY active & billing enabled) */}
      {hasGoogleBrowserKey && !googleFailed && (
        <div ref={googleMapContainerRef} className="absolute inset-0 w-full h-full z-10" />
      )}

      {/* Dynamic Live Slippy Map Tiles (OSM / Esri Satellite) */}
      {(!googleReady || googleFailed) && (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="flex-1 relative overflow-hidden bg-[#E5E3DF] cursor-grab active:cursor-grabbing select-none"
          data-testid="live-slippy-map"
        >
          {tiles.map((t) => (
            <img
              key={t.key}
              src={t.url}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: `${t.left}px`,
                top: `${t.top}px`,
                width: "256px",
                height: "256px",
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Real Geocoordinate Markers Projected Onto Slippy Canvas */}
          {businesses.map((biz) => {
            if (!biz.location?.lat || !biz.location?.lng) return null;
            const pt = latLngToWorldPx(biz.location.lat, biz.location.lng, zoom);
            const left = viewportSize.width / 2 + (pt.x - centerWorld.x);
            const top = viewportSize.height / 2 + (pt.y - centerWorld.y);
            if (left < -30 || left > viewportSize.width + 30 || top < -30 || top > viewportSize.height + 30) {
              return null;
            }
            const isSelected = selectedBusiness?.id === biz.id;
            const color = CATEGORY_PIN_COLOR[biz.category] || "#3B82F6";

            return (
              <button
                key={biz.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBusiness(biz.id);
                }}
                style={{ left: `${left}px`, top: `${top}px` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group focus:outline-none ${
                  isSelected ? "scale-125 z-30" : "hover:scale-110"
                }`}
                title={`${biz.name} (${biz.rating}★)`}
              >
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow-lg transition-transform"
                  style={{ backgroundColor: color }}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                </span>
                {isSelected && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 whitespace-nowrap px-2 py-0.5 rounded bg-[#171918] text-white text-[10px] font-bold shadow-md">
                    {biz.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Map Engine Attribution + Zoom Controls */}
      <div className="absolute bottom-11 right-3 z-30 flex flex-col bg-white/95 dark:bg-[#151D1A]/95 border border-gray-200 rounded-lg shadow-md overflow-hidden">
        <button
          type="button"
          onClick={() => setCenter(resolveDefaultCenter(city, businesses, selectedBusiness))}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 border-b border-gray-100"
          title="Recenter Map"
        >
          <Crosshair size={14} />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(18, z + 1))}
          className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 border-b border-gray-100"
          title="Zoom In"
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(4, z - 1))}
          className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100"
          title="Zoom Out"
        >
          <Minus size={14} />
        </button>
      </div>

      {/* Category Legend & Attribution Footer */}
      <div className="h-9 bg-white dark:bg-[#151D1A] border-t border-gray-100 dark:border-[#22302B] px-3 flex items-center justify-between text-[10px] text-gray-500 z-30 shrink-0">
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Restaurant
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F97316]" /> Cafe
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Gym
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Clinic/Hotel
          </span>
        </div>

        <span className="inline-flex items-center gap-1 font-medium shrink-0">
          <Globe size={11} className="text-emerald-600" />
          {googleReady && !googleFailed
            ? "Live Google Maps SDK"
            : mapMode === "satellite"
            ? "Live Satellite Tiles © Esri"
            : "Live Map Tiles © OpenStreetMap"}
        </span>
      </div>
    </div>
  );
}
