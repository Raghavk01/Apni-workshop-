import React from "react";
import { useApp } from "../context/AppContext";

export const BottomNav: React.FC = () => {
  const { currentScreen, setCurrentScreen, userRole, setUserRole, openModal, cart } = useApp();

  // Hide on welcome screen
  if (currentScreen === "welcome") {
    return null;
  }

  // Workshop / Mechanic Bottom Nav
  if (userRole === "workshop" || currentScreen === "workshop_dashboard" || currentScreen === "workshop_bay_log") {
    return (
      <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#fbf9f1]/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.04)] border-t border-[#e4e3db]/60">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            onClick={() => {
              setUserRole("workshop");
              setCurrentScreen("workshop_dashboard");
            }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-colors ${
              currentScreen === "workshop_dashboard" ? "text-[#0d631b] font-bold" : "text-[#40493d] hover:text-[#1b1c17]"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
            <span className="text-[10px] mt-0.5">Dashboard</span>
          </button>

          <button
            onClick={() => {
              setUserRole("workshop");
              setCurrentScreen("workshop_bay_log");
            }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-colors ${
              currentScreen === "workshop_bay_log" ? "text-[#0d631b] font-bold" : "text-[#40493d] hover:text-[#1b1c17]"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">build_circle</span>
            <span className="text-[10px] mt-0.5">Live Bay Log</span>
          </button>

          <button
            onClick={() => openModal("customerSupport")}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-[#40493d] hover:text-[#0d631b] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">support_agent</span>
            <span className="text-[10px] mt-0.5">Support Desk</span>
          </button>
        </div>
      </nav>
    );
  }

  // Customer Bottom Nav
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#f6f4ec]/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(120,100,70,0.06)] border-t border-[#e4e3db]/60">
      <div className="flex justify-around items-center h-16 px-2">
        <button
          onClick={() => {
            setUserRole("customer");
            setCurrentScreen("customer_home");
          }}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] transition-colors ${
            currentScreen === "customer_home" ? "text-[#0d631b] font-bold" : "text-[#40493d] hover:text-[#0d631b]"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => {
            setUserRole("customer");
            if (cart.length > 0) {
              setCurrentScreen("customer_cart");
            } else {
              setCurrentScreen("customer_book_garages");
            }
          }}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] transition-colors relative ${
            currentScreen === "customer_cart" ||
            currentScreen === "customer_book_package" ||
            currentScreen === "customer_book_garages" ||
            currentScreen === "customer_book_schedule"
              ? "text-[#0d631b] font-bold"
              : "text-[#40493d] hover:text-[#0d631b]"
          }`}
        >
          <div className="relative">
            <span className="material-symbols-outlined text-[22px]">
              {cart.length > 0 ? "shopping_cart" : "car_repair"}
            </span>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#0d631b] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">
            {cart.length > 0 ? `Cart (${cart.length})` : "Book Service"}
          </span>
        </button>

        <button
          onClick={() => {
            setUserRole("customer");
            setCurrentScreen("customer_tracker_inspection");
          }}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] transition-colors ${
            currentScreen === "customer_tracker_inspection" ||
            currentScreen === "customer_tracker_journey" ||
            currentScreen === "customer_tracker_ready"
              ? "text-[#0d631b] font-bold"
              : "text-[#40493d] hover:text-[#0d631b]"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">videocam</span>
          <span className="text-[10px]">Live Tracker</span>
        </button>

        <button
          onClick={() => openModal("customerSupport")}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] text-[#40493d] transition-colors hover:text-[#0d631b]"
        >
          <span className="material-symbols-outlined text-[22px]">support_agent</span>
          <span className="text-[10px]">Support</span>
        </button>
      </div>
    </nav>
  );
};
