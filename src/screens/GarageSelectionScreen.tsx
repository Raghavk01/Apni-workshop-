import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import {
  mockGarages,
  serviceCategories,
  getGarageTaskRating,
} from "../data/mockData";
import { WorkshopGarage } from "../types";
import { GoogleMapsWorkshopFinder } from "../components/GoogleMapsWorkshopFinder";

export const GarageSelectionScreen: React.FC = () => {
  const {
    selectedGarage,
    setSelectedGarage,
    selectedCategory,
    setSelectedCategory,
    setCurrentScreen,
    showToast,
    vehicle,
  } = useApp();

  const [activeViewMode, setActiveViewMode] = useState<"google_map" | "task_rank">("google_map");
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(3.0);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"task_rating" | "distance">("task_rating");

  const currentCategoryMeta =
    serviceCategories.find((c) => c.id === selectedCategory) || serviceCategories[0];

  const filteredGarages = useMemo(() => {
    return mockGarages
      .filter((g) => {
        const taskRating = getGarageTaskRating(g, selectedCategory);
        const matchesRadius = g.distanceKm <= selectedRadiusKm;
        const matchesRating = minRating === 0 || taskRating.rating >= minRating;
        return matchesRadius && matchesRating;
      })
      .sort((a, b) => {
        const aTask = getGarageTaskRating(a, selectedCategory);
        const bTask = getGarageTaskRating(b, selectedCategory);

        if (sortBy === "task_rating") {
          return (
            bTask.rating - aTask.rating ||
            bTask.reviewCount - aTask.reviewCount ||
            a.distanceKm - b.distanceKm
          );
        } else {
          return a.distanceKm - b.distanceKm || bTask.rating - aTask.rating;
        }
      });
  }, [selectedRadiusKm, minRating, sortBy, selectedCategory]);

  const handleSelect = (g: WorkshopGarage) => {
    setSelectedGarage(g);
    const taskRating = getGarageTaskRating(g, selectedCategory);
    showToast(`${g.name} (${taskRating.rating}★ for ${currentCategoryMeta.title}) selected! Showing service packages & pricing.`);
    setCurrentScreen("customer_book_package");
  };

  const ratingOptions = [
    { label: "All Ratings", value: 0 },
    { label: "4.5+ ★ Highly Rated", value: 4.5 },
    { label: "4.8+ ★ Top Rated", value: 4.8 },
  ];

  return (
    <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full pb-32">
      {/* 1. Vehicle header strip */}
      <div className="flex items-center justify-between bg-[#f6f4ec] px-3.5 py-2.5 rounded-2xl border border-[#e4e3db]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#cbffc2] flex items-center justify-center text-[#005312] shadow-2xs flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">directions_car</span>
          </div>
          <div>
            <span className="font-bold text-[13px] text-[#1b1c17] block leading-tight">
              {vehicle.name} {vehicle.model}
            </span>
            <span className="text-[10px] text-[#707a6c]">
              Odo: {vehicle.mileageKm?.toLocaleString() || "28,450"} KM • {vehicle.fuelType}
            </span>
          </div>
        </div>
        <span className="bg-[#eae8e0] px-2 py-0.5 rounded font-numeric-plate text-[11px] font-bold text-[#40493d] border border-[#d8d6ce]">
          {vehicle.plate}
        </span>
      </div>

      {/* View Mode Switcher: Google Maps Discovery vs. Category Task Ranking */}
      <div className="bg-[#f0f8ef] p-1.5 rounded-2xl border border-[#c8e6c9] flex items-center justify-between gap-1 shadow-2xs">
        <button
          onClick={() => setActiveViewMode("google_map")}
          className={`flex-1 py-2 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeViewMode === "google_map"
              ? "bg-[#0d631b] text-white shadow-xs"
              : "text-[#2e4c27] hover:bg-white/60"
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">map</span>
          <span>Google Maps Discovery</span>
          <span className="w-2 h-2 rounded-full bg-[#cbffc2] animate-pulse"></span>
        </button>
        <button
          onClick={() => setActiveViewMode("task_rank")}
          className={`flex-1 py-2 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeViewMode === "task_rank"
              ? "bg-[#0d631b] text-white shadow-xs"
              : "text-[#2e4c27] hover:bg-white/60"
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">format_list_bulleted</span>
          <span>Task-Ranked Outlets</span>
        </button>
      </div>

      {activeViewMode === "google_map" ? (
        <GoogleMapsWorkshopFinder />
      ) : (
        <>
          {/* 2. Service Category Switcher Tabs */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#707a6c]">
            Select Service to Rank Workshops
          </h3>
          <span className="text-[11px] text-[#0d631b] font-bold">
            Task-Based Ranking
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          {serviceCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-[12px] font-bold whitespace-nowrap transition-all flex-shrink-0 border ${
                  isActive
                    ? "bg-[#0d631b] text-white border-[#0d631b] shadow-sm scale-102"
                    : "bg-[#ffffff] text-[#40493d] border-[#e4e3db] hover:border-[#0d631b] hover:bg-[#f6f4ec]"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Screen Title & Radius Filter */}
      <div className="space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-[18px] text-[#1b1c17] leading-tight flex items-center gap-1.5">
              <span>Workshops for {currentCategoryMeta.title}</span>
            </h2>
            <p className="text-[12px] text-[#707a6c] mt-0.5">
              Select an outlet to view verified service packages, transparent pricing & add to cart
            </p>
          </div>

          {/* Radius toggle */}
          <div className="flex items-center gap-1 bg-[#f0eee6] p-1 rounded-xl border border-[#e4e3db] self-start sm:self-auto flex-shrink-0">
            <span className="text-[10px] font-bold text-[#707a6c] px-1 uppercase">Radius:</span>
            {[3.0, 5.0].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRadiusKm(r)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  selectedRadiusKm === r
                    ? "bg-[#0d631b] text-white shadow-2xs"
                    : "text-[#40493d] hover:bg-white"
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Sorting & Task Rating Filter Bar */}
      <div className="bg-[#ffffff] p-3 rounded-2xl border border-[#e4e3db] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap text-[12px]">
          {/* Sort By Toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#707a6c] text-[11px] font-bold uppercase">Sort:</span>
            <div className="flex bg-[#f6f4ec] p-0.5 rounded-xl border border-[#e4e3db]">
              <button
                onClick={() => setSortBy("task_rating")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                  sortBy === "task_rating"
                    ? "bg-[#0d631b] text-white shadow-2xs"
                    : "text-[#40493d] hover:text-[#1b1c17]"
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">military_tech</span>
                <span>Task Rating</span>
              </button>
              <button
                onClick={() => setSortBy("distance")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                  sortBy === "distance"
                    ? "bg-[#0d631b] text-white shadow-2xs"
                    : "text-[#40493d] hover:text-[#1b1c17]"
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">near_me</span>
                <span>Distance</span>
              </button>
            </div>
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {ratingOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMinRating(opt.value)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                  minRating === opt.value
                    ? "bg-[#cbffc2] text-[#005312] border-[#0d631b]"
                    : "bg-[#f6f4ec] text-[#707a6c] border-[#e4e3db] hover:border-[#0d631b]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Informational Callout */}
        <div className="bg-[#f0f8ef] rounded-xl p-2.5 border border-[#c8e6c9] flex items-center gap-2 text-[11px] text-[#005312]">
          <span className="material-symbols-outlined text-[17px] text-[#0d631b] flex-shrink-0">
            verified
          </span>
          <p className="leading-tight">
            Workshops are evaluated and ranked based on verified service logs, OEM tooling, and customer ratings for{" "}
            <strong>{currentCategoryMeta.title}</strong>.
          </p>
        </div>
      </div>

      {/* 5. Workshop Cards List */}
      <div className="space-y-3">
        {filteredGarages.length === 0 ? (
          <div className="bg-[#ffffff] rounded-2xl p-6 text-center border border-[#e4e3db] space-y-2">
            <span className="material-symbols-outlined text-[36px] text-[#707a6c]">
              location_off
            </span>
            <p className="font-bold text-[14px] text-[#1b1c17]">
              No partner workshops found within {selectedRadiusKm} km
            </p>
            <p className="text-[12px] text-[#707a6c]">
              Try expanding the radius to 5.0 km or clear rating filter.
            </p>
            <button
              onClick={() => {
                setSelectedRadiusKm(5.0);
                setMinRating(0);
              }}
              className="mt-2 px-3 py-1.5 rounded-xl bg-[#0d631b] text-white font-bold text-[12px]"
            >
              Expand Search Radius
            </button>
          </div>
        ) : (
          filteredGarages.map((garage, index) => {
            const isSelected = selectedGarage.id === garage.id;
            const taskRating = getGarageTaskRating(garage, selectedCategory);

            return (
              <div
                key={garage.id}
                onClick={() => handleSelect(garage)}
                className={`bg-[#ffffff] rounded-2xl p-4 cursor-pointer transition-all border-2 shadow-xs space-y-3 hover:shadow-md ${
                  isSelected
                    ? "border-[#0d631b] ring-2 ring-[#a3f69c]/50 bg-gradient-to-r from-white to-[#f0f8ef]/40"
                    : "border-[#e4e3db] hover:border-[#a3f69c]"
                }`}
              >
                {/* Header row: Avatar, Name, Distance & Select CTA */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#f0eee6] flex-shrink-0 border border-[#e4e3db] shadow-2xs">
                      <img
                        src={garage.imageUrl}
                        alt={garage.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-[15px] text-[#1b1c17] truncate leading-tight">
                          {garage.name}
                        </h3>
                        {index === 0 && sortBy === "task_rating" && (
                          <span className="bg-[#0d631b] text-white text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">trophy</span>
                            #1 in {currentCategoryMeta.title.split(" ")[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#707a6c] flex items-center gap-1 mt-0.5">
                        <span>{garage.locationArea}</span>
                        <span>•</span>
                        <span>{garage.distanceKm} km ({garage.etaMins}m ETA)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="px-3 py-1.5 rounded-xl bg-[#0d631b] text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs">
                      <span>View Services</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </div>
                </div>

                {/* Task Specific Rating Highlight Pill */}
                <div className="flex items-center justify-between gap-2 flex-wrap pt-2.5 border-t border-[#f0eee6]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 bg-[#fff8e1] text-[#b78103] px-2.5 py-1 rounded-lg border border-[#ffe082] text-[12px] font-extrabold shadow-2xs">
                      <span className="material-symbols-outlined text-[14px] text-[#d97706]">star</span>
                      <span>{taskRating.rating}★ in {currentCategoryMeta.title}</span>
                    </span>
                    <span className="text-[11px] text-[#707a6c]">
                      ({taskRating.reviewCount} tasks verified)
                    </span>
                  </div>

                  <span className="text-[11px] text-[#0d631b] font-bold flex items-center gap-1 bg-[#cbffc2]/50 px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d631b] animate-ping"></span>
                    <span>{garage.liveBaysAvailable || 3} Live Bays Open</span>
                  </span>
                </div>

                {/* Specialized Tooling & Certifications */}
                <div className="bg-[#fbf9f1] rounded-xl p-2.5 border border-[#e4e3db] space-y-1">
                  <div className="flex items-start gap-1.5 text-[11px] text-[#2e4c27]">
                    <span className="material-symbols-outlined text-[15px] text-[#0d631b] flex-shrink-0 mt-0.5">
                      build_circle
                    </span>
                    <span className="leading-snug">
                      <strong className="font-bold text-[#1b1c17]">Specialized Tooling: </strong>
                      {taskRating.specialtyHighlight}
                    </span>
                  </div>
                  {taskRating.technicianExperience && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[#707a6c]">
                      <span className="material-symbols-outlined text-[13px] text-[#0d631b]">engineering</span>
                      <span>Tech Certification: <strong className="text-[#40493d]">{taskRating.technicianExperience}</strong></span>
                    </div>
                  )}
                </div>

                {/* Verified Customer Task Review Quote */}
                {taskRating.recentTaskReview && (
                  <div className="bg-[#f0f8ef] rounded-xl p-2 border border-[#c8e6c9] text-[11px] text-[#1b5e20] flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#0d631b] flex-shrink-0 mt-0.5">
                      format_quote
                    </span>
                    <div className="space-y-0.5">
                      <p className="italic text-[#2e4c27] leading-tight">
                        "{taskRating.recentTaskReview.comment}"
                      </p>
                      <span className="text-[9px] font-bold text-[#558b2f] block">
                        — {taskRating.recentTaskReview.author} ({taskRating.recentTaskReview.vehicle}) • Verified {currentCategoryMeta.title} Review
                      </span>
                    </div>
                  </div>
                )}

                {/* Free Pickup Row */}
                <div className="pt-2 border-t border-[#f0eee6] flex items-center justify-between text-[11px] text-[#707a6c]">
                  <div className="flex items-center gap-1 text-[#0d631b] font-medium">
                    <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                    <span>Free Doorstep Pickup & Live Video Bay</span>
                  </div>
                  <span className="font-semibold text-[#40493d]">
                    Tap to see services & pricing →
                  </span>
                </div>
              </div>
            );
          })
        )}
          </div>
        </>
      )}

      {/* 6. Sticky Bottom Selection Bar (Fixed above BottomNav) */}
      <div className="fixed bottom-16 inset-x-0 bg-[#ffffff]/95 backdrop-blur-md p-3 px-4 border-t border-[#e4e3db] shadow-lg z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] text-[#707a6c] uppercase font-bold tracking-wider block truncate">
              {selectedGarage.name}
            </span>
            <div className="text-[12px] font-bold text-[#0d631b] flex items-center gap-1">
              <span>{getGarageTaskRating(selectedGarage, selectedCategory).rating}★</span>
              <span className="text-[#707a6c] font-normal">• {selectedGarage.distanceKm} km</span>
            </div>
          </div>

          <button
            onClick={() => handleSelect(selectedGarage)}
            className="flex-1 max-w-[220px] h-11 rounded-full btn-tactile-green font-bold text-[12px] flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <span>Next: Select Services</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
