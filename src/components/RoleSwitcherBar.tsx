import React from "react";
import { useApp } from "../context/AppContext";
import { UserRole, ScreenView } from "../types";
import {
  User,
  Store,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowRight,
} from "lucide-react";

export const RoleSwitcherBar: React.FC = () => {
  const { userRole, setUserRole, currentScreen, setCurrentScreen, openModal } = useApp();

  const customerScreens: ScreenView[] = [
    "customer_home",
    "customer_book_garages",
    "customer_book_package",
    "customer_cart",
    "customer_book_schedule",
    "customer_tracker_journey",
  ];

  const workshopScreens: ScreenView[] = [
    "workshop_dashboard",
    "workshop_bay_log",
  ];

  const activeFlow = userRole === "workshop" ? workshopScreens : customerScreens;
  const currentIndex = activeFlow.indexOf(currentScreen);

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    if (role === "customer") {
      setCurrentScreen("customer_home");
    } else if (role === "workshop") {
      setCurrentScreen("workshop_dashboard");
    }
  };

  const handleNextPage = () => {
    if (currentIndex >= 0 && currentIndex < activeFlow.length - 1) {
      setCurrentScreen(activeFlow[currentIndex + 1]);
    } else if (currentIndex === activeFlow.length - 1) {
      setCurrentScreen(activeFlow[0]);
    } else {
      setCurrentScreen(activeFlow[0]);
    }
  };

  const handlePrevPage = () => {
    if (currentIndex > 0) {
      setCurrentScreen(activeFlow[currentIndex - 1]);
    } else if (currentIndex === 0) {
      setCurrentScreen(activeFlow[activeFlow.length - 1]);
    }
  };

  const getScreenDisplayName = (screen: ScreenView) => {
    switch (screen) {
      case "welcome":
        return "Login / OTP";
      case "customer_home":
        return "Home Garage";
      case "customer_book_garages":
        return "Garages";
      case "customer_book_package":
        return "Services";
      case "customer_cart":
        return "Cart";
      case "customer_book_schedule":
        return "Schedule";
      case "customer_tracker_journey":
        return "Live Bay";
      case "customer_tracker_inspection":
        return "Live Bay";
      case "customer_tracker_ready":
        return "Tax Invoice";
      case "workshop_dashboard":
        return "Dashboard";
      case "workshop_bay_log":
        return "Bay Logger";
      default:
        return "Screen";
    }
  };

  // Don't show top dev role bar on the onboarding welcome screen to keep it clean
  if (currentScreen === "welcome") {
    return null;
  }

  return (
    <div className="bg-[#f2efe6] border-b border-[#e4e3db] px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 text-[11px] select-none sticky top-16 z-30 shadow-2xs">
      {/* Role Switcher Pill */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-[#707a6c] uppercase font-bold tracking-wider hidden sm:inline mr-0.5">
          Role:
        </span>
        <div className="inline-flex rounded-full bg-[#e3e0d5] p-0.5 border border-[#d8d5cb]">
          <button
            onClick={() => handleRoleChange("customer")}
            className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
              userRole === "customer"
                ? "bg-[#0d631b] text-white shadow-xs"
                : "text-[#556052] hover:text-[#1b1c17]"
            }`}
          >
            <User size={12} />
            <span>Customer</span>
          </button>
          <button
            onClick={() => handleRoleChange("workshop")}
            className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
              userRole === "workshop"
                ? "bg-[#0d631b] text-white shadow-xs"
                : "text-[#556052] hover:text-[#1b1c17]"
            }`}
          >
            <Store size={12} />
            <span>Workshop</span>
          </button>
        </div>
      </div>

      {/* Screen Quick Stepper & Picker */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          onClick={handlePrevPage}
          title="Previous Screen"
          className="h-7 px-2 rounded-lg bg-white hover:bg-[#e4e3db] text-[#40493d] hover:text-[#1b1c17] border border-[#e4e3db] flex items-center gap-1 text-[11px] font-bold shadow-2xs cursor-pointer transition-colors"
        >
          <ChevronLeft size={14} />
          <span className="hidden xs:inline">Prev</span>
        </button>

        {/* Screen Drawer Picker */}
        <button
          onClick={() => openModal("screenDrawer")}
          className="h-7 flex items-center gap-1.5 text-[#40493d] font-bold hover:text-[#0d631b] bg-white px-2.5 rounded-lg border border-[#e4e3db] shadow-2xs transition-colors whitespace-nowrap cursor-pointer hover:border-[#0d631b]/40"
        >
          <Layers size={13} className="text-[#0d631b]" />
          <span className="text-[11px] font-bold text-[#1b1c17] truncate max-w-[90px] sm:max-w-[120px]">
            {getScreenDisplayName(currentScreen)}
          </span>
          <span className="text-[9px] bg-[#f0eee6] text-[#707a6c] px-1 py-0.2 rounded font-medium">
            {currentIndex + 1}/{activeFlow.length}
          </span>
        </button>

        {/* Dedicated Next Page Button */}
        <button
          onClick={handleNextPage}
          title="Next Screen"
          className="h-7 px-2.5 rounded-lg bg-[#0d631b] hover:bg-[#094813] text-white flex items-center gap-1 text-[11px] font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

