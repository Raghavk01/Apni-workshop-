import React, { useState, useMemo, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { WorkshopGarage } from "../../types";
import { RealGoogleMap } from "./RealGoogleMap";
import { InteractiveLeafletMap } from "./InteractiveLeafletMap";

// Indian tech, metropolitan and automotive hubs for quick 1-tap switching
const POPULAR_LOCATIONS = [
  { name: "Connaught Place, Central Delhi", lat: 28.6315, lng: 77.2167 },
  { name: "Saket, South Delhi", lat: 28.5245, lng: 77.2066 },
  { name: "Vasant Kunj, Delhi", lat: 28.5244, lng: 77.1565 },
  { name: "Dwarka, Delhi", lat: 28.5921, lng: 77.0460 },
  { name: "Rohini, Delhi", lat: 28.7166, lng: 77.1166 },
  { name: "Karol Bagh, Delhi", lat: 28.6514, lng: 77.1907 },
  { name: "Mayapuri Auto Hub, Delhi", lat: 28.6304, lng: 77.1177 },
  { name: "Noida Sector 18", lat: 28.5708, lng: 77.3260 },
  { name: "Gurugram Cyber City", lat: 28.4950, lng: 77.0895 },
  { name: "Faridabad", lat: 28.4089, lng: 77.3178 },
  { name: "Ghaziabad", lat: 28.6692, lng: 77.4538 },
  { name: "Bandra, Mumbai", lat: 19.0596, lng: 72.8295 },
  { name: "Andheri West, Mumbai", lat: 19.1363, lng: 72.8277 },
  { name: "Koramangala, Bengaluru", lat: 12.9352, lng: 77.6245 },
  { name: "Indiranagar, Bengaluru", lat: 12.9784, lng: 77.6408 },
  { name: "Hitec City, Hyderabad", lat: 17.4474, lng: 78.3762 },
  { name: "Baner, Pune", lat: 18.5590, lng: 73.7868 },
  { name: "Anna Nagar, Chennai", lat: 13.0850, lng: 80.2101 },
  { name: "SG Highway, Ahmedabad", lat: 23.0525, lng: 72.5204 },
  { name: "Malviya Nagar, Jaipur", lat: 26.8530, lng: 75.8050 },
  { name: "Sector 17, Chandigarh", lat: 30.7398, lng: 76.7827 },
];

interface GoogleMapsWorkshopFinderProps {
  onSelectWorkshop?: (garage: WorkshopGarage) => void;
  compact?: boolean;
}

export const GoogleMapsWorkshopFinder: React.FC<GoogleMapsWorkshopFinderProps> = ({
  onSelectWorkshop,
  compact = false,
}) => {
  const {
    userLocation,
    detectUserLocation,
    setUserLocationManual,
    searchLocationManual,
    nearbyWorkshops,
    isSearchingWorkshops,
    selectedGarage,
    setSelectedGarage,
    setCurrentScreen,
    showToast,
    googleMapsApiKey,
    openModal,
  } = useApp();

  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(5.0);
  const [minRating, setMinRating] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [mapType, setMapType] = useState<"google" | "streets" | "radar">("streets");
  const [activeMarkerGarage, setActiveMarkerGarage] = useState<WorkshopGarage | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [locationModalQuery, setLocationModalQuery] = useState<string>("");
  const [isSearchingLocationModal, setIsSearchingLocationModal] = useState<boolean>(false);

  // Intercept Google Maps Auth / Referrer Not Allowed errors safely
  React.useEffect(() => {
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      if (typeof prevAuthFailure === "function") {
        try {
          prevAuthFailure();
        } catch (e) {}
      }
    };

    return () => {
      (window as any).gm_authFailure = prevAuthFailure;
    };
  }, []);

  // Filter workshops based on radius and star rating
  const filteredWorkshops = useMemo(() => {
    return nearbyWorkshops
      .filter((w) => {
        const matchesRadius = w.distanceKm <= selectedRadiusKm;
        const matchesRating = minRating === 0 || w.rating >= minRating;
        const matchesSearch =
          !searchQuery.trim() ||
          w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.locationArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (w.specialistTag && w.specialistTag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesRadius && matchesRating && matchesSearch;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [nearbyWorkshops, selectedRadiusKm, minRating, searchQuery]);

  // Anti-collision decluttered radar pins layout
  const radarPins = useMemo(() => {
    if (!filteredWorkshops.length) return [];

    const maxR = Math.max(selectedRadiusKm, 2.0);

    // Initial polar coordinate projection
    const initialPoints = filteredWorkshops.map((garage, idx) => {
      let dLat = (garage.lat ?? userLocation.lat) - userLocation.lat;
      let dLng = (garage.lng ?? userLocation.lng) - userLocation.lng;

      // If lat/lng identical to user or missing, synthesize natural spread around user based on idx
      if (Math.abs(dLat) < 0.0001 && Math.abs(dLng) < 0.0001) {
        const synthAngle = (idx / filteredWorkshops.length) * 2 * Math.PI;
        const synthDistKm = garage.distanceKm || (0.8 + idx * 0.7);
        dLat = (synthDistKm / 110.57) * Math.sin(synthAngle);
        dLng = (synthDistKm / (111.32 * Math.cos((userLocation.lat * Math.PI) / 180))) * Math.cos(synthAngle);
      }

      const dLatKm = dLat * 110.57;
      const dLngKm = dLng * (111.32 * Math.cos((userLocation.lat * Math.PI) / 180));
      let distKm = Math.hypot(dLatKm, dLngKm);
      if (distKm < 0.2 && garage.distanceKm) {
        distKm = garage.distanceKm;
      }

      let angle = Math.atan2(dLatKm, dLngKm);

      // Distance mapping:
      // Minimum radius is 23% (comfortably clear of the center 32px user circle which is ~14% radius)
      // Maximum radius is 42% (inside outer perimeter 44%)
      const normDist = Math.min(1, Math.max(0.05, distKm / maxR));
      const rPercent = 23 + normDist * 19; // spans 24% to 42%

      return {
        garage,
        x: 50 + rPercent * Math.cos(angle),
        y: 50 - rPercent * Math.sin(angle),
        distKm,
      };
    });

    // Relaxation passes to resolve collisions between pin positions
    const resolved = initialPoints.map((p) => ({ ...p }));
    const iterations = 12;
    const minDist = 12.0; // Minimum percentage distance between pin anchors (~42px)

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < resolved.length; i++) {
        for (let j = i + 1; j < resolved.length; j++) {
          const dx = resolved[i].x - resolved[j].x;
          const dy = resolved[i].y - resolved[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < minDist) {
            const overlap = (minDist - (dist || 0.01)) / 2;
            const nx = (dx || 0.01) / (dist || 0.01);
            const ny = (dy || 0.01) / (dist || 0.01);
            resolved[i].x += nx * overlap;
            resolved[i].y += ny * overlap;
            resolved[j].x -= nx * overlap;
            resolved[j].y -= ny * overlap;
          }
        }
      }

      // Constrain points to radar bounds and clear zones
      for (const p of resolved) {
        const cDist = Math.hypot(p.x - 50, p.y - 50);
        // Keep clear of center user vehicle beacon (r >= 22%)
        if (cDist < 22) {
          const scale = 22 / (cDist || 1);
          p.x = 50 + (p.x - 50) * scale;
          p.y = 50 + (p.y - 50) * scale;
        }
        // Keep within outer circle boundary (r <= 43%)
        if (cDist > 43) {
          const scale = 43 / cDist;
          p.x = 50 + (p.x - 50) * scale;
          p.y = 50 + (p.y - 50) * scale;
        }
        // Keep clear of the bottom card zone (y <= 74% when near center horizontal)
        if (p.y > 74 && p.x > 16 && p.x < 84) {
          p.y = 73;
        }
        // Keep clear of the top HUD pill
        if (p.y < 16 && p.x < 48) {
          p.y = 18;
        }
      }
    }

    return resolved;
  }, [filteredWorkshops, userLocation, selectedRadiusKm]);

  const handleSelectWorkshop = useCallback(
    (garage: WorkshopGarage) => {
      setSelectedGarage(garage);
      setActiveMarkerGarage(garage);
      showToast(`Selected ${garage.name} (${garage.distanceKm} km away • ${garage.rating}★)`);
      if (onSelectWorkshop) {
        onSelectWorkshop(garage);
      } else {
        setCurrentScreen("customer_book_package");
      }
    },
    [setSelectedGarage, showToast, onSelectWorkshop, setCurrentScreen]
  );

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if matching any popular locations first
    const matched = POPULAR_LOCATIONS.find((loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (matched) {
      await setUserLocationManual(matched.lat, matched.lng, matched.name);
      setSearchQuery("");
      return;
    }

    // Call live geocoding search
    const found = await searchLocationManual(searchQuery.trim());
    if (found) {
      setSearchQuery("");
    }
  };

  return (
    <div className="bg-[#ffffff] rounded-3xl border border-[#e4e3db] shadow-xs overflow-hidden space-y-3 p-4 sm:p-5">
      {/* 1. Header: Live Network & Current Location */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0eee6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0d631b] animate-pulse"></span>
            <h3 className="font-bold text-[16px] text-[#1b1c17] leading-tight flex items-center gap-1.5">
              <span>Google Maps Workshop Finder</span>
            </h3>
            <span className="text-[10px] font-black uppercase bg-[#cbffc2] text-[#005312] px-2 py-0.5 rounded-full tracking-wide">
              Live Network
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#707a6c] mt-1 flex-wrap">
            <span className="material-symbols-outlined text-[15px] text-[#0d631b]">pin_drop</span>
            <span className="font-semibold text-[#1b1c17]">{userLocation.areaName}</span>
            <button
              type="button"
              onClick={() => openModal("locationPicker")}
              className="ml-1 px-2.5 py-0.5 rounded-lg bg-[#e8f5e9] hover:bg-[#c8e6c9] text-[#0d631b] font-bold text-[11px] flex items-center gap-1 border border-[#a5d6a7] cursor-pointer transition-colors"
              title="Change your search location or select a specific area on the map"
            >
              <span>Change / Pin Area</span>
              <span className="material-symbols-outlined text-[13px]">edit_location_alt</span>
            </button>
            <span>•</span>
            <span className="text-[#0d631b] font-medium">
              {filteredWorkshops.length} verified {filteredWorkshops.length === 1 ? "garage" : "garages"} within {selectedRadiusKm} km
            </span>
          </div>
        </div>

        {/* View Switcher: Map vs List */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-[#f6f4ec] p-1 rounded-xl border border-[#e4e3db]">
            <button
              onClick={() => setViewMode("map")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                viewMode === "map"
                  ? "bg-white text-[#0d631b] shadow-2xs"
                  : "text-[#707a6c] hover:text-[#1b1c17]"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">map</span>
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                viewMode === "list"
                  ? "bg-white text-[#0d631b] shadow-2xs"
                  : "text-[#707a6c] hover:text-[#1b1c17]"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">format_list_bulleted</span>
              <span>List ({filteredWorkshops.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Ask User for Location Prompt Banner */}
      <div className="bg-gradient-to-r from-[#f0f8ef] via-[#e8f5e9] to-[#f4faf4] rounded-2xl p-3 sm:p-3.5 border border-[#c8e6c9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0d631b] text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
            <span className="material-symbols-outlined text-[20px]">my_location</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[13px] text-[#0d631b]">Share Your Location</span>
              {userLocation.permissionGranted && (
                <span className="text-[10px] font-bold bg-[#cbffc2] text-[#005312] px-1.5 py-0.2 rounded">
                  GPS Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#2e4c27] mt-0.5 leading-snug">
              Allow location access so we can suggest verified automotive workshops closest to you with live bay cameras.
            </p>
          </div>
        </div>

        <button
          onClick={() => detectUserLocation({ forceFresh: true })}
          disabled={userLocation.isLocating}
          className="px-4 py-2 rounded-xl bg-[#0d631b] hover:bg-[#005312] text-white text-[12px] font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 disabled:opacity-60 cursor-pointer"
        >
          {userLocation.isLocating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Detecting GPS...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">near_me</span>
              <span>Detect My Location</span>
            </>
          )}
        </button>
      </div>

      {/* 3. Quick City Chips + Search */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#707a6c] uppercase tracking-wider">
            Quick Cities or Custom Search:
          </span>
          {isSearchingWorkshops && (
            <span className="text-[11px] text-[#0d631b] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#0d631b] animate-ping"></span>
              Refreshing workshops...
            </span>
          )}
        </div>

        {/* Quick Location Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {POPULAR_LOCATIONS.map((loc) => {
            const isCurrent =
              Math.abs(userLocation.lat - loc.lat) < 0.05 &&
              Math.abs(userLocation.lng - loc.lng) < 0.05;

            return (
              <button
                key={loc.name}
                onClick={() => setUserLocationManual(loc.lat, loc.lng, loc.name)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border flex items-center gap-1 ${
                  isCurrent
                    ? "bg-[#0d631b] text-white border-[#0d631b] shadow-2xs"
                    : "bg-[#f6f4ec] text-[#40493d] border-[#e4e3db] hover:border-[#0d631b] hover:bg-white"
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">location_city</span>
                <span>{loc.name.split(",")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Radius row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-2 relative">
            <span className="material-symbols-outlined text-[16px] text-[#707a6c] absolute left-3 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              type="text"
              placeholder="Search garage name, area, or car brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 rounded-xl bg-[#f6f4ec] border border-[#e4e3db] text-[12px] text-[#1b1c17] placeholder-[#707a6c] focus:outline-none focus:border-[#0d631b] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#707a6c] hover:text-[#1b1c17]"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            )}
          </form>

          {/* Radius selector */}
          <div className="flex items-center justify-between bg-[#f6f4ec] px-2 py-1 rounded-xl border border-[#e4e3db]">
            <span className="text-[10px] font-bold text-[#707a6c] uppercase">Radius:</span>
            <div className="flex items-center gap-1">
              {[3.0, 5.0, 10.0].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRadiusKm(r)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                    selectedRadiusKm === r
                      ? "bg-[#0d631b] text-white shadow-2xs"
                      : "text-[#40493d] hover:bg-white"
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Star Rating Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          <span className="text-[#707a6c] font-bold whitespace-nowrap">Stars:</span>
          {[
            { label: "All", val: 0 },
            { label: "4.0+ ★", val: 4.0 },
            { label: "4.5+ ★", val: 4.5 },
            { label: "4.8+ ★ Top", val: 4.8 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setMinRating(item.val)}
              className={`px-2 py-0.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                minRating === item.val
                  ? "bg-[#d97706] text-white shadow-2xs"
                  : "bg-[#f6f4ec] text-[#40493d] hover:bg-[#eae8e0]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Interactive Live Workshop Map / Radar Container */}
      {viewMode === "map" && (
        <div className="space-y-2">
          {/* Map Header Controls & View Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-1.5 bg-[#f6f4ec] p-1 rounded-xl border border-[#e4e3db]">
              <button
                onClick={() => setMapType("google")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mapType === "google"
                    ? "bg-white text-[#0d631b] shadow-2xs font-extrabold"
                    : "text-[#707a6c] hover:text-[#1b1c17]"
                }`}
              >
                <span className="material-symbols-outlined text-[15px] text-[#4285f4]">map</span>
                <span>Google Map</span>
              </button>
              <button
                onClick={() => setMapType("streets")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mapType === "streets"
                    ? "bg-white text-[#0d631b] shadow-2xs font-extrabold"
                    : "text-[#707a6c] hover:text-[#1b1c17]"
                }`}
              >
                <span className="material-symbols-outlined text-[15px] text-[#0d631b]">explore</span>
                <span>Street Map</span>
              </button>
              <button
                onClick={() => setMapType("radar")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mapType === "radar"
                    ? "bg-[#111a13] text-[#4ade80] shadow-2xs font-extrabold"
                    : "text-[#707a6c] hover:text-[#1b1c17]"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">radar</span>
                <span>Radar</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => detectUserLocation({ forceFresh: true })}
                className="px-2.5 py-1 bg-[#f0eee6] hover:bg-[#e4e3db] text-[#0d631b] rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Re-center on my location"
              >
                <span className="material-symbols-outlined text-[14px]">my_location</span>
                <span>Recenter</span>
              </button>
              <a
                href={`https://www.google.com/maps/search/car+repair+workshop/@${userLocation.lat},${userLocation.lng},14z`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-[#0d631b] hover:bg-[#005312] text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                title="Open full area in Google Maps"
              >
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                <span>Google Maps</span>
              </a>
            </div>
          </div>

          {/* Explicit height wrapper for Map / Radar Canvas */}
          <div
            id="google-maps-workshop-container"
            className="w-full h-[400px] sm:h-[450px] rounded-2xl overflow-hidden border border-[#e4e3db] shadow-inner relative bg-[#f6f4ec]"
          >
            {mapType === "google" && (
              <RealGoogleMap
                apiKey={googleMapsApiKey}
                userLocation={userLocation}
                workshops={filteredWorkshops}
                selectedGarage={selectedGarage}
                onSelectWorkshop={handleSelectWorkshop}
                onBookWorkshop={(garage) => {
                  handleSelectWorkshop(garage);
                  setCurrentScreen("customer_book_package");
                }}
              />
            )}

            {mapType === "streets" && (
              <InteractiveLeafletMap
                userLocation={userLocation}
                workshops={filteredWorkshops}
                selectedGarage={selectedGarage}
                onSelectWorkshop={handleSelectWorkshop}
                onBookWorkshop={(garage) => {
                  handleSelectWorkshop(garage);
                  setCurrentScreen("customer_book_package");
                }}
                onSetUserLocation={(lat, lng) => {
                  setUserLocationManual(
                    lat,
                    lng,
                    "Custom Pinned Location",
                    `Coordinates: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`
                  );
                }}
              />
            )}

            {mapType === "radar" && (
              <>
                {/* High-Precision Automotive Telematics Radar & Vector Grid */}
                <div className="w-full h-full bg-[#111a13] text-white relative overflow-hidden flex items-center justify-center select-none">
                  {/* Tactical Radar Grid Background */}
                  <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="radarGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#38703e" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#radarGrid)" />

                    {/* Concentric Distance Rings */}
                    <circle cx="50%" cy="50%" r="22%" fill="none" stroke="#4ade80" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                    <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#4ade80" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.6" />
                    <circle cx="50%" cy="50%" r="44%" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.8" />

                    {/* Compass Axis Crosshairs */}
                    <line x1="50%" y1="6%" x2="50%" y2="94%" stroke="#4ade80" strokeWidth="1" opacity="0.4" />
                    <line x1="6%" y1="50%" x2="94%" y2="50%" stroke="#4ade80" strokeWidth="1" opacity="0.4" />
                  </svg>

                  {/* Sweeping Radar Beam Animation */}
                  <div className="absolute w-72 h-72 rounded-full pointer-events-none opacity-20 bg-[conic-gradient(from_0deg,#4ade80,transparent_60deg)] animate-[spin_6s_linear_infinite]"></div>

                  {/* Concentric Range Distance Labels */}
                  <span className="absolute top-[38%] left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-[#86efac]/70 pointer-events-none">
                    {(selectedRadiusKm * 0.4).toFixed(1)} km
                  </span>
                  <span className="absolute top-[26%] left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-[#86efac]/70 pointer-events-none">
                    {(selectedRadiusKm * 0.7).toFixed(1)} km
                  </span>
                  <span className="absolute top-[17%] left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-[#86efac]/90 pointer-events-none">
                    {selectedRadiusKm} km Perimeter
                  </span>

                  {/* Compass Direction Labels */}
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-[#4ade80]/60">N</span>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-[#4ade80]/60">S</span>
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-[#4ade80]/60">W</span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-[#4ade80]/60">E</span>

                  {/* Center User Location Beacon */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-15 flex flex-col items-center pointer-events-none">
                    <div className="relative flex items-center justify-center">
                      <span className="w-9 h-9 rounded-full bg-[#3b82f6]/25 animate-ping absolute"></span>
                      <span className="w-7 h-7 rounded-full bg-[#3b82f6]/40 absolute"></span>
                      <div className="w-7 h-7 rounded-full bg-[#1d4ed8] border-2 border-white shadow-xl flex items-center justify-center text-white z-10">
                        <span className="material-symbols-outlined text-[15px]">directions_car</span>
                      </div>
                    </div>
                    <span className="mt-0.5 px-1.5 py-0.2 bg-black/75 backdrop-blur-xs rounded-full border border-white/20 text-[8px] font-bold text-white tracking-wider">
                      YOU
                    </span>
                  </div>

                  {/* Anti-collision Decluttered Workshop Radar Pins */}
                  {radarPins.map(({ garage, x, y, distKm }) => {
                    const isSelected = selectedGarage?.id === garage.id;

                    if (isSelected) {
                      return (
                        <button
                          key={garage.id}
                          onClick={() => handleSelectWorkshop(garage)}
                          style={{ left: `${x}%`, top: `${y}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-40 transition-all cursor-pointer group"
                        >
                          {/* Pulsing halo */}
                          <span className="w-12 h-12 rounded-full bg-[#4ade80]/30 animate-ping absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 pointer-events-none"></span>

                          <div className="relative flex flex-col items-center">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold shadow-2xl border-2 border-[#86efac] bg-[#0d631b] text-white ring-4 ring-[#4ade80]/30 whitespace-nowrap">
                              <span className="text-[#facc15] drop-shadow-xs">★</span>
                              <span>{garage.rating}</span>
                              <span className="opacity-95 text-[10px] font-semibold">({distKm.toFixed(1)}km)</span>
                            </div>
                            <div className="w-2.5 h-2.5 rotate-45 -mt-1 bg-[#0d631b] border-r-2 border-b-2 border-[#86efac]"></div>
                          </div>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={garage.id}
                        onClick={() => handleSelectWorkshop(garage)}
                        style={{ left: `${x}%`, top: `${y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 hover:z-35 transition-all hover:scale-115 cursor-pointer group"
                      >
                        <div className="relative flex flex-col items-center">
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-md border border-[#86efac]/80 bg-white/95 text-[#111a13] group-hover:bg-[#dcfce7] group-hover:border-[#0d631b] transition-all whitespace-nowrap">
                            <span className="text-[#f59e0b]">★</span>
                            <span>{garage.rating}</span>
                            <span className="text-[9px] text-[#4b5563] hidden group-hover:inline">
                              ({distKm.toFixed(1)}km)
                            </span>
                          </div>
                          <div className="w-1.5 h-1.5 rotate-45 -mt-1 bg-white/95 border-r border-b border-[#86efac]/80 group-hover:bg-[#dcfce7] group-hover:border-[#0d631b]"></div>
                        </div>
                      </button>
                    );
                  })}

                  {/* Floating Active Garage Card on Radar */}
                  {selectedGarage && (
                    <div className="absolute bottom-3 inset-x-3 sm:inset-x-8 z-30 bg-[#ffffff]/95 backdrop-blur-md text-[#1b1c17] p-2.5 rounded-2xl border border-[#c8e6c9] shadow-xl flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-[12px] truncate text-[#1b1c17]">
                            {selectedGarage.name}
                          </h4>
                          <span className="bg-[#fff8e1] px-1.5 py-0.2 rounded text-[10px] font-bold text-[#b45309] flex-shrink-0">
                            ★ {selectedGarage.rating}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#707a6c] truncate mt-0.5">
                          <strong className="text-[#0d631b]">{selectedGarage.distanceKm} km</strong> away • ~{selectedGarage.etaMins}m ETA • {selectedGarage.locationArea}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${
                            selectedGarage.lat || userLocation.lat
                          },${selectedGarage.lng || userLocation.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-[#f0eee6] hover:bg-[#e4e3db] text-[#1b1c17] text-[10px] font-bold rounded-xl flex items-center gap-1 transition-colors"
                          title="Open directions in Google Maps"
                        >
                          <span className="material-symbols-outlined text-[13px]">directions</span>
                          <span>Nav</span>
                        </a>
                        <button
                          onClick={() => {
                            handleSelectWorkshop(selectedGarage);
                            setCurrentScreen("customer_book_package");
                          }}
                          className="px-3.5 py-1.5 bg-[#0d631b] hover:bg-[#005312] text-white text-[11px] font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Map HUD Overlay Pill */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-[#e4e3db] flex items-center gap-2 z-10">
                  <span className="material-symbols-outlined text-[16px] text-[#0d631b]">pin_drop</span>
                  <span className="text-[11px] font-bold text-[#1b1c17]">
                    {filteredWorkshops.length} Garages on Map
                  </span>
                </div>

                {/* Quick Zoom & GPS Controls on Radar */}
                <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-30">
                  <button
                    onClick={() => setSelectedRadiusKm((r) => Math.max(2.0, Math.round((r - 1.5) * 10) / 10))}
                    title="Zoom In (Decrease Perimeter)"
                    className="w-7 h-7 rounded-lg bg-black/65 hover:bg-black/85 backdrop-blur-md text-white border border-white/20 flex items-center justify-center text-sm font-bold shadow-md cursor-pointer transition-colors active:scale-95"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setSelectedRadiusKm((r) => Math.min(25.0, Math.round((r + 2.0) * 10) / 10))}
                    title="Zoom Out (Increase Perimeter)"
                    className="w-7 h-7 rounded-lg bg-black/65 hover:bg-black/85 backdrop-blur-md text-white border border-white/20 flex items-center justify-center text-sm font-bold shadow-md cursor-pointer transition-colors active:scale-95"
                  >
                    −
                  </button>
                  <button
                    onClick={() => detectUserLocation({ forceFresh: true })}
                    title="Center on My GPS Location"
                    className="w-7 h-7 rounded-lg bg-white hover:bg-[#f6f4ec] text-[#0d631b] border border-[#e4e3db] flex items-center justify-center shadow-md cursor-pointer transition-colors active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">my_location</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. Workshop Cards List (Synced with Map Selection) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[12px] pt-1">
          <span className="font-bold text-[#1b1c17]">
            Workshops Sorted by Distance ({filteredWorkshops.length})
          </span>
          <span className="text-[11px] text-[#707a6c]">Click card to select & book</span>
        </div>

        {filteredWorkshops.length === 0 ? (
          <div className="p-6 text-center bg-[#f6f4ec] rounded-2xl border border-dashed border-[#e4e3db] space-y-2">
            <span className="material-symbols-outlined text-[#707a6c] text-[32px]">search_off</span>
            <p className="text-[13px] font-bold text-[#1b1c17]">No workshops found within {selectedRadiusKm} km</p>
            <p className="text-[11px] text-[#707a6c]">
              Try expanding the radius to 10 km or resetting the star rating filters.
            </p>
            <button
              onClick={() => {
                setSelectedRadiusKm(10.0);
                setMinRating(0);
                setSearchQuery("");
              }}
              className="px-4 py-1.5 bg-[#0d631b] text-white text-[12px] font-bold rounded-xl"
            >
              Show 10 km Radius
            </button>
          </div>
        ) : (
          filteredWorkshops.map((garage) => {
            const isSelected = selectedGarage?.id === garage.id;

            return (
              <div
                key={garage.id}
                onClick={() => handleSelectWorkshop(garage)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
                  isSelected
                    ? "bg-[#f0f8ef] border-[#0d631b] shadow-xs"
                    : "bg-[#ffffff] border-[#e4e3db] hover:border-[#0d631b] hover:shadow-2xs"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Image & Distance Tag */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f0eee6] flex-shrink-0 border border-[#e4e3db] relative">
                    <img
                      src={garage.imageUrl}
                      alt={garage.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] font-bold text-center py-0.5">
                      {garage.distanceKm} km
                    </span>
                  </div>

                  {/* Information Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-[13px] text-[#1b1c17] leading-snug group-hover:text-[#0d631b] transition-colors truncate">
                          {garage.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-[#707a6c] mt-0.5">
                          <span>{garage.locationArea}</span>
                          <span>•</span>
                          <span className="text-[#0d631b] font-medium">~{garage.etaMins}m ETA</span>
                        </div>
                      </div>

                      {/* Star Rating Badge */}
                      <div className="flex items-center gap-1 bg-[#fff8e1] px-2 py-0.5 rounded-lg border border-[#ffecb3] flex-shrink-0">
                        <span className="material-symbols-outlined text-[14px] text-[#d97706]">grade</span>
                        <span className="font-extrabold text-[12px] text-[#b45309]">{garage.rating}</span>
                        <span className="text-[10px] text-[#78350f]">({garage.reviewCount})</span>
                      </div>
                    </div>

                    {/* Secondary tags */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {garage.liveBaysAvailable && (
                        <span className="text-[10px] font-bold text-[#0d631b] bg-[#cbffc2] px-1.5 py-0.5 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0d631b]"></span>
                          {garage.liveBaysAvailable} Live Bays Open
                        </span>
                      )}
                      {garage.specialistTag && (
                        <span className="text-[10px] font-medium text-[#5c3e00] bg-[#ffecb3] px-1.5 py-0.5 rounded truncate max-w-[150px]">
                          {garage.specialistTag}
                        </span>
                      )}
                      {garage.address && (
                        <span className="text-[9px] text-[#707a6c] truncate max-w-[200px] hidden sm:inline">
                          {garage.address}
                        </span>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-2.5 pt-2 border-t border-[#f0eee6] flex items-center justify-between">
                      <div className="text-[11px] text-[#707a6c]">
                        Starting from <strong className="text-[#0d631b] font-numeric-plate">₹{garage.price}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Open in Google Maps directions link */}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${
                            garage.lat || userLocation.lat
                          },${garage.lng || userLocation.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1 rounded-lg bg-[#f0eee6] text-[#40493d] hover:bg-[#e4e3db] text-[10px] font-bold flex items-center gap-1"
                          title="Open directions in Google Maps"
                        >
                          <span className="material-symbols-outlined text-[12px]">directions</span>
                          <span>Directions</span>
                        </a>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectWorkshop(garage);
                          }}
                          className="px-3 py-1 rounded-xl bg-[#0d631b] text-white text-[11px] font-bold hover:bg-[#005312] shadow-2xs flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <span>{isSelected ? "Selected" : "Select Workshop"}</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Location Selection Modal */}
      {showLocationModal && (
        <div
          id="location-picker-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowLocationModal(false)}
        >
          <div
            className="bg-white rounded-3xl border border-[#e4e3db] shadow-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#f0eee6]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0d631b] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">edit_location</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[16px] text-[#1b1c17] leading-tight">
                      Set Your Search Location
                    </h3>
                    <p className="text-[11px] text-[#707a6c] mt-0.5">
                      Ensure workshops and distance estimates are accurate to your location
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 rounded-xl bg-[#f6f4ec] hover:bg-[#e4e3db] text-[#40493d] flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Current Active Location Display */}
            <div className="bg-[#f6f4ec] rounded-2xl p-3 border border-[#e4e3db] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#707a6c]">
                  Currently Selected Area
                </span>
                <div className="font-extrabold text-[13px] text-[#0d631b] truncate mt-0.5">
                  {userLocation.areaName}
                </div>
                <div className="text-[11px] text-[#40493d] truncate">
                  {userLocation.address || userLocation.areaName}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#cbffc2] text-[#005312] text-[10px] font-extrabold flex-shrink-0">
                {userLocation.permissionGranted ? "GPS Active" : "Area Selected"}
              </span>
            </div>

            {/* GPS Auto-Detect Button */}
            <button
              type="button"
              onClick={async () => {
                await detectUserLocation();
                setShowLocationModal(false);
              }}
              disabled={userLocation.isLocating}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0d631b] hover:bg-[#005312] text-white font-bold text-[13px] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-60"
            >
              {userLocation.isLocating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Detecting Precise GPS...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">near_me</span>
                  <span>Use Live Device GPS (High Accuracy)</span>
                </>
              )}
            </button>

            {/* Manual Colony / Area Search */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-[#40493d] uppercase tracking-wider">
                Or Search Any Colony, Sector, or Landmark
              </label>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!locationModalQuery.trim()) return;
                  setIsSearchingLocationModal(true);
                  const matched = POPULAR_LOCATIONS.find((loc) =>
                    loc.name.toLowerCase().includes(locationModalQuery.toLowerCase())
                  );
                  if (matched) {
                    await setUserLocationManual(matched.lat, matched.lng, matched.name);
                    setIsSearchingLocationModal(false);
                    setShowLocationModal(false);
                    setLocationModalQuery("");
                    return;
                  }
                  const success = await searchLocationManual(locationModalQuery.trim());
                  setIsSearchingLocationModal(false);
                  if (success) {
                    setShowLocationModal(false);
                    setLocationModalQuery("");
                  }
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <span className="material-symbols-outlined text-[16px] text-[#707a6c] absolute left-3 top-1/2 -translate-y-1/2">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Saket, Rohini Sector 11, DLF Cyber City..."
                    value={locationModalQuery}
                    onChange={(e) => setLocationModalQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#f6f4ec] border border-[#e4e3db] text-[12px] text-[#1b1c17] placeholder-[#707a6c] focus:outline-none focus:border-[#0d631b] focus:bg-white transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingLocationModal || !locationModalQuery.trim()}
                  className="px-4 py-2 rounded-xl bg-[#1b1c17] hover:bg-black text-white text-[12px] font-bold transition-all disabled:opacity-50 cursor-pointer flex-shrink-0"
                >
                  {isSearchingLocationModal ? "Finding..." : "Find"}
                </button>
              </form>
            </div>

            {/* Quick 1-Tap Popular Automotive Areas */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#40493d] uppercase tracking-wider">
                  Select Popular Automotive Hubs
                </span>
                <span className="text-[10px] text-[#707a6c]">1-Tap Select</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {POPULAR_LOCATIONS.map((loc) => {
                  const isSelected =
                    Math.abs(userLocation.lat - loc.lat) < 0.03 &&
                    Math.abs(userLocation.lng - loc.lng) < 0.03;

                  return (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={async () => {
                        await setUserLocationManual(loc.lat, loc.lng, loc.name);
                        setShowLocationModal(false);
                      }}
                      className={`p-2 rounded-xl text-left text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-between gap-1 ${
                        isSelected
                          ? "bg-[#0d631b] text-white border-[#0d631b] shadow-2xs"
                          : "bg-[#f6f4ec] text-[#1b1c17] border-[#e4e3db] hover:border-[#0d631b] hover:bg-white"
                      }`}
                    >
                      <span className="truncate">{loc.name.split(",")[0]}</span>
                      {isSelected ? (
                        <span className="material-symbols-outlined text-[13px] flex-shrink-0">
                          check_circle
                        </span>
                      ) : (
                        <span className="text-[9.5px] text-[#707a6c] flex-shrink-0">
                          {loc.name.split(",")[1] || ""}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Street Map Pin Drop Hint */}
            <div className="pt-2 border-t border-[#f0eee6] flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1 text-[#707a6c]">
                <span className="material-symbols-outlined text-[15px] text-[#0d631b]">
                  touch_app
                </span>
                <span>Want to pinpoint on map?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setViewMode("map");
                  setMapType("streets");
                  setShowLocationModal(false);
                }}
                className="font-bold text-[#0d631b] hover:underline cursor-pointer"
              >
                Tap on Street Map →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
