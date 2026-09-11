import React from "react";
import { useApp } from "../context/AppContext";
import { serviceCategories } from "../data/mockData";
import { ServiceCategory } from "../types";
import { resolveVehicleImageUrl } from "../lib/carImageResolver";
import { GoogleMapsWorkshopFinder } from "../components/GoogleMapsWorkshopFinder";
import {
  Car,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  Wrench,
  Sparkles,
  Headphones,
  Tag,
  Layers,
  Activity,
  CheckCircle2,
  ShoppingCart,
  Calendar,
  ChevronRight,
  FileCheck,
} from "lucide-react";

export const CustomerHomeScreen: React.FC = () => {
  const {
    setCurrentScreen,
    setSelectedCategory,
    vehicle,
    openModal,
    showToast,
    cart,
    cartTotal,
    userLocation,
    detectUserLocation,
  } = useApp();

  const handleSelectCategory = (catId: ServiceCategory) => {
    setSelectedCategory(catId);
    setCurrentScreen("customer_book_garages");
  };

  return (
    <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full pb-24">
      {/* Service Location Bar with Quick Changer */}
      <div className="bg-[#ffffff] rounded-2xl p-3 border border-[#e4e3db] shadow-xs flex items-center justify-between gap-2.5">
        <div
          onClick={() => openModal("locationPicker")}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
          title="Click to change service location or drop pin on map"
        >
          <div className="w-8 h-8 rounded-xl bg-[#eef8ed] text-[#0d631b] flex items-center justify-center shrink-0 border border-[#0d631b]/20 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px]">location_on</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#707a6c]">
                Service Location
              </span>
              <span className="text-[10px] font-bold text-[#0d631b] group-hover:underline flex items-center gap-0.5">
                Change <span className="material-symbols-outlined text-[12px]">expand_more</span>
              </span>
            </div>
            <p className="text-[13px] font-extrabold text-[#1b1c17] truncate leading-tight mt-0.5">
              {userLocation.areaName}
            </p>
          </div>
        </div>

        <button
          onClick={() => detectUserLocation({ forceFresh: true })}
          disabled={userLocation.isLocating}
          className="px-2.5 py-1.5 rounded-xl bg-[#f0eee6] hover:bg-[#e4e2d8] text-[#1b1c17] text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
          title="Detect Current GPS Location"
        >
          <span className={`material-symbols-outlined text-[14px] text-[#0d631b] ${userLocation.isLocating ? "animate-spin" : ""}`}>
            {userLocation.isLocating ? "sync" : "my_location"}
          </span>
          <span className="hidden xs:inline">{userLocation.isLocating ? "Locating..." : "GPS"}</span>
        </button>
      </div>
      {/* Active Service Live Tracker Card (Top Banner) */}
      <div className="bg-gradient-to-br from-[#0d631b] via-[#094813] to-[#00390a] rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
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
          <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shrink-0">
            <Activity size={24} />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/90 font-medium">Brake pads replacement underway</span>
          </div>
          <button
            onClick={() => setCurrentScreen("customer_tracker_inspection")}
            className="px-3.5 py-1.5 rounded-full bg-white text-[#0d631b] font-bold text-[12px] shadow-sm hover:bg-[#f6f4ec] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Track Live</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Your Cars Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[15px] text-[#1b1c17]">Your Registered Vehicles</h3>
          <button
            onClick={() => openModal("vahan")}
            className="text-[12px] text-[#0d631b] font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>Add / Verify RC</span>
          </button>
        </div>

        <div
          onClick={() => openModal("vahan")}
          className="bg-[#ffffff] rounded-2xl p-3.5 shadow-sm border border-[#e4e3db] hover:border-[#0d631b] flex items-center justify-between gap-3 cursor-pointer group transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#f0eee6] shrink-0 border border-[#e4e3db] group-hover:scale-105 transition-transform">
              <img
                src={resolveVehicleImageUrl(vehicle)}
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[14px] text-[#1b1c17] truncate">{vehicle.name}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-1.5 py-0.5 rounded">
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

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal("vahan");
              }}
              className="p-2 rounded-xl bg-[#f6f4ec] hover:bg-[#eae8e0] text-[#40493d] text-[11px] font-bold cursor-pointer"
              title="View Vahan RC Details"
            >
              <FileCheck size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentScreen("customer_book_package");
              }}
              className="px-3.5 py-2 rounded-xl bg-[#0d631b] hover:bg-[#094813] text-white text-[12px] font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
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
            <div className="w-9 h-9 rounded-xl bg-[#0d631b] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShoppingCart size={18} />
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
          <ArrowRight size={18} className="text-[#0d631b] shrink-0" />
        </div>
      )}

      {/* Book a Service - 6 Tile Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[15px] text-[#1b1c17]">Book a Workshop Service</h3>
            <p className="text-[11px] text-[#707a6c]">Choose service to see top-rated workshops for that task</p>
          </div>
          <span className="text-[10px] font-bold text-[#0d631b] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            6 Categories
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {serviceCategories.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectCategory(s.id)}
              className="bg-[#ffffff] p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 shadow-xs border border-[#e4e3db] hover:border-[#0d631b] hover:shadow-md active:scale-95 transition-all group relative overflow-hidden cursor-pointer"
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
          <div className="w-9 h-9 rounded-xl bg-[#0d631b] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <CheckCircle2 size={20} />
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
                className="text-[11px] font-bold text-[#0d631b] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Standard Periodic Service</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Maps Location & Nearby Workshops Finder */}
      <GoogleMapsWorkshopFinder />

      {/* Helper Tools: AI Diagnostics, 24x7 Support & Emergency Ambulance */}
      <div className="grid grid-cols-3 gap-2">
        {/* AI Copilot Card */}
        <div
          onClick={() => openModal("aiDiagnose")}
          className="bg-[#ffffff] rounded-2xl p-2.5 border border-[#e4e3db] hover:border-[#0d631b] shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#a3f69c] flex items-center justify-center text-[#005312] shadow-2xs mb-1.5 group-hover:scale-105 transition-transform">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="font-bold text-[11px] text-[#1b1c17] leading-tight">AI Diagnosis</h4>
            <p className="text-[9px] text-[#707a6c] mt-0.5 line-clamp-1">Quotes & audio</p>
          </div>
        </div>

        {/* 24x7 Support Card */}
        <div
          onClick={() => openModal("customerSupport")}
          className="bg-[#ffffff] rounded-2xl p-2.5 border border-[#e4e3db] hover:border-[#0d631b] shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0d631b] flex items-center justify-center text-white shadow-2xs mb-1.5 group-hover:scale-105 transition-transform">
            <Headphones size={16} />
          </div>
          <div>
            <h4 className="font-bold text-[11px] text-[#1b1c17] leading-tight">24x7 Support</h4>
            <p className="text-[9px] text-[#707a6c] mt-0.5 line-clamp-1">Live chat & call</p>
          </div>
        </div>

        {/* 24x7 Emergency Ambulance SOS */}
        <div
          onClick={() => openModal("ambulanceDispatch")}
          className="bg-rose-50/80 rounded-2xl p-2.5 border border-rose-200 hover:border-rose-400 shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-2xs mb-1.5 group-hover:scale-105 transition-transform animate-pulse">
            <span className="text-[13px]">🚑</span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h4 className="font-bold text-[11px] text-rose-950 leading-tight">Ambulance</h4>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
            </div>
            <p className="text-[9px] text-rose-700 font-bold mt-0.5 line-clamp-1">108 SOS GPS</p>
          </div>
        </div>
      </div>

      {/* Connected Vehicle & API Intelligence Suite */}
      <div className="bg-[#ffffff] rounded-2xl p-3 border border-[#e4e3db] shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Connected Telematics & APIs
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Live Stream & ECU Synced
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center">
          {/* OBD-II */}
          <button
            onClick={() => openModal("obdScanner")}
            className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer flex flex-col items-center gap-1"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-[12px]">
              🔌
            </div>
            <span className="text-[10px] font-bold text-slate-800">OBD-II ECU</span>
          </button>

          {/* e-Challan */}
          <button
            onClick={() => openModal("echallan")}
            className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center gap-1"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center text-[12px]">
              📋
            </div>
            <span className="text-[10px] font-bold text-slate-800">e-Challan</span>
          </button>

          {/* WhatsApp Hub */}
          <button
            onClick={() => openModal("whatsappHub")}
            className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition-all cursor-pointer flex flex-col items-center gap-1"
          >
            <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-[12px]">
              💬
            </div>
            <span className="text-[10px] font-bold text-slate-800">WhatsApp</span>
          </button>

          {/* Live Bay CCTV */}
          <button
            onClick={() => openModal("liveBayStream")}
            className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 transition-all cursor-pointer flex flex-col items-center gap-1"
          >
            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-[12px]">
              📹
            </div>
            <span className="text-[10px] font-bold text-slate-800">Live CCTV</span>
          </button>
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
          className="px-3 py-1.5 rounded-full bg-[#3e2723] text-white font-bold text-[11px] shadow-xs active:scale-95 shrink-0 cursor-pointer"
        >
          Apply
        </button>
      </div>

      {/* Primary Action Button */}
      <div className="bg-[#f0f8ef] border border-[#c8e6c9] rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] text-[#0d631b] uppercase font-bold tracking-wider block">
            Step 1 of 4 • Booking
          </span>
          <h4 className="font-bold text-[14px] text-[#1b1c17] leading-tight mt-0.5">
            Ready to find workshops?
          </h4>
          <p className="text-[11px] text-[#40493d] mt-0.5">
            Compare verified garages, live camera bays & transparent prices
          </p>
        </div>
        <button
          onClick={() => setCurrentScreen("customer_book_garages")}
          className="h-11 px-4 rounded-full btn-tactile-green text-white font-bold text-[12px] flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <span>Find Workshops</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Quick Screen Switcher Footer Card */}
      <div className="bg-[#ffffff] rounded-2xl p-3 border border-[#e4e3db] flex items-center justify-between text-[12px]">
        <span className="text-[#707a6c]">Want to jump to another screen?</span>
        <button
          onClick={() => openModal("screenDrawer")}
          className="text-[#0d631b] font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
        >
          <Layers size={15} />
          <span>Screen Navigator</span>
        </button>
      </div>
    </div>
  );
};

