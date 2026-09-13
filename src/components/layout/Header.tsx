import React from "react";
import { useApp } from "../../context/AppContext";
import {
  ArrowLeft,
  Store,
  Headphones,
  Layers,
  LogOut,
  ShoppingCart,
  Wrench,
  Radio,
} from "lucide-react";

export const Header: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    userRole,
    isWorkshopOnline,
    openModal,
    logoutCustomer,
    customerProfile,
    cart,
    ambulanceState,
  } = useApp();

  const handleBack = () => {
    switch (currentScreen) {
      case "customer_book_garages":
        setCurrentScreen("customer_home");
        break;
      case "customer_book_package":
        setCurrentScreen("customer_book_garages");
        break;
      case "customer_cart":
        setCurrentScreen("customer_book_package");
        break;
      case "customer_book_schedule":
        setCurrentScreen(cart.length > 0 ? "customer_cart" : "customer_book_package");
        break;
      case "customer_tracker_inspection":
      case "customer_tracker_journey":
      case "customer_tracker_ready":
        setCurrentScreen("customer_home");
        break;
      case "workshop_bay_log":
        setCurrentScreen("workshop_dashboard");
        break;
      default:
        setCurrentScreen("customer_home");
    }
  };

  const isHome = currentScreen === "customer_home" || currentScreen === "workshop_dashboard";

  // Hide header on welcome screen
  if (currentScreen === "welcome") {
    return null;
  }

  // Workshop screen header
  if (userRole === "workshop" || currentScreen === "workshop_dashboard" || currentScreen === "workshop_bay_log") {
    return (
      <header className="fixed top-0 inset-x-0 z-40 bg-[#fbf9f1]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isHome && (
              <button
                onClick={handleBack}
                aria-label="Back"
                className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-[#1b1c17] hover:bg-[#f0eee6] active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-[#0d631b]/10 flex items-center justify-center text-[#0d631b] border border-[#0d631b]/20">
              <Store size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] text-[#1b1c17] leading-tight tracking-tight">
                Sharma Auto Care
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isWorkshopOnline ? "bg-[#0d631b] animate-pulse" : "bg-[#ba1a1a]"
                  }`}
                ></span>
                <span className="text-[10px] text-[#0d631b] tracking-wide uppercase font-bold">
                  {isWorkshopOnline ? "Online Bay" : "Offline"}
                </span>
                <span className="text-[10px] text-[#707a6c]">• Sector 62</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Geofence Radar Status Button */}
            <button
              onClick={() => openModal("geofencing")}
              className="px-2.5 py-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-[#005312] text-[11px] font-bold flex items-center gap-1 shadow-2xs active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              title="Workshop Geofence Radar"
            >
              <Radio size={13} className="text-[#0d631b] animate-pulse" />
              <span className="hidden xs:inline">Geofence</span>
            </button>

            {/* 24x7 Ambulance SOS Button */}
            <button
              onClick={() => openModal("ambulanceDispatch")}
              className={`px-2.5 py-1.5 rounded-full text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer ${
                ambulanceState?.isDispatched
                  ? "bg-rose-700 animate-pulse ring-2 ring-rose-400"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
              title="Request 24x7 Emergency Ambulance"
            >
              <span>🚑</span>
              <span className="font-bold">{ambulanceState?.isDispatched ? ambulanceState.numberPlate : "SOS"}</span>
            </button>

            <button
              onClick={() => openModal("customerSupport")}
              className="px-2.5 py-1.5 rounded-full bg-[#0d631b] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer hover:bg-[#094813]"
              title="Support & Helpdesk"
            >
              <Headphones size={14} />
              <span className="hidden xs:inline">Support</span>
            </button>

            <button
              onClick={() => openModal("screenDrawer")}
              aria-label="Screen Drawer"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#40493d] hover:bg-[#f0eee6] hover:text-[#1b1c17] active:scale-95 transition-colors cursor-pointer"
              title="Switch Screens"
            >
              <Layers size={17} />
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Customer Screen Header (Home, Booking, Tracker)
  const getCustomerHeaderTitle = () => {
    switch (currentScreen) {
      case "customer_book_garages":
        return "Select Certified Workshop";
      case "customer_book_package":
        return "Services & Add-ons";
      case "customer_cart":
        return `Service Cart (${cart.length})`;
      case "customer_book_schedule":
        return "Schedule Slot & Pickup";
      case "customer_tracker_inspection":
      case "customer_tracker_journey":
      case "customer_tracker_ready":
        return "Live Bay Tracker";
      default:
        return "Apni Workshop";
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#fbf9f1]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          {!isHome ? (
            <button
              onClick={handleBack}
              aria-label="Back"
              className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-[#1b1c17] hover:bg-[#f0eee6] active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[#0d631b] flex items-center justify-center text-white shadow-xs shrink-0">
              <Wrench size={18} />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            {isHome ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[16px] text-[#1b1c17] leading-none tracking-tight">
                    Apni Workshop
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase tracking-wide">
                    Live Bay
                  </span>
                </div>
                <span className="text-[11px] text-[#707a6c] font-medium leading-none mt-1 truncate">
                  {customerProfile.name ? `${customerProfile.name} • ${customerProfile.plate}` : "DL 4C BE 1081"}
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-[#707a6c] font-semibold uppercase leading-none">Apni Workshop</span>
                <h1 className="font-bold text-[15px] text-[#1b1c17] leading-tight tracking-tight truncate">
                  {getCustomerHeaderTitle()}
                </h1>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Geofence Radar Status Button */}
          <button
            onClick={() => openModal("geofencing")}
            className="px-2.5 py-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-[#005312] text-[11px] font-bold flex items-center gap-1 shadow-2xs active:scale-95 transition-all whitespace-nowrap cursor-pointer"
            title="Workshop Geofence Radar"
          >
            <Radio size={13} className="text-[#0d631b] animate-pulse" />
            <span className="hidden sm:inline">Geofence</span>
          </button>

          {/* 24x7 Ambulance SOS Button */}
          <button
            onClick={() => openModal("ambulanceDispatch")}
            className={`px-2.5 py-1.5 rounded-full text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer ${
              ambulanceState?.isDispatched
                ? "bg-rose-700 animate-pulse ring-2 ring-rose-400"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
            title="Request 24x7 Emergency Ambulance (108 Network)"
          >
            <span>🚑</span>
            <span className="font-extrabold">
              {ambulanceState?.isDispatched ? ambulanceState.numberPlate : "SOS"}
            </span>
          </button>

          {/* Quick Cart button if items in cart */}
          {cart.length > 0 && currentScreen !== "customer_cart" && (
            <button
              onClick={() => setCurrentScreen("customer_cart")}
              className="relative px-2.5 py-1.5 rounded-full bg-[#cbffc2] text-[#005312] text-[11px] font-bold flex items-center gap-1 shadow-2xs hover:bg-[#b2f5a6] transition-all cursor-pointer"
              title="View Service Cart & Apply Coupons"
            >
              <ShoppingCart size={15} />
              <span className="font-extrabold">{cart.length}</span>
            </button>
          )}

          {/* Customer Support button */}
          <button
            onClick={() => openModal("customerSupport")}
            className="px-2.5 py-1.5 rounded-full bg-[#0d631b] hover:bg-[#094813] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer"
            title="Customer Support & Helpdesk"
          >
            <Headphones size={13} />
            <span className="hidden sm:inline">Support</span>
          </button>

          {/* Quick Screen Selector */}
          <button
            onClick={() => openModal("screenDrawer")}
            aria-label="All Screens Navigator"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#40493d] hover:bg-[#f0eee6] hover:text-[#1b1c17] active:scale-95 transition-colors cursor-pointer"
            title="Switch Screen"
          >
            <Layers size={17} />
          </button>

          {/* Logout / Switch Profile button */}
          <button
            onClick={logoutCustomer}
            className="w-8 h-8 rounded-full bg-[#f0eee6] hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-[#40493d] transition-all cursor-pointer"
            title="Switch Vehicle / Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};

