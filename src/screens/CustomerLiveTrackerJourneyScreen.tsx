import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

export const CustomerLiveTrackerJourneyScreen: React.FC = () => {
  const {
    bookingInfo,
    selectedGarage,
    vehicle,
    setCurrentScreen,
    setUserRole,
    acceptBookingByWorkshop,
    openModal,
    showToast,
  } = useApp();

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

  return (
    <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full pb-24">
      {/* 90-Second Workshop Acceptance Radar Banner */}
      {isPendingAcceptance && (
        <div className="bg-[#ffffff] rounded-2xl p-4 border-2 border-[#e65100] shadow-md space-y-3 relative overflow-hidden animate-in fade-in">
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

      {/* Booking Identifier Card */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#707a6c] uppercase font-bold tracking-wider">
              Booking Ref
            </span>
            <h3 className="font-bold text-[16px] text-[#1b1c17]">{bookingInfo.bookingId}</h3>
          </div>
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
              isPendingAcceptance
                ? "bg-[#fff3e0] text-[#e65100] border border-[#ffcc80]"
                : "bg-[#cbffc2] text-[#005312]"
            }`}
          >
            {isPendingAcceptance ? "Awaiting Bay Lock (90s)" : "Pickup En Route"}
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
              {bookingInfo.isPaid ? "Total Paid" : "Pay at Workshop"}
            </span>
            <span className="font-numeric-plate font-bold text-[14px] text-[#0d631b]">
              ₹{bookingInfo.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

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
          <button
            onClick={() => showToast("Calling Pickup Partner Rahul Sharma (+91 98712 34567)...")}
            className="h-10 rounded-xl bg-[#0d631b] text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[15px]">call</span>
            <span>Call</span>
          </button>
          <button
            onClick={() => openModal("liveMap")}
            className="h-10 rounded-xl bg-[#cbffc2] text-[#005312] font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95"
          >
            <span className="material-symbols-outlined text-[15px]">explore</span>
            <span>Live GPS</span>
          </button>
          <button
            onClick={() => openModal("liveChat")}
            className="h-10 rounded-xl bg-[#f0eee6] hover:bg-[#eae8e0] text-[#1b1c17] font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95"
          >
            <span className="material-symbols-outlined text-[15px]">chat</span>
            <span>Chat</span>
          </button>
        </div>
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

      {/* Advance to Live Bay Inspection Demo Button */}
      <button
        onClick={() => {
          showToast("Simulating arrival at Sharma Auto Care Bay 03...");
          setCurrentScreen("customer_tracker_inspection");
        }}
        className="w-full h-12 rounded-2xl bg-[#f6f4ec] hover:bg-[#f0eee6] border border-[#e4e3db] font-bold text-[13px] text-[#0d631b] flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
      >
        <span>Jump to Bay Inspection & Approval View</span>
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
    </div>
  );
};
