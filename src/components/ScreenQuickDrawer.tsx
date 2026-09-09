import React from "react";
import { useApp } from "../context/AppContext";
import { ScreenView } from "../types";

export const ScreenQuickDrawer: React.FC = () => {
  const { isModalOpen, closeModal, setCurrentScreen, setUserRole, currentScreen } = useApp();

  if (!isModalOpen?.screenDrawer) return null;

  const screens: Array<{
    id: ScreenView;
    title: string;
    badge: string;
    role: "customer" | "workshop";
    desc: string;
    icon: string;
  }> = [
    {
      id: "welcome",
      title: "0. Welcome & Number Plate OTP Login",
      badge: "Onboarding",
      role: "customer",
      desc: "Input registration plate, name, mobile number + 6-digit OTP verification",
      icon: "pin",
    },
    {
      id: "customer_home",
      title: "1. Customer Home (Apni Workshop)",
      badge: "Customer",
      role: "customer",
      desc: "Hero status card, car garage selector, 6 service categories & offers",
      icon: "home",
    },
    {
      id: "customer_book_package",
      title: "2. Service Details & Pricing (Add to Cart)",
      badge: "Customer",
      role: "customer",
      desc: "Workshop packages, OEM consumables, active add-to-cart buttons",
      icon: "checklist",
    },
    {
      id: "customer_cart",
      title: "2b. Service Cart & Coupons",
      badge: "Cart",
      role: "customer",
      desc: "Selected items, apply coupons (APNI15/FLAT500), pay via Razorpay",
      icon: "shopping_cart",
    },
    {
      id: "customer_book_garages",
      title: "3. Choose Workshop Partner",
      badge: "Customer",
      role: "customer",
      desc: "Map preview with 3 Garages, AutoCare Pro, Speedy Motors, Green Wheels",
      icon: "storefront",
    },
    {
      id: "customer_book_schedule",
      title: "4. Schedule & Checkout",
      badge: "Customer",
      role: "customer",
      desc: "Date & time slots, Doorstep Pickup vs Drive-in, Price breakdown ₹2,699",
      icon: "calendar_month",
    },
    {
      id: "customer_tracker_journey",
      title: "5. Live Tracker: Pickup En Route",
      badge: "Live Tracker",
      role: "customer",
      desc: "Booking AW-2026, Workshop Assigned, Pickup partner en route NOW (ETA 10:15 AM)",
      icon: "route",
    },
    {
      id: "customer_tracker_inspection",
      title: "6. Live Tracker: Under Inspection",
      badge: "Live Tracker",
      role: "customer",
      desc: "Stage stepper, Live Bay Updates, Priority Approval Card for Brake Pads ₹3,200",
      icon: "search_check",
    },
    {
      id: "customer_tracker_ready",
      title: "7. Live Tracker: Car Ready & Invoice",
      badge: "Live Tracker",
      role: "customer",
      desc: "Car ready celebration, Before/After brake assembly, Bill ₹5,150, 5★ rating",
      icon: "task_alt",
    },
    {
      id: "workshop_dashboard",
      title: "8. Workshop Partner Dashboard",
      badge: "Workshop",
      role: "workshop",
      desc: "Sharma Auto Care online toggle, Today's metrics, Incoming Instant Request 45s timer",
      icon: "dashboard",
    },
    {
      id: "workshop_bay_log",
      title: "9. Mechanic Live Bay Log",
      badge: "Workshop",
      role: "workshop",
      desc: "Bay 03 Thar LX, Live Bay Log steps, Approved work ₹7,450, Add Bay Photo & + Estimate modal",
      icon: "handyman",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-3 pb-safe animate-in fade-in duration-200">
      <div className="bg-[#ffffff] rounded-2xl p-4 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-[#e4e3db]">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0eee6]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#a3f69c] flex items-center justify-center text-[#005312]">
              <span className="material-symbols-outlined text-[20px]">view_carousel</span>
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#1b1c17]">Select Mockup Screen</h3>
              <p className="text-[11px] text-[#707a6c]">Customer (1-7) and Workshop (8-9) workflows</p>
            </div>
          </div>
          <button
            onClick={() => closeModal("screenDrawer")}
            className="w-8 h-8 rounded-full bg-[#f0eee6] flex items-center justify-center text-[#40493d] hover:bg-[#eae8e0]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="overflow-y-auto py-2 space-y-2 pr-1">
          {screens.map((sc) => {
            const isSelected = currentScreen === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setUserRole(sc.role);
                  setCurrentScreen(sc.id);
                  closeModal("screenDrawer");
                }}
                className={`w-full p-3 rounded-xl flex items-start gap-3 text-left transition-all ${
                  isSelected
                    ? "bg-[#cbffc2]/40 border-2 border-[#0d631b] shadow-sm"
                    : "bg-[#f6f4ec] hover:bg-[#f0eee6] border border-transparent"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? "bg-[#0d631b] text-white" : "bg-[#eae8e0] text-[#0d631b]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{sc.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[13px] text-[#1b1c17] truncate">{sc.title}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${
                        sc.role === "customer"
                          ? "bg-[#91f78e]/60 text-[#005312]"
                          : "bg-[#ffddb8] text-[#794b00]"
                      }`}
                    >
                      {sc.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#707a6c] mt-0.5 line-clamp-2">{sc.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-[#f0eee6] flex items-center justify-between">
          <span className="text-[11px] text-[#707a6c]">Apni Workshop • Live Bay Platform</span>
          <button
            onClick={() => closeModal("screenDrawer")}
            className="px-4 py-2 rounded-full bg-[#f0eee6] hover:bg-[#eae8e0] text-[#1b1c17] font-semibold text-[12px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
