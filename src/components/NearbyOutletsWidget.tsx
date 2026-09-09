import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { WorkshopGarage } from "../types";

export const NearbyOutletsWidget: React.FC = () => {
  const {
    nearbyWorkshops,
    userLocation,
    selectedGarage,
    setSelectedGarage,
    setCurrentScreen,
    showToast,
  } = useApp();

  // Selected radius: default 5.0 km
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(5.0);

  // Selected star rating filter: "all" | 4.0 | 4.5 | 4.8
  const [minRating, setMinRating] = useState<number>(0);

  // View mode: "list" | "radar"
  const [viewMode, setViewMode] = useState<"list" | "radar">("list");

  // Filter garages by radius and star rating
  const filteredGarages = useMemo(() => {
    return nearbyWorkshops
      .filter((g) => g.distanceKm <= selectedRadiusKm && (minRating === 0 || g.rating >= minRating))
      .sort((a, b) => {
        if (minRating > 0) {
          return b.rating - a.rating || a.distanceKm - b.distanceKm;
        }
        return a.distanceKm - b.distanceKm;
      });
  }, [nearbyWorkshops, selectedRadiusKm, minRating]);

  // Outlets within selected radius total count
  const totalWithinRadius = useMemo(() => {
    return nearbyWorkshops.filter((g) => g.distanceKm <= selectedRadiusKm).length;
  }, [nearbyWorkshops, selectedRadiusKm]);

  const handleSelectGarage = (garage: WorkshopGarage) => {
    setSelectedGarage(garage);
    showToast(`${garage.name} selected! (${garage.distanceKm} km away • ${garage.rating}★)`);
    setCurrentScreen("customer_book_package");
  };

  const ratingFilters = [
    { label: "All Ratings", value: 0, count: nearbyWorkshops.filter((g) => g.distanceKm <= selectedRadiusKm).length },
    { label: "4.0+ ★", value: 4.0, count: nearbyWorkshops.filter((g) => g.distanceKm <= selectedRadiusKm && g.rating >= 4.0).length },
    { label: "4.5+ ★ Highly Rated", value: 4.5, count: nearbyWorkshops.filter((g) => g.distanceKm <= selectedRadiusKm && g.rating >= 4.5).length },
    { label: "4.8+ ★ Top Rated", value: 4.8, count: nearbyWorkshops.filter((g) => g.distanceKm <= selectedRadiusKm && g.rating >= 4.8).length },
  ];

  return (
    <div className="bg-[#ffffff] rounded-3xl p-4 sm:p-5 border border-[#e4e3db] shadow-xs space-y-4">
      {/* Header: Location, Total Outlets Count within 3km */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#f0eee6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0d631b] animate-pulse"></span>
            <h3 className="font-bold text-[16px] text-[#1b1c17] leading-tight">
              Workshop Outlets Near You
            </h3>
            <span className="text-[10px] font-black uppercase bg-[#cbffc2] text-[#005312] px-2 py-0.5 rounded-full tracking-wide">
              Live Network
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#707a6c] mt-1">
            <span className="material-symbols-outlined text-[14px] text-[#0d631b]">location_on</span>
            <span className="font-semibold text-[#40493d]">Vasant Kunj / South Delhi</span>
            <span>•</span>
            <span>Within {selectedRadiusKm} km radius</span>
          </div>
        </div>

        {/* Dynamic Outlets Count Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-[#f0f8ef] border border-[#c8e6c9] px-3 py-1.5 rounded-xl flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0d631b] text-white flex items-center justify-center font-bold text-[13px]">
              {filteredGarages.length}
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-extrabold text-[#0d631b] leading-tight">
                {filteredGarages.length === 1 ? "1 Outlet" : `${filteredGarages.length} Outlets`}
              </span>
              <span className="block text-[9px] text-[#2e4c27] font-medium">
                within {selectedRadiusKm} km
              </span>
            </div>
          </div>

          {/* View toggle (List vs Radar Map) */}
          <div className="flex items-center bg-[#f6f4ec] p-0.5 rounded-xl border border-[#e4e3db]">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-white text-[#0d631b] shadow-2xs" : "text-[#707a6c]"
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-[18px]">view_agenda</span>
            </button>
            <button
              onClick={() => setViewMode("radar")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "radar" ? "bg-white text-[#0d631b] shadow-2xs" : "text-[#707a6c]"
              }`}
              title="Radar / Map View"
            >
              <span className="material-symbols-outlined text-[18px]">radar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Select based on Star Rating - Prominent Rating Filter Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[12px] font-bold text-[#1b1c17] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#d97706] text-[18px]">star</span>
            <span>Filter by Workshop Star Rating:</span>
          </label>
          <span className="text-[11px] text-[#707a6c]">
            {minRating === 0 ? "Showing all ratings" : `Filtered: ${minRating}+ ★ rating`}
          </span>
        </div>

        {/* Star Rating Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {ratingFilters.map((rf) => {
            const isSelected = minRating === rf.value;
            return (
              <button
                key={rf.value}
                onClick={() => setMinRating(rf.value)}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-[#0d631b] text-white border-[#0d631b] shadow-sm scale-102"
                    : "bg-[#f6f4ec] text-[#40493d] border-[#e4e3db] hover:border-[#0d631b] hover:bg-[#ffffff]"
                }`}
              >
                {rf.value > 0 ? (
                  <span className={`material-symbols-outlined text-[14px] ${isSelected ? "text-yellow-300" : "text-[#d97706]"}`}>
                    grade
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[14px]">tune</span>
                )}
                <span>{rf.label}</span>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-[#e4e3db] text-[#40493d]"
                  }`}
                >
                  {rf.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Star Buttons Bar for quick tapping */}
        <div className="bg-[#fcfbf9] rounded-2xl p-2.5 border border-[#e4e3db] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-[#707a6c] font-medium mr-1">Tap stars to select:</span>
            {[3.0, 4.0, 4.5, 4.8].map((star) => (
              <button
                key={star}
                onClick={() => setMinRating(star === minRating ? 0 : star)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-0.5 transition-all ${
                  minRating === star
                    ? "bg-[#d97706] text-white shadow-2xs"
                    : "bg-white border border-[#e4e3db] text-[#40493d] hover:border-[#d97706]"
                }`}
              >
                <span>{star}</span>
                <span className="material-symbols-outlined text-[13px] text-yellow-400">star</span>
              </button>
            ))}
          </div>

          {/* Radius selector */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-[#707a6c]">Radius:</span>
            {[3.0, 5.0].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRadiusKm(r)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
                  selectedRadiusKm === r
                    ? "bg-[#0d631b] text-white"
                    : "bg-[#f0eee6] text-[#40493d] hover:bg-[#e4e3db]"
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Summary status message */}
      <div className="flex items-center justify-between text-[11px] text-[#40493d] bg-[#f0f8ef] px-3 py-2 rounded-xl border border-[#c8e6c9]">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#0d631b] text-[16px]">verified</span>
          <span>
            <strong>{filteredGarages.length} verified {filteredGarages.length === 1 ? "outlet" : "outlets"}</strong> found within <strong>{selectedRadiusKm} km</strong>
            {minRating > 0 && ` with ${minRating}+ ★ rating`}
          </span>
        </div>
        <button
          onClick={() => {
            setMinRating(0);
            setSelectedRadiusKm(3.0);
          }}
          className="text-[#0d631b] font-bold hover:underline"
        >
          Reset
        </button>
      </div>

      {/* Radar Map Visual Mode */}
      {viewMode === "radar" && (
        <div className="bg-[#1b271d] rounded-2xl p-4 text-white relative overflow-hidden border border-[#2d4030] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#91f78e] animate-ping"></span>
              <span className="font-bold text-[13px]">Live Workshop Radar ({selectedRadiusKm} km)</span>
            </div>
            <span className="text-[11px] text-[#91f78e] font-mono">{filteredGarages.length} in range</span>
          </div>

          {/* Concentric Radar Canvas Simulation */}
          <div className="h-52 rounded-xl bg-[#142016] relative flex items-center justify-center overflow-hidden border border-[#2d4030]">
            {/* Grid circles */}
            <div className="absolute w-44 h-44 rounded-full border border-dashed border-[#91f78e]/30 flex items-center justify-center">
              <span className="absolute top-1 text-[8px] text-[#91f78e]/60 font-mono">3.0 km perimeter</span>
            </div>
            <div className="absolute w-28 h-28 rounded-full border border-[#91f78e]/20 flex items-center justify-center">
              <span className="absolute top-1 text-[8px] text-[#91f78e]/40 font-mono">1.5 km</span>
            </div>
            <div className="absolute w-12 h-12 rounded-full border border-[#91f78e]/10"></div>

            {/* User Center Pin */}
            <div className="z-10 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-[#0d631b] border-2 border-white flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-[13px] text-white">person_pin</span>
              </div>
              <span className="text-[9px] font-bold text-white bg-black/60 px-1 rounded mt-0.5">You</span>
            </div>

            {/* Plotted Garages */}
            {filteredGarages.slice(0, 6).map((g, idx) => {
              // Calculate radar angles
              const angle = (idx * (360 / Math.max(filteredGarages.length, 1)) * Math.PI) / 180;
              const radiusPercent = (g.distanceKm / (selectedRadiusKm * 1.15)) * 40; // 0 to 40% from center
              const x = 50 + radiusPercent * Math.cos(angle);
              const y = 50 + radiusPercent * Math.sin(angle);

              return (
                <button
                  key={g.id}
                  onClick={() => handleSelectGarage(g)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
                >
                  <div className="flex items-center gap-1 bg-white text-[#1b1c17] px-1.5 py-0.5 rounded-lg shadow-md border border-[#cbffc2] group-hover:scale-110 group-hover:bg-[#cbffc2] transition-transform">
                    <span className="text-yellow-500 font-bold text-[10px]">★</span>
                    <span className="font-extrabold text-[10px]">{g.rating}</span>
                  </div>
                  <span className="text-[8px] font-medium text-white/80 block text-center truncate max-w-[70px] mt-0.5">
                    {g.name.split(" ")[0]} ({g.distanceKm}km)
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-white/60 text-center">
            Tap any radar pin above to select the workshop outlet directly.
          </p>
        </div>
      )}

      {/* Outlets List Cards */}
      <div className="space-y-2.5">
        {filteredGarages.length === 0 ? (
          <div className="p-6 text-center bg-[#f6f4ec] rounded-2xl border border-dashed border-[#e4e3db] space-y-2">
            <span className="material-symbols-outlined text-[#707a6c] text-[32px]">search_off</span>
            <p className="text-[13px] font-bold text-[#1b1c17]">No outlets match this star rating</p>
            <p className="text-[11px] text-[#707a6c]">
              Try selecting "All Ratings" or "4.0+ ★" to view available workshops within {selectedRadiusKm} km.
            </p>
            <button
              onClick={() => setMinRating(0)}
              className="mt-2 px-3 py-1.5 bg-[#0d631b] text-white text-[12px] font-bold rounded-xl cursor-pointer"
            >
              Show All {totalWithinRadius} Outlets
            </button>
          </div>
        ) : (
          filteredGarages.map((garage) => {
            const isSelected = selectedGarage?.id === garage.id;
            return (
              <div
                key={garage.id}
                onClick={() => handleSelectGarage(garage)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
                  isSelected
                    ? "bg-[#f0f8ef] border-[#0d631b] shadow-sm"
                    : "bg-[#ffffff] border-[#e4e3db] hover:border-[#0d631b] hover:shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
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

                  {/* Info details */}
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

                    {/* Secondary tags: Live Bays & Specialist */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {garage.liveBaysAvailable && (
                        <span className="text-[10px] font-bold text-[#0d631b] bg-[#cbffc2] px-1.5 py-0.5 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0d631b]"></span>
                          {garage.liveBaysAvailable} Live Bays Open
                        </span>
                      )}
                      {garage.isClosest && (
                        <span className="text-[10px] font-bold text-[#1565c0] bg-[#e3f2fd] px-1.5 py-0.5 rounded">
                          Nearest ({garage.distanceKm}km)
                        </span>
                      )}
                      {garage.specialistTag && (
                        <span className="text-[10px] font-medium text-[#5c3e00] bg-[#ffecb3] px-1.5 py-0.5 rounded truncate max-w-[140px]">
                          {garage.specialistTag}
                        </span>
                      )}
                    </div>

                    {/* Footer CTA */}
                    <div className="mt-2.5 pt-2 border-t border-[#f0eee6] flex items-center justify-between">
                      <div className="text-[11px] text-[#707a6c]">
                        Starting from <strong className="text-[#0d631b] font-numeric-plate">₹{garage.price}</strong>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectGarage(garage);
                        }}
                        className="px-3 py-1 rounded-xl bg-[#0d631b] text-white text-[11px] font-bold hover:bg-[#005312] shadow-2xs flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <span>Select Outlet</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer reassurance */}
      <div className="pt-2 border-t border-[#f0eee6] flex items-center justify-between text-[11px] text-[#707a6c]">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[#0d631b] text-[15px]">verified_user</span>
          <span>100% Genuine Castrol/OEM Parts</span>
        </span>
        <button
          onClick={() => setCurrentScreen("customer_book_garages")}
          className="font-bold text-[#0d631b] hover:underline flex items-center gap-0.5"
        >
          <span>View All Garages on Map</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
};
