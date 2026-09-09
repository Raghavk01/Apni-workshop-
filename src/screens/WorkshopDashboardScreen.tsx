import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { mockNearbyJobs } from "../data/mockData";
import { resolveVehicleImageUrl } from "../lib/carImageResolver";

export const WorkshopDashboardScreen: React.FC = () => {
  const {
    isWorkshopOnline,
    setIsWorkshopOnline,
    setCurrentScreen,
    openModal,
    showToast,
    bookingInfo,
    vehicle,
    customerProfile,
    acceptBookingByWorkshop,
    rejectBookingByWorkshop,
  } = useApp();

  const [countdown, setCountdown] = useState(() =>
    Math.max(0, Math.round((bookingInfo.acceptBy - Date.now()) / 1000))
  );
  const [instantRequestDismissed, setInstantRequestDismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const rem = Math.max(0, Math.round((bookingInfo.acceptBy - Date.now()) / 1000));
      setCountdown(rem);
    }, 1000);
    return () => clearInterval(timer);
  }, [bookingInfo.acceptBy]);

  const hasIncomingPending =
    bookingInfo.status === "PENDING_WORKSHOP_ACCEPTANCE" && !instantRequestDismissed && countdown > 0;

  const handleAcceptInstant = () => {
    setInstantRequestDismissed(true);
    acceptBookingByWorkshop();
    setCurrentScreen("workshop_bay_log");
  };

  const handleDeclineInstant = () => {
    setInstantRequestDismissed(true);
    rejectBookingByWorkshop();
  };

  return (
    <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full pb-24">
      {/* Workshop Status & Toggle */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0d631b] flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[24px]">storefront</span>
          </div>
          <div>
            <h3 className="font-bold text-[16px] text-[#1b1c17]">Sharma Auto Care</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-[#707a6c]">
              <span>Bay 01, 02, 03</span>
              <span>•</span>
              <span className="text-[#0d631b] font-bold">GST Verified</span>
            </div>
          </div>
        </div>

        {/* Online Switch */}
        <button
          onClick={() => {
            const next = !isWorkshopOnline;
            setIsWorkshopOnline(next);
            showToast(next ? "Sharma Auto Care is now ONLINE." : "Workshop set to OFFLINE.");
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[11px] transition-all ${
            isWorkshopOnline
              ? "bg-[#cbffc2] text-[#005312] ring-2 ring-[#0d631b]"
              : "bg-[#eae8e0] text-[#707a6c]"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isWorkshopOnline ? "bg-[#0d631b] animate-ping" : "bg-[#707a6c]"
            }`}
          ></span>
          <span>{isWorkshopOnline ? "ONLINE" : "OFFLINE"}</span>
        </button>
      </div>

      {/* SaaS Executive Business Hub Quick Launchers */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-[13px] text-[#1b1c17] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#0d631b]">business_center</span>
            Workshop SaaS Growth Hub
          </h4>
          <span className="bg-[#a3f69c] text-[#005312] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
            Executive Tools
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => openModal("customerApproval")}
            className="p-2.5 rounded-xl bg-[#f6f4ec] hover:bg-[#cbffc2]/50 border border-[#e4e3db] text-left transition-all active:scale-95 group"
          >
            <span className="material-symbols-outlined text-[20px] text-[#0d631b] block mb-1">
              edit_document
            </span>
            <span className="font-bold text-[11px] text-[#1b1c17] block leading-tight">
              WhatsApp Estimates
            </span>
            <span className="text-[9px] text-[#707a6c] block">1-Tap Approvals</span>
          </button>

          <button
            onClick={() => openModal("reminders")}
            className="p-2.5 rounded-xl bg-[#f6f4ec] hover:bg-[#cbffc2]/50 border border-[#e4e3db] text-left transition-all active:scale-95 group"
          >
            <span className="material-symbols-outlined text-[20px] text-[#0d631b] block mb-1">
              schedule_send
            </span>
            <span className="font-bold text-[11px] text-[#1b1c17] block leading-tight">
              AI Retention Engine
            </span>
            <span className="text-[9px] text-[#707a6c] block">Service & Insurance</span>
          </button>

          <button
            onClick={() => openModal("inventory")}
            className="p-2.5 rounded-xl bg-[#f6f4ec] hover:bg-[#cbffc2]/50 border border-[#e4e3db] text-left transition-all active:scale-95 group"
          >
            <span className="material-symbols-outlined text-[20px] text-[#0d631b] block mb-1">
              inventory_2
            </span>
            <span className="font-bold text-[11px] text-[#1b1c17] block leading-tight">
              OEM Inventory
            </span>
            <span className="text-[9px] text-[#707a6c] block">Barcode Scanner</span>
          </button>

          <button
            onClick={() => openModal("analytics")}
            className="p-2.5 rounded-xl bg-[#f6f4ec] hover:bg-[#cbffc2]/50 border border-[#e4e3db] text-left transition-all active:scale-95 group"
          >
            <span className="material-symbols-outlined text-[20px] text-[#0d631b] block mb-1">
              analytics
            </span>
            <span className="font-bold text-[11px] text-[#1b1c17] block leading-tight">
              Revenue Analytics
            </span>
            <span className="text-[9px] text-[#707a6c] block">Tally CSV Export</span>
          </button>
        </div>
      </div>

      {/* Today's Overview 4-Metric Grid */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-[#ffffff] p-2.5 rounded-2xl text-center border border-[#e4e3db] shadow-xs">
          <span className="text-[10px] text-[#707a6c] block font-semibold">Total</span>
          <span className="font-numeric-plate font-extrabold text-[18px] text-[#1b1c17]">3</span>
          <span className="text-[9px] text-[#40493d] block">Jobs</span>
        </div>
        <div className="bg-[#ffffff] p-2.5 rounded-2xl text-center border border-[#0d631b] shadow-xs">
          <span className="text-[10px] text-[#0d631b] block font-bold">In Bay</span>
          <span className="font-numeric-plate font-extrabold text-[18px] text-[#0d631b]">1</span>
          <span className="text-[9px] text-[#0d631b] block">Thar LX</span>
        </div>
        <div className="bg-[#ffffff] p-2.5 rounded-2xl text-center border border-[#e4e3db] shadow-xs">
          <span className="text-[10px] text-[#e65100] block font-bold">Pending</span>
          <span className="font-numeric-plate font-extrabold text-[18px] text-[#e65100]">1</span>
          <span className="text-[9px] text-[#707a6c] block">Pickup</span>
        </div>
        <div className="bg-[#ffffff] p-2.5 rounded-2xl text-center border border-[#e4e3db] shadow-xs">
          <span className="text-[10px] text-[#707a6c] block font-semibold">Done</span>
          <span className="font-numeric-plate font-extrabold text-[18px] text-[#1b1c17]">2</span>
          <span className="text-[9px] text-[#707a6c] block">Delivered</span>
        </div>
      </div>

      {/* Instant Request Banner with Timer */}
      {hasIncomingPending && (
        <div className="bg-[#ffffff] rounded-2xl p-4 border-2 border-[#e65100] shadow-md space-y-3 relative overflow-hidden animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#e65100] text-[20px] animate-pulse">
                notification_important
              </span>
              <span className="font-extrabold text-[12px] uppercase tracking-wide text-[#e65100]">
                Incoming Booking Request ({countdown}s left)
              </span>
            </div>
            <span className="font-numeric-plate font-extrabold text-[16px] text-[#0d631b]">
              ₹{bookingInfo.totalAmount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3 bg-[#f6f4ec] p-3 rounded-xl border border-[#e4e3db]">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#eae8e0] flex-shrink-0">
              <img
                src={resolveVehicleImageUrl(vehicle)}
                alt="Car"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-[14px] text-[#1b1c17] truncate">
                {customerProfile.name || vehicle.ownerName || "Vikram Malhotra"} • {vehicle.name}
              </h4>
              <p className="text-[11px] text-[#707a6c]">
                Plate: <span className="font-numeric-plate font-bold text-[#1b1c17]">{vehicle.plate}</span> • {bookingInfo.mode === "pickup" ? "Doorstep Pickup" : "Direct Drive-in"}
              </p>
              <span className="text-[10px] text-[#0d631b] font-bold block mt-0.5 truncate">
                {bookingInfo.address}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAcceptInstant}
              className="h-11 rounded-full btn-tactile-green font-bold text-[12px] flex items-center justify-center gap-1 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Accept Job & Lock Bay 03</span>
            </button>
            <button
              onClick={handleDeclineInstant}
              className="h-11 rounded-full bg-[#f0eee6] hover:bg-[#eae8e0] text-[#40493d] font-bold text-[12px] flex items-center justify-center gap-1 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span>Pass to Next Garage</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Workshop Operations (3 Buttons) */}
      <div className="space-y-2">
        <h4 className="font-bold text-[14px] text-[#1b1c17]">Quick Operations</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setCurrentScreen("workshop_bay_log")}
            className="bg-[#ffffff] p-3 rounded-2xl border border-[#e4e3db] flex flex-col items-center text-center gap-1.5 hover:border-[#0d631b] shadow-xs active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#cbffc2] flex items-center justify-center text-[#005312]">
              <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
            </div>
            <span className="font-bold text-[11px] text-[#1b1c17]">Bay 03 Live Log</span>
          </button>

          <button
            onClick={() => openModal("addEstimate")}
            className="bg-[#ffffff] p-3 rounded-2xl border border-[#e4e3db] flex flex-col items-center text-center gap-1.5 hover:border-[#0d631b] shadow-xs active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ffddb8] flex items-center justify-center text-[#794b00]">
              <span className="material-symbols-outlined text-[20px]">calculate</span>
            </div>
            <span className="font-bold text-[11px] text-[#1b1c17]">+ New Estimate</span>
          </button>

          <button
            onClick={() => openModal("aiDiagnose")}
            className="bg-[#ffffff] p-3 rounded-2xl border border-[#e4e3db] flex flex-col items-center text-center gap-1.5 hover:border-[#0d631b] shadow-xs active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#a3f69c] flex items-center justify-center text-[#005312]">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <span className="font-bold text-[11px] text-[#1b1c17]">AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Available Nearby Jobs Pool */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[14px] text-[#1b1c17]">Available Nearby Jobs (2)</h4>
          <span className="text-[11px] text-[#0d631b] font-bold">Auto-matching</span>
        </div>

        <div className="space-y-2.5">
          {mockNearbyJobs.map((job) => (
            <div
              key={job.id}
              className="bg-[#ffffff] rounded-2xl p-3 border border-[#e4e3db] flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#f0eee6] flex-shrink-0 border border-[#e4e3db]">
                  <img src={job.imageUrl} alt={job.vehicleName} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-[13px] text-[#1b1c17] truncate">{job.vehicleName}</h5>
                  <p className="text-[11px] text-[#707a6c] truncate">{job.serviceTitle}</p>
                  <span className="text-[10px] text-[#40493d] block mt-0.5">
                    {job.distanceKm} km • {job.timeframe}
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-numeric-plate font-extrabold text-[14px] text-[#0d631b] block">
                  ₹{job.payout.toLocaleString()}
                </span>
                <button
                  onClick={() => {
                    showToast(`Claimed job for ${job.vehicleName}! Assigned to Bay 02.`);
                    setCurrentScreen("workshop_bay_log");
                  }}
                  className="mt-1 px-3 py-1 rounded-full bg-[#0d631b] text-white text-[11px] font-bold shadow-xs active:scale-95"
                >
                  Claim
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Strength 80% */}
      <div className="bg-[#f6f4ec] rounded-2xl p-3.5 border border-[#e4e3db] flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[13px] text-[#1b1c17]">Profile Strength: 80%</span>
            <span className="text-[10px] bg-[#cbffc2] text-[#005312] font-bold px-1.5 py-0.2 rounded">
              High Priority
            </span>
          </div>
          <p className="text-[11px] text-[#707a6c]">Add technician certification to unlock 100% top ranking</p>
        </div>
        <button
          onClick={() => showToast("Workshop Profile Editor: Upload certificates modal opened.")}
          className="px-3 py-1.5 rounded-full bg-[#ffffff] text-[#1b1c17] font-bold text-[11px] border border-[#e4e3db]"
        >
          Update
        </button>
      </div>
    </div>
  );
};
