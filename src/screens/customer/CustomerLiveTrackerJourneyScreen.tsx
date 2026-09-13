import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";

interface CustomerLiveTrackerJourneyScreenProps {
  defaultTab?: "journey" | "inspection" | "ready";
}

export const CustomerLiveTrackerJourneyScreen: React.FC<CustomerLiveTrackerJourneyScreenProps> = ({
  defaultTab = "journey",
}) => {
  const {
    bookingInfo,
    selectedGarage,
    vehicle,
    setCurrentScreen,
    setUserRole,
    acceptBookingByWorkshop,
    openModal,
    showToast,
    approvalRequest,
    approveWork,
    skipWork,
    liveUpdates,
    feedback,
    setFeedbackStar,
    toggleFeedbackChip,
    setFeedbackComment,
    submitFeedback,
    geofenceConfig,
    trackedVehicle,
    geofenceEvents,
    triggerGeofenceSimulation,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"journey" | "inspection" | "ready">(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() =>
    Math.max(0, Math.round((bookingInfo.acceptBy - Date.now()) / 1000))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const rem = Math.max(0, Math.round((bookingInfo.acceptBy - Date.now()) / 1000));
      setSecondsRemaining(rem);
    }, 1000);
    return () => clearInterval(timer);
  }, [bookingInfo.acceptBy]);

  const isPendingAcceptance = bookingInfo.status === "PENDING_WORKSHOP_ACCEPTANCE";

  const journeySteps = [
    {
      title: "Booking Confirmed",
      time: "09:45 AM",
      desc: "Standard periodic service package scheduled.",
      status: isPendingAcceptance ? "current" : "done",
      icon: "check_circle",
    },
    {
      title: "Workshop Assigned",
      time: isPendingAcceptance ? "Awaiting Confirmation (90s)" : "Confirmed",
      desc: `${selectedGarage.name} ${isPendingAcceptance ? "is allocating Bay 03" : "accepted the job"}.`,
      status: isPendingAcceptance ? "upcoming" : "done",
      icon: "storefront",
    },
    {
      title: "Pickup Partner En Route",
      time: isPendingAcceptance ? "Scheduled after bay confirm" : "Now • ETA 10:15 AM",
      desc: "Driver Rahul Sharma (4.9★) is navigating to your Sector 15A address.",
      status: isPendingAcceptance ? "upcoming" : "current",
      icon: "local_shipping",
      highlight: !isPendingAcceptance,
    },
    {
      title: "Car Picked Up & Bay Inspection",
      time: "Est. 10:30 AM",
      desc: "Visual condition checklist and odometer reading logged.",
      status: "upcoming",
      icon: "checklist",
    },
    {
      title: "Vehicle Servicing in Bay 03",
      time: "Est. 11:00 AM",
      desc: "Engine oil replacement, brake overhaul, fluid top-up.",
      status: "upcoming",
      icon: "build",
    },
    {
      title: "Quality Check & Car Spa",
      time: "Est. 01:30 PM",
      desc: "40-point road test and foam vacuum cleaning.",
      status: "upcoming",
      icon: "verified",
    },
    {
      title: "Out for Return Delivery",
      time: "Est. 02:30 PM",
      desc: "Delivered back to your doorstep with digital invoice.",
      status: "upcoming",
      icon: "task_alt",
    },
  ];

  const stages = [
    { label: "Pickup", status: "done", icon: "local_shipping" },
    { label: "Inspection", status: "current", icon: "search_check" },
    { label: "Approval", status: approvalRequest.status === "approved" ? "done" : "current", icon: "thumb_up" },
    { label: "Repair", status: "upcoming", icon: "build" },
    { label: "QC & Ready", status: "upcoming", icon: "verified" },
  ];

  const feedbackChips = [
    "Transparent pricing",
    "Good behavior",
    "On-time delivery",
    "Clean workshop",
    "Genuine OEM parts",
    "Detailed video updates",
  ];

  return (
    <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full pb-32">
      {/* Dynamic Tracker Status Header Bar */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#707a6c] uppercase font-bold tracking-wider block">
              Booking Ref
            </span>
            <h3 className="font-bold text-[16px] text-[#1b1c17]">{bookingInfo.bookingId}</h3>
          </div>
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
              isPendingAcceptance
                ? "bg-[#fff3e0] text-[#e65100] border border-[#ffcc80]"
                : "bg-[#cbffc2] text-[#005312] border border-[#91f78e]"
            }`}
          >
            {isPendingAcceptance ? "Awaiting Confirmation (90s)" : "Active Live Bay Session"}
          </span>
        </div>

        <div className="bg-[#f6f4ec] p-3 rounded-xl flex items-center justify-between text-[12px] border border-[#e4e3db]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0d631b] text-[20px]">directions_car</span>
            <div>
              <span className="font-bold text-[#1b1c17]">{vehicle.name}</span>
              <span className="text-[11px] text-[#707a6c] block">{vehicle.plate}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#707a6c] block">
              {bookingInfo.isPaid ? "Secured Online" : "Pay after Service"}
            </span>
            <span className="font-numeric-plate font-bold text-[14px] text-[#0d631b]">
              ₹{bookingInfo.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Tab Controls to Navigate All Service Tracker Phases */}
      <div className="bg-[#f0f8ef] p-1.5 rounded-2xl border border-[#c8e6c9] flex items-center justify-between gap-1 shadow-2xs">
        <button
          onClick={() => setActiveTab("journey")}
          className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-extrabold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === "journey"
              ? "bg-[#0d631b] text-white shadow-sm"
              : "text-[#2e4c27] hover:bg-white/60"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">route</span>
          <span>1. Timeline</span>
        </button>
        <button
          onClick={() => setActiveTab("inspection")}
          className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-extrabold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer relative ${
            activeTab === "inspection"
              ? "bg-[#0d631b] text-white shadow-sm"
              : "text-[#2e4c27] hover:bg-white/60"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">engineering</span>
          <span>2. Live Bay</span>
          {approvalRequest.status === "pending" && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full animate-ping"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("ready")}
          className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-extrabold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === "ready"
              ? "bg-[#0d631b] text-white shadow-sm"
              : "text-[#2e4c27] hover:bg-white/60"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">receipt_long</span>
          <span>3. Bill & Rate</span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}

      {/* TAB 1: JOURNEY TIMELINE & GPS */}
      {activeTab === "journey" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* 90-Second Workshop Acceptance Radar Banner */}
          {isPendingAcceptance && (
            <div className="bg-[#ffffff] rounded-2xl p-4 border-2 border-[#e65100] shadow-md space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e65100] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e65100]"></span>
                  </span>
                  <span className="font-extrabold text-[12px] uppercase tracking-wide text-[#e65100]">
                    Workshop Confirmation Window
                  </span>
                </div>
                <span className="font-numeric-plate font-black text-[15px] px-2.5 py-0.5 rounded-full bg-[#fff3e0] text-[#e65100] border border-[#ffcc80]">
                  {secondsRemaining}s left
                </span>
              </div>

              <p className="text-[12px] text-[#40493d] leading-relaxed">
                Dispatched to <strong>{selectedGarage.name}</strong>. Workshop owner has 90 seconds to review slot and lock mechanic Bay 03.
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-[#f0eee6] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#e65100] h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${Math.min(100, Math.max(5, (secondsRemaining / 90) * 100))}%` }}
                />
              </div>

              {/* Interactive Simulation Controls for Reviewers */}
              <div className="pt-2 border-t border-[#f0eee6] flex items-center gap-2">
                <button
                  onClick={() => acceptBookingByWorkshop()}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#0d631b] hover:bg-[#094813] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  <span>Accept as Workshop</span>
                </button>
                <button
                  onClick={() => {
                    setUserRole("workshop");
                    setCurrentScreen("workshop_dashboard");
                  }}
                  className="py-2 px-3 rounded-xl bg-[#f0eee6] hover:bg-[#eae8e0] text-[#1b1c17] font-bold text-[11px] flex items-center gap-1 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[15px]">storefront</span>
                  <span>Open Workshop View</span>
                </button>
              </div>
            </div>
          )}

          {/* Pickup Driver Active Card */}
          <div className="bg-[#ffffff] rounded-2xl p-4 border-2 border-[#0d631b] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#eae8e0] border border-[#e4e3db] flex-shrink-0">
                  <img
                    src="https://lh3.googleusercontent.com/aida/AEtjO1X3dHXKGr9197jaJNNNbBCTjX7JCMlbHWD5UsOFWjMip2YrxWGgl2ZuoVvlDI5ukFoSSjrDrbyloCbgCFz4PSn_FaSRWtxtUpmfUZfnmeXbMeu9ZJ74QoTvFW0vzsryupvAmTlbL-dABWeC425PGCko6V61gTq2ytJjxT_oR5_4pbzOAiQNggGLt0TD7EVqr2_hElESG8g9n9nAJ0wgxDSkEnJAaa580H6lZXO5l7wuPE5Kwya7uV4T-s0"
                    alt="Driver"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-[14px] text-[#1b1c17]">Rahul Sharma</h4>
                    <span className="text-[11px] font-bold text-[#e65100] flex items-center">
                      <span className="material-symbols-outlined text-[13px]">star</span> 4.9
                    </span>
                  </div>
                  <p className="text-[11px] text-[#707a6c]">Verified Apni Pickup Partner</p>
                  <span className="text-[10px] bg-[#cbffc2] text-[#005312] px-2 py-0.5 rounded-full font-bold inline-block mt-0.5">
                    ETA: 10:15 AM (12 mins away)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#f0eee6]">
              <a
                href="tel:9911169253"
                onClick={() => showToast("Opening phone app to call Driver Rahul Sharma (9911169253)...")}
                className="h-10 rounded-xl bg-[#0d631b] hover:bg-[#005312] text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer no-underline"
              >
                <span className="material-symbols-outlined text-[15px]">call</span>
                <span>Call Driver</span>
              </a>
              <button
                onClick={() => openModal("liveMap")}
                className="h-10 rounded-xl bg-[#cbffc2] text-[#005312] font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">explore</span>
                <span>Live GPS</span>
              </button>
              <button
                onClick={() => openModal("liveChat")}
                className="h-10 rounded-xl bg-[#f0eee6] hover:bg-[#eae8e0] text-[#1b1c17] font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">chat</span>
                <span>Chat</span>
              </button>
            </div>
          </div>

          {/* Workshop Geofencing Proximity & Radar Card */}
          <div className="bg-[#ffffff] rounded-2xl p-4 border-2 border-[#0d631b] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#005312] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px] animate-pulse">radar</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[14px] text-[#1b1c17]">Workshop Geofence Radar</h4>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                        trackedVehicle.isInsideGeofence
                          ? "bg-[#cbffc2] text-[#005312]"
                          : "bg-[#fff3e0] text-[#e65100]"
                      }`}
                    >
                      {trackedVehicle.isInsideGeofence ? "Inside Perimeter" : "Outside Perimeter"}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#707a6c]">
                    Perimeter Radius: {(geofenceConfig.radiusMeters / 1000).toFixed(1)} km around {selectedGarage.name || geofenceConfig.workshopName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => openModal("geofencing")}
                className="text-[11px] font-extrabold text-[#0d631b] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Config Radar</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            {/* Vehicle Proximity Telemetry */}
            <div className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e4e3db] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">📍</span>
                <div>
                  <span className="text-[12px] font-bold text-[#1b1c17] block">
                    Distance: {(trackedVehicle.distanceToWorkshopMeters / 1000).toFixed(2)} km
                  </span>
                  <span className="text-[10px] text-[#707a6c]">
                    Live Speed: {trackedVehicle.speedKm} km/h • Heading: {trackedVehicle.heading}°
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => triggerGeofenceSimulation("enter_workshop")}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0d631b] text-white font-bold text-[10px] shadow-2xs active:scale-95 transition-all cursor-pointer"
                  title="Simulate vehicle crossing inside workshop radius"
                >
                  🟢 Trigger Entry
                </button>
                <button
                  onClick={() => triggerGeofenceSimulation("exit_test_drive")}
                  className="px-2.5 py-1.5 rounded-lg bg-[#e65100] text-white font-bold text-[10px] shadow-2xs active:scale-95 transition-all cursor-pointer"
                  title="Simulate vehicle exiting workshop for test drive"
                >
                  🚗 Trigger Exit
                </button>
              </div>
            </div>

            {/* Quick latest event badge */}
            {geofenceEvents.length > 0 && (
              <div className="text-[11px] text-[#40493d] flex items-center justify-between pt-1 border-t border-black/5">
                <span className="truncate flex items-center gap-1">
                  <span className="text-[#0d631b] font-bold">Latest Alert:</span>
                  <span className="truncate">{geofenceEvents[0].message}</span>
                </span>
                <span className="text-[10px] text-[#707a6c] shrink-0 font-medium">
                  {geofenceEvents[0].timestamp}
                </span>
              </div>
            )}
          </div>

          {/* Live Vertical Journey Timeline */}
          <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[15px] text-[#1b1c17]">Live Service Journey</h3>
              <button
                onClick={() => showToast("Status refreshed: Pickup partner is 1.2 km away.")}
                className="text-[11px] text-[#0d631b] font-bold flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-4 relative pl-2 pt-1">
              {journeySteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  {idx !== journeySteps.length - 1 && (
                    <div
                      className={`absolute left-3.5 top-6 bottom-0 w-0.5 ${
                        step.status === "done" ? "bg-[#0d631b]" : "bg-[#eae8e0]"
                      }`}
                    ></div>
                  )}

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      step.status === "done"
                        ? "bg-[#0d631b] text-white"
                        : step.status === "current"
                        ? "bg-[#cbffc2] text-[#005312] ring-2 ring-[#0d631b] animate-pulse"
                        : "bg-[#eae8e0] text-[#707a6c]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">{step.icon}</span>
                  </div>

                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-[13px] font-bold ${
                          step.status === "current" ? "text-[#0d631b]" : "text-[#1b1c17]"
                        }`}
                      >
                        {step.title}
                      </h4>
                      <span className="text-[10px] text-[#707a6c]">{step.time}</span>
                    </div>
                    <p className="text-[11px] text-[#40493d] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab("inspection")}
            className="w-full h-11 rounded-2xl bg-[#0d631b] text-white font-bold text-[12px] flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
          >
            <span>Next Stage: Live Bay Inspection</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      )}

      {/* TAB 2: LIVE BAY INSPECTION & APPROVALS */}
      {activeTab === "inspection" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top Stage Stepper */}
          <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#cbffc2] text-[#005312] text-[10px] font-extrabold uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#005312] animate-ping"></span>
                  Stage 2 of 5
                </span>
                <h2 className="font-bold text-[16px] text-[#1b1c17] mt-1 leading-tight">
                  Your car is undergoing inspection
                </h2>
                <p className="text-[11px] text-[#707a6c] mt-0.5">
                  Estimated Delivery Today, 6:30 PM
                </p>
              </div>
            </div>

            {/* 5-Stage Stepper */}
            <div className="pt-2 border-t border-[#f0eee6]">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-[#eae8e0] -z-0"></div>
                {stages.map((st, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] transition-all ${
                        st.status === "done"
                          ? "bg-[#0d631b] text-white shadow-xs"
                          : st.status === "current"
                          ? "bg-[#cbffc2] text-[#005312] ring-2 ring-[#0d631b] font-bold"
                          : "bg-[#eae8e0] text-[#707a6c]"
                      }`}
                    >
                      {st.status === "done" ? (
                        <span className="material-symbols-outlined text-[13px]">check</span>
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-[8px] font-bold text-center leading-tight ${
                        st.status === "current" ? "text-[#0d631b]" : "text-[#707a6c]"
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Priority Approval Required Card */}
          <div className="bg-[#ffffff] rounded-2xl p-4 border-2 border-[#ffb74d] shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#e65100] text-[18px]">warning</span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#e65100]">
                    Priority Approval Required
                  </span>
                </div>
                <h3 className="font-bold text-[15px] text-[#1b1c17] mt-1">{approvalRequest.componentName}</h3>
                <p className="text-[11px] text-[#707a6c]">{approvalRequest.partsInfo}</p>
                <span className="text-[10px] text-[#40493d] font-medium block">
                  Recommended by: {approvalRequest.recommendedBy}
                </span>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-[10px] text-[#707a6c] block">Quote (Parts + Labor)</span>
                <span className="font-numeric-plate font-extrabold text-[16px] text-[#0d631b]">
                  ₹{approvalRequest.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Evidence Photo Preview */}
            <div className="bg-[#f6f4ec] rounded-xl p-2.5 flex items-center gap-3 border border-[#e4e3db]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2rM3gBm5JAcnLJ5Fkfo0IxCq0KK5Rb7nM30KVY5Gaft2ztdLyW_movAPdY7X6F-s3zqOnI268Fp7VkkH585HcMjJDNXP5FS41l6nEB4_v2yQG5BhjuzCIiBnDjEbdDMwBuQhlesvvVBQxKGRxNZR1JPGTm1q58hqmN7R09_0_w3k4HTxg--lxpOmTno3TQW1edOXrFmzle0doS8z7FQbRc1dbn0Khp8iPzFgDyVjvp11HZtgywARr"
                alt="Worn brake pad evidence"
                className="w-16 h-14 object-cover rounded-lg border border-[#e4e3db]"
              />
              <div className="text-[11px] text-[#40493d] leading-snug">
                <strong className="text-[#ba1a1a] font-bold block">Bay Observation: 2.1mm Pad Thickness</strong>
                Friction lining worn beyond safe limit. Rotor scoring may occur if unreplaced.
              </div>
            </div>

            {/* Action Buttons */}
            {approvalRequest.status === "pending" ? (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => approveWork(approvalRequest.id)}
                    className="h-10 rounded-full btn-tactile-green font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                    <span>Approve (₹3,200)</span>
                  </button>
                  <button
                    onClick={() => skipWork(approvalRequest.id)}
                    className="h-10 rounded-full bg-[#f0eee6] hover:bg-[#eae8e0] text-[#40493d] font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                    <span>Skip Item</span>
                  </button>
                </div>

                <button
                  onClick={() => openModal("customerApproval")}
                  className="w-full py-2 rounded-full bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_document</span>
                  <span>WhatsApp Estimate & E-Sign</span>
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] pt-1 text-[#0d631b] font-semibold">
                  <button
                    onClick={() => openModal("whatsapp")}
                    className="flex items-center gap-1 hover:underline text-[#075e54]"
                  >
                    <span className="material-symbols-outlined text-[14px]">chat</span>
                    <span>WhatsApp Quote</span>
                  </button>
                  <span>•</span>
                  <a
                    href="tel:9911169253"
                    onClick={() => showToast("Calling Head Technician Suresh (9911169253)...")}
                    className="flex items-center gap-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-[14px]">call</span>
                    <span>Speak to Suresh</span>
                  </a>
                  <span>•</span>
                  <button
                    onClick={() => openModal("liveChat")}
                    className="flex items-center gap-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                    <span>Ask AI Advisor</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#cbffc2]/40 rounded-xl p-3 flex items-center justify-between border border-[#0d631b]">
                <div className="flex items-center gap-2 text-[#005312]">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  <span className="font-bold text-[12px]">
                    {approvalRequest.status === "approved"
                      ? "Approved by Customer at 10:18 AM"
                      : "Skipped by Customer"}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#0d631b]">In Progress</span>
              </div>
            )}
          </div>

          {/* Live Bay Updates Carousel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[14px] text-[#1b1c17]">Live Bay Updates</h3>
              <span className="text-[11px] text-[#0d631b] font-bold">Real-time Stream</span>
            </div>

            <div className="space-y-2.5">
              {liveUpdates.map((upd) => (
                <div
                  key={upd.id}
                  className="bg-[#ffffff] rounded-2xl p-3 border border-[#e4e3db] flex items-center gap-3 shadow-xs"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f0eee6] relative flex-shrink-0 border border-[#e4e3db]">
                    <img src={upd.mediaUrl} alt={upd.title} className="w-full h-full object-cover" />
                    {upd.mediaType === "video" && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[18px]">play_circle</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-[13px] text-[#1b1c17] truncate">{upd.title}</h4>
                      <span className="text-[10px] text-[#707a6c]">{upd.time}</span>
                    </div>
                    <p className="text-[11px] text-[#40493d] line-clamp-2 mt-0.5">{upd.description}</p>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase inline-block mt-1.5 ${
                        upd.tagType === "warning"
                          ? "bg-[#ffdad6] text-[#ba1a1a]"
                          : upd.tagType === "success"
                          ? "bg-[#cbffc2] text-[#005312]"
                          : "bg-[#eae8e0] text-[#40493d]"
                      }`}
                    >
                      {upd.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workshop Card */}
          <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#0d631b] flex items-center justify-center text-white shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">storefront</span>
                </div>
                <div>
                  <h4 className="font-bold text-[14px] text-[#1b1c17]">{selectedGarage.name} (Bay 03)</h4>
                  <p className="text-[11px] text-[#707a6c]">{selectedGarage.locationArea} • Tech Lead: Suresh Kumar</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#f0eee6]">
              <button
                onClick={() => showToast("Connecting to Workshop Hotline: 0120-4928001")}
                className="h-9 rounded-xl bg-[#f6f4ec] text-[#1b1c17] font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-[#f0eee6]"
              >
                <span className="material-symbols-outlined text-[15px]">call</span>
                <span>Call Bay</span>
              </button>

              <button
                onClick={() => openModal("liveChat")}
                className="h-9 rounded-xl bg-[#f6f4ec] text-[#1b1c17] font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-[#f0eee6]"
              >
                <span className="material-symbols-outlined text-[15px]">chat</span>
                <span>Live Chat</span>
              </button>

              <button
                onClick={() => showToast("Apni Concierge ticket opened: Our lead service advisor will call you in 2 mins.")}
                className="h-9 rounded-xl bg-[#f6f4ec] text-[#ba1a1a] font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-[#f0eee6]"
              >
                <span className="material-symbols-outlined text-[15px]">flag</span>
                <span>Raise Issue</span>
              </button>
            </div>
          </div>

          {/* 40-Point Inspection Action CTA */}
          <button
            onClick={() => openModal("inspectionChecklist")}
            className="w-full h-12 rounded-2xl bg-[#f6f4ec] hover:bg-[#f0eee6] border border-[#e4e3db] font-bold text-[12px] text-[#1b1c17] flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[#0d631b] text-[18px]">fact_check</span>
            <span>View Detailed 40-Pt Inspection Health Card</span>
          </button>

          <button
            onClick={() => setActiveTab("ready")}
            className="w-full h-11 rounded-2xl bg-[#0d631b] text-white font-bold text-[12px] flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
          >
            <span>Next Stage: Completed Invoice & Rate</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      )}

      {/* TAB 3: CAR READY, BILL BREAKDOWN & RATING */}
      {activeTab === "ready" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Ready Celebration Card */}
          <div className="bg-gradient-to-br from-[#0d631b] to-[#00390a] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mx-auto border border-white/30 shadow-inner">
              <span className="material-symbols-outlined text-[32px]">task_alt</span>
            </div>

            <h2 className="font-extrabold text-[20px] text-white leading-tight">
              Your Car is Ready!
            </h2>
            <p className="text-[12px] text-white/80 max-w-xs mx-auto">
              All service works and quality checks completed. Your car is spotless and ready for doorstep delivery.
            </p>

            {/* Status Badges */}
            <div className="pt-2 flex justify-center items-center gap-2 flex-wrap">
              <span className="bg-white/20 text-white text-[9px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">check</span> Serviced
              </span>
              <span className="bg-white/20 text-white text-[9px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">verified</span> QC Passed (94%)
              </span>
              <span className="bg-[#cbffc2] text-[#005312] text-[9px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#005312] animate-pulse"></span> Ready
              </span>
            </div>
          </div>

          {/* Visual Before vs After Card Comparison */}
          <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[15px] text-[#1b1c17]">Visual Proof: Before vs After</h3>
              <span className="text-[11px] text-[#0d631b] font-bold">100% Genuine Parts</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Before */}
              <div className="bg-[#f6f4ec] rounded-xl p-2 border border-[#e4e3db] space-y-1.5">
                <div className="h-28 rounded-lg overflow-hidden bg-[#eae8e0] relative">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2rM3gBm5JAcnLJ5Fkfo0IxCq0KK5Rb7nM30KVY5Gaft2ztdLyW_movAPdY7X6F-s3zqOnI268Fp7VkkH585HcMjJDNXP5FS41l6nEB4_v2yQG5BhjuzCIiBnDjEbdDMwBuQhlesvvVBQxKGRxNZR1JPGTm1q58hqmN7R09_0_w3k4HTxg--lxpOmTno3TQW1edOXrFmzle0doS8z7FQbRc1dbn0Khp8iPzFgDyVjvp11HZtgywARr"
                    alt="Before Worn Pad"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-[#ba1a1a] text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">
                    Before
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#ba1a1a]">Worn 2.1mm Pad</p>
                <p className="text-[10px] text-[#707a6c] leading-tight">Metallic wear debris & scoring on disc</p>
              </div>

              {/* After */}
              <div className="bg-[#f6f4ec] rounded-xl p-2 border border-[#e4e3db] space-y-1.5">
                <div className="h-28 rounded-lg overflow-hidden bg-[#eae8e0] relative">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdNXrIvKrD1yN7nINMoJfjKSJjuFDhpZuEIBZUeMOuGO_QkcSAoIhY7_y610lKnUqsOVrCvP5JI5vXq6d5TJ7ZBquqmcyeDae-CAKwfXU-s1tu4wpof97Z73sJlbgqI0D0SpL69db1qjDsiW5mL3JhEmwdlMZoOQRIivZ9SBzeIYBe9etehIDgLeJtQDv4NE3t4V6J4tY5KikV1ej_NKvh53_MSrfnB1SNxPdy4LFP5hhH1KKRsD8J"
                    alt="After New Ceramic Pad"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-[#0d631b] text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">
                    After
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#0d631b]">New OEM Ceramic Kit</p>
                <p className="text-[10px] text-[#707a6c] leading-tight">12mm new pad thickness & anti-squeal grease</p>
              </div>
            </div>
          </div>

          {/* Bill & Invoice Card */}
          <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[15px] text-[#1b1c17]">Service Bill Breakdown</h3>
                <p className="text-[11px] text-[#707a6c]">{selectedGarage.name} • GSTIN Verified</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#707a6c] block">Total Amount Paid</span>
                <span className="font-numeric-plate font-extrabold text-[18px] text-[#0d631b]">
                  ₹5,150
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-[12px] text-[#40493d] bg-[#f6f4ec] p-3 rounded-xl border border-[#e4e3db]">
              <div className="flex justify-between">
                <span>Periodic 30,000 KM Standard Package</span>
                <span className="font-semibold text-[#1b1c17]">₹2,699</span>
              </div>
              <div className="flex justify-between">
                <span>Front Ceramic Brake Pad Kit + Fitting</span>
                <span className="font-semibold text-[#1b1c17]">₹2,451</span>
              </div>
              <div className="flex justify-between text-[#0d631b]">
                <span>Doorstep Delivery & 40-Pt Inspection</span>
                <span className="font-bold">FREE</span>
              </div>
            </div>

            <button
              onClick={() => openModal("taxInvoice")}
              className="w-full h-11 rounded-xl bg-[#f0eee6] hover:bg-[#eae8e0] text-[#1b1c17] font-bold text-[12px] flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-[#0d631b]">receipt_long</span>
              <span>View & Download Official GST Invoice</span>
            </button>
          </div>

          {/* Rate Experience & Feedback Section */}
          <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] space-y-3 shadow-xs">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-[15px] text-[#1b1c17]">How was your workshop experience?</h3>
              <p className="text-[11px] text-[#707a6c]">Your ratings help maintain top-rated workshop quality</p>
            </div>

            {/* 5-Star Row */}
            <div className="flex justify-center items-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackStar(star)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <span
                    className={`material-symbols-outlined text-[32px] ${
                      star <= feedback.stars ? "text-[#fbc02d] [font-variation-settings:'FILL' 1]" : "text-[#d1cfc7]"
                    }`}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>

            {/* Feedback Tags */}
            <div className="flex flex-wrap gap-1.5 justify-center py-1">
              {feedbackChips.map((chip) => {
                const isSelected = feedback.selectedChips.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleFeedbackChip(chip)}
                    className={`text-[11px] px-3 py-1.5 rounded-full border transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? "bg-[#cbffc2] text-[#005312] border-[#0d631b] font-bold"
                        : "bg-[#f6f4ec] text-[#40493d] border-[#e4e3db] hover:bg-[#eae8e0]"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            {/* Feedback Comment input */}
            <div className="space-y-1.5">
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Share any specific remarks about the mechanic, service quality, or doorstep delivery experience..."
                rows={3}
                className="w-full text-[12px] p-3 rounded-xl bg-[#f6f4ec] border border-[#e4e3db] focus:ring-1 focus:ring-[#0d631b] focus:outline-none placeholder:text-[#a2a097]"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={() => {
                submitFeedback();
                showToast("Thank you for your rating! Your feedback has been logged.");
                setCurrentScreen("customer_home");
              }}
              className="w-full h-11 rounded-full btn-tactile-green font-bold text-[12px] shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Submit Rating & Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
