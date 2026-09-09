import React from "react";
import { useApp } from "../context/AppContext";
import { serviceCategories } from "../data/mockData";
import { ServiceCategory } from "../types";
import { resolveVehicleImageUrl } from "../lib/carImageResolver";
import { GoogleMapsWorkshopFinder } from "../components/GoogleMapsWorkshopFinder";

export const CustomerHomeScreen: React.FC = () => {
  const { setCurrentScreen, setSelectedCategory, vehicle, openModal, showToast, cart, cartTotal } = useApp();

  const handleSelectCategory = (catId: ServiceCategory) => {
    setSelectedCategory(catId);
    setCurrentScreen("customer_book_garages");
  };

  return (
    <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full pb-24">
      {/* Active Service Live Tracker Card (Top Banner) */}
      <div className="bg-gradient-to-br from-[#0d631b] to-[#00390a] rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#cbffc2] text-[#005312] text-[10px] font-extrabold uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#005312] animate-ping"></span>
              Live Bay Servicing
            </span>
            <h2 className="font-bold text-[18px] text-white mt-1.5 leading-tight">
              Your {vehicle.name.includes("PRIV") || vehicle.name.includes("LTD") ? (vehicle.model?.split(" ")[0] || "Car") : (vehicle.name.split(" ")[0] || "Car")} is in Bay 03
            </h2>
            <p className="text-[12px] text-white/80 mt-0.5">
              Sharma Auto Care • Est. Delivery Today 6:30 PM
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <span className="material-symbols-outlined text-[28px]">garage_home</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/90 font-medium">Brake pads replacement underway</span>
          </div>
          <button
            onClick={() => setCurrentScreen("customer_tracker_inspection")}
            className="px-3.5 py-1.5 rounded-full bg-white text-[#0d631b] font-bold text-[12px] shadow-sm hover:bg-[#f6f4ec] active:scale-95 transition-all flex items-center gap-1"
          >
            <span>Track Live</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Your Cars Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[15px] text-[#1b1c17]">Your Registered Vehicles</h3>
          <button
            onClick={() => openModal("vahan")}
            className="text-[12px] text-[#0d631b] font-bold hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>+ Add / Verify RC</span>
          </button>
        </div>

        <div
          onClick={() => openModal("vahan")}
          className="bg-[#ffffff] rounded-2xl p-3.5 shadow-sm border border-[#e4e3db] hover:border-[#0d631b] flex items-center justify-between gap-3 cursor-pointer group transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#f0eee6] flex-shrink-0 border border-[#e4e3db] group-hover:scale-105 transition-transform">
              <img
                src={resolveVehicleImageUrl(vehicle)}
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[14px] text-[#1b1c17] truncate">{vehicle.name}</span>
                <span className="text-[10px] bg-[#cbffc2] text-[#005312] font-bold px-1.5 py-0.5 rounded">
                  {vehicle.fuelType?.split(" ")[0] || "BS-VI"}
                </span>
              </div>
              <span className="font-numeric-plate text-[11px] font-bold bg-[#f6f4ec] text-[#40493d] px-2 py-0.5 rounded inline-block mt-0.5 border border-[#e4e3db]">
                {vehicle.plate}
              </span>
              <span className="text-[10px] text-[#707a6c] block mt-0.5 truncate">
                {vehicle.model} • {vehicle.rto || "Delhi NCR"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal("vahan");
              }}
              className="p-2 rounded-xl bg-[#f6f4ec] hover:bg-[#eae8e0] text-[#40493d] text-[11px] font-bold"
              title="View Vahan RC Details"
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentScreen("customer_book_package");
              }}
              className="px-3.5 py-2 rounded-xl bg-[#0d631b] hover:bg-[#005312] text-white text-[12px] font-bold shadow-sm active:scale-95 transition-all"
            >
              Book
            </button>
          </div>
        </div>
      </div>

      {/* Active Cart Banner */}
      {cart.length > 0 && (
        <div
          onClick={() => setCurrentScreen("customer_cart")}
          className="bg-[#e7f7e4] border border-[#0d631b]/30 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#d5f3d0] transition-all shadow-2xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#0d631b] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-black text-[#0d631b]">
                  {cart.length} {cart.length === 1 ? "Service" : "Services"} in Cart
                </span>
                <span className="text-[10px] bg-[#0d631b] text-white font-bold px-1.5 py-0.2 rounded-full">
                  ₹{cartTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-[#40493d] truncate">Coupons available • Tap to view cart & checkout</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#0d631b] text-[20px] flex-shrink-0">
            arrow_forward
          </span>
        </div>
      )}

      {/* Book a Service - 6 Tile Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[15px] text-[#1b1c17]">Book a Workshop Service</h3>
            <p className="text-[11px] text-[#707a6c]">Choose service to see top-rated workshops for that task</p>
          </div>
          <span className="text-[10px] font-bold text-[#0d631b] bg-[#cbffc2] px-2 py-0.5 rounded-full">
            6 Categories
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {serviceCategories.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectCategory(s.id)}
              className="bg-[#ffffff] p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 shadow-xs border border-[#e4e3db] hover:border-[#0d631b] hover:shadow-md active:scale-95 transition-all group relative overflow-hidden"
            >
              {s.badge && (
                <span className="absolute top-1.5 right-1.5 text-[8px] font-black uppercase px-1 py-0.2 rounded bg-[#f0eee6] text-[#40493d]">
                  {s.badge}
                </span>
              )}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color} shadow-xs group-hover:scale-105 transition-transform mt-1`}>
                <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
              </div>
              <span className="font-bold text-[11px] text-[#1b1c17] leading-tight line-clamp-2">
                {s.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Smart Service Suggestion as per Workshop & Vehicle Telemetry */}
      {vehicle.serviceAdvisory && (
        <div className="bg-[#f0f8ef] rounded-2xl p-3.5 border border-[#c8e6c9] flex items-start gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#0d631b] text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0d631b] bg-[#cbffc2] px-1.5 py-0.5 rounded">
                Workshop Recommendation
              </span>
              <span className="text-[11px] text-[#40493d] font-bold">Odo: {vehicle.mileageKm?.toLocaleString() || "28,450"} KM</span>
            </div>
            <p className="text-[11px] text-[#2e4c27] mt-1 leading-snug">
              {vehicle.serviceAdvisory}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => handleSelectCategory("periodic")}
                className="text-[11px] font-bold text-[#0d631b] hover:underline flex items-center gap-0.5"
              >
                <span>View Standard Periodic Service</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Maps Location & Nearby Workshops Finder */}
      <GoogleMapsWorkshopFinder />

      {/* Helper Tools: AI Diagnostics & 24x7 Customer Support */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* AI Copilot Card */}
        <div
          onClick={() => openModal("aiDiagnose")}
          className="bg-[#ffffff] rounded-2xl p-3 border border-[#e4e3db] hover:border-[#0d631b] shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#a3f69c] flex items-center justify-center text-[#005312] shadow-2xs flex-shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            </div>
            <div>
              <h4 className="font-bold text-[12px] text-[#1b1c17] leading-tight">AI Diagnosis</h4>
              <span className="text-[10px] text-[#707a6c]">OEM Price Copilot</span>
            </div>
          </div>
          <p className="text-[11px] text-[#40493d] line-clamp-2">Snap photo or sound for instant repair quotes</p>
          <div className="mt-2 pt-2 border-t border-[#f0eee6] flex items-center justify-between text-[11px] font-bold text-[#0d631b]">
            <span>Diagnose</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        </div>

        {/* 24x7 Support Card */}
        <div
          onClick={() => openModal("customerSupport")}
          className="bg-[#ffffff] rounded-2xl p-3 border border-[#e4e3db] hover:border-[#0d631b] shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#0d631b] flex items-center justify-center text-white shadow-2xs flex-shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h4 className="font-bold text-[12px] text-[#1b1c17] leading-tight">24x7 Helpdesk</h4>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d631b] animate-pulse"></span>
              </div>
              <span className="text-[10px] text-[#707a6c]">Live Queries</span>
            </div>
          </div>
          <p className="text-[11px] text-[#40493d] line-clamp-2">WhatsApp chat, AI advisor & ticket tracking</p>
          <div className="mt-2 pt-2 border-t border-[#f0eee6] flex items-center justify-between text-[11px] font-bold text-[#0d631b]">
            <span>Ask Query</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        </div>
      </div>

      {/* Offers & Special Discounts Banner */}
      <div className="bg-gradient-to-r from-[#ffe082] to-[#ffb74d] rounded-2xl p-3.5 text-[#3e2723] shadow-xs relative overflow-hidden flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-black/10 text-[#3e2723]">
              Special Offer
            </span>
            <h4 className="font-bold text-[13px]">Code: THAR300</h4>
          </div>
          <p className="text-[11px] text-[#4e342e]">Get ₹300 off on Periodic Service packages</p>
        </div>
        <button
          onClick={() => {
            showToast("Coupon THAR300 copied!");
            setCurrentScreen("customer_book_package");
          }}
          className="px-3 py-1.5 rounded-full bg-[#3e2723] text-white font-bold text-[11px] shadow-xs active:scale-95 flex-shrink-0"
        >
          Apply
        </button>
      </div>

      {/* Next Page / Continue Flow Callout */}
      <div className="bg-[#f0f8ef] border border-[#c8e6c9] rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] text-[#0d631b] uppercase font-bold tracking-wider block">
            Step 1 of 4 • Booking
          </span>
          <h4 className="font-bold text-[14px] text-[#1b1c17] leading-tight mt-0.5">
            Ready to find workshops?
          </h4>
          <p className="text-[11px] text-[#40493d] mt-0.5">
            Compare verified garages, ratings, live camera bays & price quotes
          </p>
        </div>
        <button
          onClick={() => setCurrentScreen("customer_book_garages")}
          className="h-11 px-4 rounded-full btn-tactile-green text-white font-bold text-[12px] flex items-center gap-1.5 shadow-md active:scale-95 transition-all flex-shrink-0 cursor-pointer"
        >
          <span>Next Page</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* Quick Screen Switcher Footer Card */}
      <div className="bg-[#ffffff] rounded-2xl p-3 border border-[#e4e3db] flex items-center justify-between text-[12px]">
        <span className="text-[#707a6c]">Want to test another screen?</span>
        <button
          onClick={() => openModal("screenDrawer")}
          className="text-[#0d631b] font-bold flex items-center gap-1 hover:underline"
        >
          <span className="material-symbols-outlined text-[16px]">layers</span>
          <span>View All 10 Screens</span>
        </button>
      </div>
    </div>
  );
};
