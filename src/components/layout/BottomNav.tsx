import React from "react";
import { useApp } from "../../context/AppContext";
import {
  Home,
  Wrench,
  Activity,
  Headphones,
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
} from "lucide-react";

export const BottomNav: React.FC = () => {
  const { currentScreen, setCurrentScreen, userRole, setUserRole, openModal, cart } = useApp();

  // Hide on welcome screen
  if (currentScreen === "welcome") {
    return null;
  }

  // Workshop / Mechanic Bottom Nav
  if (userRole === "workshop" || currentScreen === "workshop_dashboard" || currentScreen === "workshop_bay_log") {
    return (
      <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#fbf9f1]/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.04)] border-t border-[#e4e3db]/80">
        <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
          <button
            onClick={() => {
              setUserRole("workshop");
              setCurrentScreen("workshop_dashboard");
            }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-all cursor-pointer ${
              currentScreen === "workshop_dashboard"
                ? "text-[#0d631b] font-bold"
                : "text-[#556052] hover:text-[#1b1c17]"
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${currentScreen === "workshop_dashboard" ? "bg-[#0d631b]/10" : ""}`}>
              <LayoutDashboard size={20} />
            </div>
            <span className="text-[10px] mt-0.5">Dashboard</span>
          </button>

          <button
            onClick={() => {
              setUserRole("workshop");
              setCurrentScreen("workshop_bay_log");
            }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-all cursor-pointer ${
              currentScreen === "workshop_bay_log"
                ? "text-[#0d631b] font-bold"
                : "text-[#556052] hover:text-[#1b1c17]"
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${currentScreen === "workshop_bay_log" ? "bg-[#0d631b]/10" : ""}`}>
              <ClipboardList size={20} />
            </div>
            <span className="text-[10px] mt-0.5">Live Bay Log</span>
          </button>

          <button
            onClick={() => openModal("customerSupport")}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-[#556052] hover:text-[#0d631b] transition-all cursor-pointer"
          >
            <div className="p-1 rounded-xl">
              <Headphones size={20} />
            </div>
            <span className="text-[10px] mt-0.5">Support Desk</span>
          </button>
        </div>
      </nav>
    );
  }

  // Customer Bottom Nav
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#fbf9f1]/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.04)] border-t border-[#e4e3db]/80">
      <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
        <button
          onClick={() => {
            setUserRole("customer");
            setCurrentScreen("customer_home");
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-all cursor-pointer ${
            currentScreen === "customer_home"
              ? "text-[#0d631b] font-bold"
              : "text-[#556052] hover:text-[#0d631b]"
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${currentScreen === "customer_home" ? "bg-[#0d631b]/10" : ""}`}>
            <Home size={20} />
          </div>
          <span className="text-[10px] mt-0.5">Home</span>
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
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-all relative cursor-pointer ${
            currentScreen === "customer_cart" ||
            currentScreen === "customer_book_package" ||
            currentScreen === "customer_book_garages" ||
            currentScreen === "customer_book_schedule"
              ? "text-[#0d631b] font-bold"
              : "text-[#556052] hover:text-[#0d631b]"
          }`}
        >
          <div className="relative">
            <div
              className={`p-1 rounded-xl transition-colors ${
                currentScreen === "customer_cart" ||
                currentScreen === "customer_book_package" ||
                currentScreen === "customer_book_garages" ||
                currentScreen === "customer_book_schedule"
                  ? "bg-[#0d631b]/10"
                  : ""
              }`}
            >
              {cart.length > 0 ? <ShoppingCart size={20} /> : <Wrench size={20} />}
            </div>
            {cart.length > 0 && (
              <span className="absolute -top-0.5 -right-1 bg-[#0d631b] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">
            {cart.length > 0 ? `Cart (${cart.length})` : "Book Service"}
          </span>
        </button>

        <button
          onClick={() => {
            setUserRole("customer");
            setCurrentScreen("customer_tracker_journey");
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-all cursor-pointer ${
            currentScreen === "customer_tracker_inspection" ||
            currentScreen === "customer_tracker_journey" ||
            currentScreen === "customer_tracker_ready"
              ? "text-[#0d631b] font-bold"
              : "text-[#556052] hover:text-[#0d631b]"
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              currentScreen === "customer_tracker_inspection" ||
              currentScreen === "customer_tracker_journey" ||
              currentScreen === "customer_tracker_ready"
                ? "bg-[#0d631b]/10"
                : ""
            }`}
          >
            <Activity size={20} />
          </div>
          <span className="text-[10px] mt-0.5">Live Bay</span>
        </button>

        <button
          onClick={() => openModal("customerSupport")}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-[#556052] transition-all hover:text-[#0d631b] cursor-pointer"
        >
          <div className="p-1 rounded-xl">
            <Headphones size={20} />
          </div>
          <span className="text-[10px] mt-0.5">Support</span>
        </button>
      </div>
    </nav>
  );
};

