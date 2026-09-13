import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ScreenView } from "../../types";
import {
  Car,
  Home,
  Wrench,
  ShoppingCart,
  Store,
  Calendar,
  Activity,
  LayoutDashboard,
  ClipboardList,
  X,
  CheckCircle2,
  ChevronRight,
  Layers,
  Sparkles,
  ShieldCheck,
  User,
} from "lucide-react";

interface ScreenItem {
  id: ScreenView;
  title: string;
  badge: string;
  role: "customer" | "workshop";
  desc: string;
  Icon: React.ComponentType<{ className?: string; size?: number }>;
  colorClass: string;
}

export const ScreenQuickDrawer: React.FC = () => {
  const { isModalOpen, closeModal, openModal, setCurrentScreen, setUserRole, currentScreen } = useApp();
  const [filter, setFilter] = useState<"all" | "customer" | "workshop">("all");

  if (!isModalOpen?.screenDrawer) return null;

  const screens: ScreenItem[] = [
    {
      id: "welcome",
      title: "Login & Vahan RC Lookup",
      badge: "Onboarding",
      role: "customer",
      desc: "Instant vehicle verification with Indian number plate & 6-digit OTP security",
      Icon: ShieldCheck,
      colorClass: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "customer_home",
      title: "Customer Home & Garage",
      badge: "Customer",
      role: "customer",
      desc: "Live bay card, car garage selector, service packages & quick diagnostics",
      Icon: Home,
      colorClass: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "customer_book_garages",
      title: "Select Certified Workshop",
      badge: "Garages",
      role: "customer",
      desc: "Compare verified partner garages with distance, ratings & available bays",
      Icon: Store,
      colorClass: "bg-blue-100 text-blue-800",
    },
    {
      id: "customer_book_package",
      title: "Service Packages & Add-ons",
      badge: "Catalog",
      role: "customer",
      desc: "Periodic maintenance, genuine OEM consumables, transparent package pricing",
      Icon: Wrench,
      colorClass: "bg-indigo-100 text-indigo-800",
    },
    {
      id: "customer_cart",
      title: "Service Cart & Coupons",
      badge: "Cart",
      role: "customer",
      desc: "Review booked services, apply discount coupons & view savings breakdown",
      Icon: ShoppingCart,
      colorClass: "bg-amber-100 text-amber-800",
    },
    {
      id: "customer_book_schedule",
      title: "Schedule Slot & Doorstep Pickup",
      badge: "Checkout",
      role: "customer",
      desc: "Pick convenient time slots, doorstep pickup/drop address & payment mode",
      Icon: Calendar,
      colorClass: "bg-purple-100 text-purple-800",
    },
    {
      id: "customer_tracker_journey",
      title: "Live Bay Tracker & Approval Hub",
      badge: "Live Bay",
      role: "customer",
      desc: "Real-time timeline, mechanic inspection photos, one-tap approvals & digital bill",
      Icon: Activity,
      colorClass: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "workshop_dashboard",
      title: "Workshop Partner Dashboard",
      badge: "Workshop",
      role: "workshop",
      desc: "Real-time incoming job queue, bay occupancy overview & business revenue",
      Icon: LayoutDashboard,
      colorClass: "bg-amber-100 text-amber-800",
    },
    {
      id: "workshop_bay_log",
      title: "Mechanic Live Bay Logger",
      badge: "Technician",
      role: "workshop",
      desc: "Log inspection checkpoints, capture bay photos & dispatch estimates to customer",
      Icon: ClipboardList,
      colorClass: "bg-teal-100 text-teal-800",
    },
  ];

  const filteredScreens = screens.filter((sc) => {
    if (filter === "customer") return sc.role === "customer";
    if (filter === "workshop") return sc.role === "workshop";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-3 pb-safe animate-in fade-in duration-200">
      <div className="bg-[#ffffff] rounded-2xl p-4 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-[#e4e3db] max-w-xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f0eee6]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0d631b]/10 flex items-center justify-center text-[#0d631b]">
              <Layers size={20} className="text-[#0d631b]" />
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#1b1c17] leading-tight">Screen Navigator</h3>
              <p className="text-[12px] text-[#707a6c]">Jump to any customer journey or workshop screen</p>
            </div>
          </div>
          <button
            onClick={() => closeModal("screenDrawer")}
            className="w-8 h-8 rounded-full bg-[#f0eee6] flex items-center justify-center text-[#40493d] hover:bg-[#eae8e0] hover:text-[#1b1c17] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 py-2.5 border-b border-[#f0eee6]">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
              filter === "all"
                ? "bg-[#0d631b] text-white shadow-xs"
                : "bg-[#f0eee6] text-[#40493d] hover:text-[#1b1c17]"
            }`}
          >
            All Screens ({screens.length})
          </button>
          <button
            onClick={() => setFilter("customer")}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
              filter === "customer"
                ? "bg-[#0d631b] text-white shadow-xs"
                : "bg-[#f0eee6] text-[#40493d] hover:text-[#1b1c17]"
            }`}
          >
            <User size={12} />
            <span>Customer Flow (7)</span>
          </button>
          <button
            onClick={() => setFilter("workshop")}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
              filter === "workshop"
                ? "bg-[#0d631b] text-white shadow-xs"
                : "bg-[#f0eee6] text-[#40493d] hover:text-[#1b1c17]"
            }`}
          >
            <Store size={12} />
            <span>Workshop & Bay (2)</span>
          </button>
        </div>

        {/* API Tools Quick Launch Bar */}
        <div className="py-2 border-b border-[#f0eee6] overflow-x-auto flex items-center gap-1.5 text-[10px]">
          <span className="font-bold text-slate-400 uppercase tracking-wider shrink-0 text-[9px]">
            API Hub:
          </span>
          {/* Geofence Radar Quick Trigger */}
          <button
            onClick={() => {
              closeModal("screenDrawer");
              openModal("geofencing");
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-100 text-[#005312] border border-emerald-300 font-extrabold whitespace-nowrap hover:bg-emerald-200 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <span>📡 Geofence Radar</span>
          </button>
          <button
            onClick={() => {
              closeModal("screenDrawer");
              openModal("obdScanner");
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold whitespace-nowrap hover:bg-emerald-100 transition-all cursor-pointer"
          >
            🔌 OBD-II Scanner
          </button>
          <button
            onClick={() => {
              closeModal("screenDrawer");
              openModal("echallan");
            }}
            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold whitespace-nowrap hover:bg-blue-100 transition-all cursor-pointer"
          >
            📋 Traffic e-Challan
          </button>
          <button
            onClick={() => {
              closeModal("screenDrawer");
              openModal("whatsappHub");
            }}
            className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-bold whitespace-nowrap hover:bg-teal-100 transition-all cursor-pointer"
          >
            💬 WhatsApp Cloud
          </button>
          <button
            onClick={() => {
              closeModal("screenDrawer");
              openModal("smsGateway");
            }}
            className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-bold whitespace-nowrap hover:bg-sky-100 transition-all cursor-pointer"
          >
            📱 SMS Gateway
          </button>
          <button
            onClick={() => {
              closeModal("screenDrawer");
              openModal("liveBayStream");
            }}
            className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-bold whitespace-nowrap hover:bg-purple-100 transition-all cursor-pointer"
          >
            📹 Live Bay Stream
          </button>
          <button
            onClick={() => {
              closeModal("screenDrawer");
              openModal("ambulanceDispatch");
            }}
            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold whitespace-nowrap hover:bg-rose-100 transition-all cursor-pointer"
          >
            🚑 24x7 Ambulance
          </button>
        </div>

        {/* Screens List */}
        <div className="overflow-y-auto py-2.5 space-y-2 pr-1">
          {filteredScreens.map((sc) => {
            const isSelected = currentScreen === sc.id;
            const IconComponent = sc.Icon;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setUserRole(sc.role);
                  setCurrentScreen(sc.id);
                  closeModal("screenDrawer");
                }}
                className={`w-full p-3 rounded-xl flex items-start gap-3 text-left transition-all relative group cursor-pointer ${
                  isSelected
                    ? "bg-[#cbffc2]/35 border-2 border-[#0d631b] shadow-xs"
                    : "bg-[#f8f7f2] hover:bg-[#f0eee6] border border-[#e4e3db]/70"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isSelected ? "bg-[#0d631b] text-white shadow-xs" : sc.colorClass
                  }`}
                >
                  <IconComponent size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[13px] text-[#1b1c17] truncate group-hover:text-[#0d631b] transition-colors">
                      {sc.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        sc.role === "customer"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {sc.badge}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#556052] mt-0.5 line-clamp-1 leading-snug">
                    {sc.desc}
                  </p>
                </div>
                <div className="shrink-0 self-center pl-1 text-[#707a6c]">
                  {isSelected ? (
                    <CheckCircle2 size={18} className="text-[#0d631b]" />
                  ) : (
                    <ChevronRight size={16} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#f0eee6] flex items-center justify-between text-[11px] text-[#707a6c]">
          <span className="flex items-center gap-1">
            <Sparkles size={13} className="text-[#0d631b]" />
            <span>Apni Workshop • Live Bay Platform</span>
          </span>
          <button
            onClick={() => closeModal("screenDrawer")}
            className="px-3.5 py-1.5 rounded-full bg-[#f0eee6] hover:bg-[#eae8e0] text-[#1b1c17] font-semibold text-[12px] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

