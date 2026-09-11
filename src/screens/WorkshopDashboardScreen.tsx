import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { mockNearbyJobs } from "../data/mockData";
import { resolveVehicleImageUrl } from "../lib/carImageResolver";
import { PickupRouteDirectionsWidget } from "../components/PickupRouteDirectionsWidget";
import {
  Store,
  Briefcase,
  FileText,
  Send,
  Package,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Camera,
  Calculator,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Truck,
  Car,
  MapPin,
  Phone,
  Clock,
  Calendar,
  Navigation,
  RefreshCw,
  X,
  UserCheck,
  Radio,
} from "lucide-react";

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
    createBookingAndDispatch,
    cart,
  } = useApp();

  const [countdown, setCountdown] = useState(() =>
    Math.max(0, Math.round((bookingInfo.acceptBy - Date.now()) / 1000))
  );
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const rem = Math.max(0, Math.round((bookingInfo.acceptBy - Date.now()) / 1000));
      setCountdown(rem);
    }, 1000);
    return () => clearInterval(timer);
  }, [bookingInfo.acceptBy]);

  const isIncomingPending = bookingInfo.status === "PENDING_WORKSHOP_ACCEPTANCE";
  const isBookingActive =
    bookingInfo.status !== "PENDING_WORKSHOP_ACCEPTANCE" &&
    bookingInfo.status !== "REJECTED" &&
    bookingInfo.status !== "COMPLETED" &&
    bookingInfo.bookingId !== "";

  const isPickupOpted = bookingInfo.mode === "pickup";

  const handleAcceptInstant = async () => {
    await acceptBookingByWorkshop();
    showToast(`✅ Job Accepted! Bay 03 assigned to ${customerProfile.name || vehicle.ownerName || "Customer"}.`);
  };

  const handleConfirmReject = async (reason?: string) => {
    setShowRejectModal(false);
    await rejectBookingByWorkshop();
    showToast(`Booking declined (${reason || rejectReason || "Workshop at capacity"}). Customer re-routed.`);
  };

  const handleSimulateNewRequest = (mode: "pickup" | "workshop" = "pickup") => {
    createBookingAndDispatch(mode);
    showToast(`⚡ New Customer Request created with ${mode === "pickup" ? "Doorstep Pickup" : "Direct Drive-in"}!`);
  };

  return (
    <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full pb-28">
      {/* Workshop Status & Toggle */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0d631b] flex items-center justify-center text-white shadow-sm">
            <Store size={22} />
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
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

      {/* 1. INCOMING REQUEST CARD (CHOICE TO ACCEPT OR REJECT) */}
      {isIncomingPending && (
        <div className="bg-[#ffffff] rounded-2xl p-4 border-2 border-[#e65100] shadow-lg space-y-3.5 relative overflow-hidden animate-in fade-in">
          {/* Header with Timer and Payout */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e65100] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e65100]"></span>
              </span>
              <div>
                <span className="font-extrabold text-[12px] uppercase tracking-wide text-[#e65100] block leading-tight">
                  New Customer Booking Request
                </span>
                <span className="text-[10px] text-[#707a6c] font-semibold">
                  Auto-reassigning in {countdown}s
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-[#707a6c] block">Workshop Payout</span>
              <span className="font-numeric-plate font-extrabold text-[18px] text-[#0d631b]">
                ₹{bookingInfo.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Customer & Vehicle Details Card */}
          <div className="bg-[#f6f4ec] p-3.5 rounded-xl border border-[#e4e3db] space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#eae8e0] shrink-0 border border-[#e4e3db]">
                <img
                  src={resolveVehicleImageUrl(vehicle)}
                  alt="Car"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-[14px] text-[#1b1c17] truncate">
                    {customerProfile.name || vehicle.ownerName || "Vikram Malhotra"}
                  </h4>
                  <span className="font-numeric-plate font-bold text-[11px] bg-white px-2 py-0.5 rounded border border-[#e4e3db] text-[#1b1c17]">
                    {vehicle.plate}
                  </span>
                </div>
                <p className="text-[12px] font-semibold text-[#40493d] mt-0.5">
                  {vehicle.name} ({vehicle.fuelType || "Diesel"})
                </p>
                <div className="flex items-center gap-2 text-[10px] text-[#707a6c] mt-1">
                  <span className="flex items-center gap-1 font-bold text-[#0d631b] bg-[#cbffc2] px-2 py-0.5 rounded-full">
                    {isPickupOpted ? <Truck size={12} /> : <Car size={12} />}
                    {isPickupOpted ? "Doorstep Pickup Opted" : "Direct Drive-in"}
                  </span>
                  <span>•</span>
                  <span>{bookingInfo.date || "Today"} ({bookingInfo.timeSlot?.split(" ")[0] || "Morning"})</span>
                </div>
              </div>
            </div>

            {/* Address Row (High Visibility for Pickup) */}
            <div className="pt-2 border-t border-[#e4e3db] flex items-start gap-1.5 text-[11px] text-[#40493d]">
              <MapPin size={14} className="text-[#e65100] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1b1c17]">
                  {isPickupOpted ? "Customer Pickup Location:" : "Drop-off Workshop:"}
                </strong>{" "}
                <span>{bookingInfo.address}</span>
              </div>
            </div>
          </div>

          {/* Explicit Choice: ACCEPT or REJECT */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleAcceptInstant}
              className="h-12 rounded-xl btn-tactile-green font-bold text-[13px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <CheckCircle2 size={18} />
              <span>Accept Job & Bay 03</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              className="h-12 rounded-xl bg-[#f0eee6] hover:bg-[#ffdad6] text-[#ba1a1a] font-bold text-[13px] flex items-center justify-center gap-2 border border-[#e4e3db] hover:border-[#ffb4ab] active:scale-98 transition-all cursor-pointer"
            >
              <XCircle size={18} />
              <span>Reject / Pass</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. IF USER OPTED FOR PICKUP: DISPLAY LIVE DIRECTIONS ON DASHBOARD */}
      {isPickupOpted && (isBookingActive || isIncomingPending) && (
        <PickupRouteDirectionsWidget
          customerName={customerProfile.name || vehicle.ownerName}
          customerPhone={customerProfile.phone}
          destinationAddress={bookingInfo.address}
          vehicleName={vehicle.name}
          vehiclePlate={vehicle.plate}
        />
      )}

      {/* Active Confirmed Job Status (when Accepted) */}
      {isBookingActive && (
        <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#0d631b]/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0d631b] animate-pulse"></span>
              <h4 className="font-extrabold text-[13px] text-[#1b1c17]">
                Active Bay 03 Job In Progress
              </h4>
            </div>
            <span className="text-[10px] font-bold bg-[#cbffc2] text-[#005312] px-2 py-0.5 rounded-full uppercase">
              {bookingInfo.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#f6f4ec] p-3 rounded-xl border border-[#e4e3db]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#eae8e0] shrink-0">
                <img src={resolveVehicleImageUrl(vehicle)} alt="Car" className="w-full h-full object-cover" />
              </div>
              <div>
                <h5 className="font-bold text-[13px] text-[#1b1c17]">{vehicle.name}</h5>
                <span className="font-numeric-plate text-[10px] text-[#707a6c]">{vehicle.plate}</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen("workshop_bay_log")}
              className="px-3 py-1.5 rounded-xl btn-tactile-green text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <span>Bay 03 Camera</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Quick Test / Simulator Trigger (If no pending request) */}
      {!isIncomingPending && (
        <div className="bg-[#f0f8ef] rounded-2xl p-3 border border-[#0d631b]/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#0d631b]" />
            <span className="text-[11px] font-bold text-[#005312]">
              Test Request Dispatcher:
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSimulateNewRequest("pickup")}
              className="px-2.5 py-1 rounded-lg bg-[#0d631b] text-white font-bold text-[10px] shadow-2xs hover:bg-[#005312] cursor-pointer"
            >
              + Doorstep Pickup Request
            </button>
            <button
              onClick={() => handleSimulateNewRequest("workshop")}
              className="px-2.5 py-1 rounded-lg bg-white text-[#1b1c17] border border-[#e4e3db] font-bold text-[10px] hover:bg-[#f6f4ec] cursor-pointer"
            >
              + Self Drive Request
            </button>
          </div>
        </div>
      )}

      {/* SaaS Executive Business Hub Quick Launchers */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-[13px] text-[#1b1c17] flex items-center gap-1.5">
            <Briefcase size={16} className="text-[#0d631b]" />
            Workshop SaaS Growth Hub
          </h4>
          <span className="bg-[#a3f69c] text-[#005312] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
            Executive Tools
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={() => openModal("geofencing")}
            className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-all active:scale-95 group cursor-pointer"
          >
            <Radio size={18} className="text-[#0d631b] mb-1 animate-pulse" />
            <span className="font-bold text-[11px] text-[#005312] block leading-tight">
              Geofence Radar
            </span>
            <span className="text-[9px] text-[#707a6c] block mt-0.5">Auto Entry / Exit</span>
          </button>

          <button
            onClick={() => openModal("customerApproval")}
            className="p-2.5 rounded-xl bg-[#f6f4ec] hover:bg-[#cbffc2]/50 border border-[#e4e3db] text-left transition-all active:scale-95 group cursor-pointer"
          >
            <FileText size={18} className="text-[#0d631b] mb-1 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-[11px] text-[#1b1c17] block leading-tight">
              WhatsApp Estimates
            </span>
            <span className="text-[9px] text-[#707a6c] block mt-0.5">1-Tap Approvals</span>
          </button>

          <button
            onClick={() => openModal("reminders")}
            className="p-2.5 rounded-xl bg-[#f6f4ec] hover:bg-[#cbffc2]/50 border border-[#e4e3db] text-left transition-all active:scale-95 group cursor-pointer"
          >
            <Send size={18} className="text-[#0d631b] mb-1 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-[11px] text-[#1b1c17] block leading-tight">
              AI Retention Engine
            </span>
            <span className="text-[9px] text-[#707a6c] block mt-0.5">Service & Insurance</span>
          </button>

          <button
            onClick={() => openModal("inventory")}
            className="p-2.5 rounded-xl bg-[#f6f4ec] hover:bg-[#cbffc2]/50 border border-[#e4e3db] text-left transition-all active:scale-95 group cursor-pointer"
          >
            <Package size={18} className="text-[#0d631b] mb-1 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-[11px] text-[#1b1c17] block leading-tight">
              OEM Inventory
            </span>
            <span className="text-[9px] text-[#707a6c] block mt-0.5">Barcode Scanner</span>
          </button>

          <button
            onClick={() => openModal("analytics")}
            className="p-2.5 rounded-xl bg-[#f6f4ec] hover:bg-[#cbffc2]/50 border border-[#e4e3db] text-left transition-all active:scale-95 group cursor-pointer"
          >
            <BarChart3 size={18} className="text-[#0d631b] mb-1 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-[11px] text-[#1b1c17] block leading-tight">
              Revenue Analytics
            </span>
            <span className="text-[9px] text-[#707a6c] block mt-0.5">Tally CSV Export</span>
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
          <span className="font-numeric-plate font-extrabold text-[18px] text-[#e65100]">
            {isIncomingPending ? "1" : "0"}
          </span>
          <span className="text-[9px] text-[#707a6c] block">Pickup</span>
        </div>
        <div className="bg-[#ffffff] p-2.5 rounded-2xl text-center border border-[#e4e3db] shadow-xs">
          <span className="text-[10px] text-[#707a6c] block font-semibold">Done</span>
          <span className="font-numeric-plate font-extrabold text-[18px] text-[#1b1c17]">2</span>
          <span className="text-[9px] text-[#707a6c] block">Delivered</span>
        </div>
      </div>

      {/* Quick Workshop Operations (3 Buttons) */}
      <div className="space-y-2">
        <h4 className="font-bold text-[14px] text-[#1b1c17]">Quick Operations</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setCurrentScreen("workshop_bay_log")}
            className="bg-[#ffffff] p-3 rounded-2xl border border-[#e4e3db] flex flex-col items-center text-center gap-1.5 hover:border-[#0d631b] shadow-xs active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#cbffc2] flex items-center justify-center text-[#005312] group-hover:scale-105 transition-transform">
              <Camera size={20} />
            </div>
            <span className="font-bold text-[11px] text-[#1b1c17]">Bay 03 Live Log</span>
          </button>

          <button
            onClick={() => openModal("addEstimate")}
            className="bg-[#ffffff] p-3 rounded-2xl border border-[#e4e3db] flex flex-col items-center text-center gap-1.5 hover:border-[#0d631b] shadow-xs active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ffddb8] flex items-center justify-center text-[#794b00] group-hover:scale-105 transition-transform">
              <Calculator size={20} />
            </div>
            <span className="font-bold text-[11px] text-[#1b1c17]">+ New Estimate</span>
          </button>

          <button
            onClick={() => openModal("aiDiagnose")}
            className="bg-[#ffffff] p-3 rounded-2xl border border-[#e4e3db] flex flex-col items-center text-center gap-1.5 hover:border-[#0d631b] shadow-xs active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#a3f69c] flex items-center justify-center text-[#005312] group-hover:scale-105 transition-transform">
              <Sparkles size={20} />
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
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#f0eee6] shrink-0 border border-[#e4e3db]">
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

              <div className="text-right shrink-0">
                <span className="font-numeric-plate font-extrabold text-[14px] text-[#0d631b] block">
                  ₹{job.payout.toLocaleString()}
                </span>
                <button
                  onClick={() => {
                    showToast(`Claimed job for ${job.vehicleName}! Assigned to Bay 02.`);
                    setCurrentScreen("workshop_bay_log");
                  }}
                  className="mt-1 px-3 py-1 rounded-full bg-[#0d631b] text-white text-[11px] font-bold shadow-xs active:scale-95 cursor-pointer hover:bg-[#094813]"
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
          className="px-3 py-1.5 rounded-full bg-[#ffffff] text-[#1b1c17] font-bold text-[11px] border border-[#e4e3db] cursor-pointer hover:bg-[#f0eee6]"
        >
          Update
        </button>
      </div>

      {/* REJECT REASONS MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-[#e4e3db]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#ba1a1a]">
                <XCircle size={20} />
                <h4 className="font-extrabold text-[15px] text-[#1b1c17]">Decline Booking Request</h4>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="w-7 h-7 rounded-full bg-[#f0eee6] flex items-center justify-center text-[#707a6c] hover:bg-[#eae8e0] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-[12px] text-[#707a6c]">
              Please select a reason for declining. The request will automatically be re-routed to the next verified partner workshop.
            </p>

            <div className="space-y-2">
              {[
                "All 3 Hydraulic Bays at 100% capacity",
                "OEM spare parts stock delay",
                "Customer location outside preferred pickup radius",
                "Time slot overlap with existing engine overhaul",
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleConfirmReject(reason)}
                  className="w-full text-left p-2.5 rounded-xl border border-[#e4e3db] hover:border-[#ba1a1a] hover:bg-[#ffdad6]/30 text-[12px] font-semibold text-[#1b1c17] transition-all cursor-pointer"
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleConfirmReject("Immediate pass")}
                className="w-full py-2.5 rounded-xl bg-[#ba1a1a] text-white font-bold text-[12px] hover:bg-[#93000a] cursor-pointer"
              >
                Confirm Decline & Re-route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


