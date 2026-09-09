import React from "react";
import { useApp } from "../context/AppContext";

export const CustomerLiveTrackerInspectionScreen: React.FC = () => {
  const {
    approvalRequest,
    approveWork,
    skipWork,
    liveUpdates,
    vehicle,
    openModal,
    setCurrentScreen,
    showToast,
  } = useApp();

  const stages = [
    { label: "Pickup", status: "done", icon: "local_shipping" },
    { label: "Inspection", status: "current", icon: "search_check" },
    { label: "Approval", status: approvalRequest.status === "approved" ? "done" : "current", icon: "thumb_up" },
    { label: "Repair", status: "upcoming", icon: "build" },
    { label: "QC & Ready", status: "upcoming", icon: "verified" },
  ];

  return (
    <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full pb-24">
      {/* Top Hero Status Card */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#cbffc2] text-[#005312] text-[10px] font-extrabold uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#005312] animate-ping"></span>
              Stage 2 of 5
            </span>
            <h2 className="font-bold text-[18px] text-[#1b1c17] mt-1 leading-tight">
              Your Thar is under inspection
            </h2>
            <p className="text-[12px] text-[#707a6c] mt-0.5">
              Estimated Delivery Today, 6:30 PM
            </p>
          </div>

          <div className="text-right">
            <span className="bg-[#f6f4ec] px-2 py-0.5 rounded font-numeric-plate text-[11px] font-bold text-[#40493d] border border-[#e4e3db]">
              {vehicle.plate}
            </span>
          </div>
        </div>

        {/* 5-Stage Stepper */}
        <div className="pt-2 border-t border-[#f0eee6]">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-[#eae8e0] -z-0"></div>
            {stages.map((st, i) => (
              <div key={i} className="flex flex-col items-center gap-1 z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] transition-all ${
                    st.status === "done"
                      ? "bg-[#0d631b] text-white shadow-xs"
                      : st.status === "current"
                      ? "bg-[#cbffc2] text-[#005312] ring-2 ring-[#0d631b] font-bold"
                      : "bg-[#eae8e0] text-[#707a6c]"
                  }`}
                >
                  {st.status === "done" ? (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold text-center leading-tight ${
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
            <h3 className="font-bold text-[16px] text-[#1b1c17] mt-1">{approvalRequest.componentName}</h3>
            <p className="text-[12px] text-[#707a6c]">{approvalRequest.partsInfo}</p>
            <span className="text-[11px] text-[#40493d] font-medium block">
              Recommended by: {approvalRequest.recommendedBy}
            </span>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[10px] text-[#707a6c] block">Quote (Parts + Labor)</span>
            <span className="font-numeric-plate font-extrabold text-[18px] text-[#0d631b]">
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
                className="h-11 rounded-full btn-tactile-green font-bold text-[12px] flex items-center justify-center gap-1 shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Approve Work (₹3,200)</span>
              </button>
              <button
                onClick={() => skipWork(approvalRequest.id)}
                className="h-11 rounded-full bg-[#f0eee6] hover:bg-[#eae8e0] text-[#40493d] font-bold text-[12px] flex items-center justify-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
                <span>Skip Item</span>
              </button>
            </div>

            <button
              onClick={() => openModal("customerApproval")}
              className="w-full py-2.5 rounded-full bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">edit_document</span>
              <span>Open Interactive WhatsApp Estimate & E-Sign</span>
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
              <button
                onClick={() => showToast("Calling Head Technician Suresh at Sharma Auto Care...")}
                className="flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-[14px]">call</span>
                <span>Speak to Suresh</span>
              </button>
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
                  ? "Approved by Vikram Malhotra at 10:18 AM"
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
          <h3 className="font-bold text-[15px] text-[#1b1c17]">Live Bay Updates</h3>
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
              <h4 className="font-bold text-[14px] text-[#1b1c17]">Sharma Auto Care (Bay 03)</h4>
              <p className="text-[11px] text-[#707a6c]">Sector 62, Noida • Master Tech: Suresh Kumar</p>
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
        className="w-full h-12 rounded-2xl bg-[#f6f4ec] hover:bg-[#f0eee6] border border-[#e4e3db] font-bold text-[13px] text-[#1b1c17] flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
      >
        <span className="material-symbols-outlined text-[#0d631b] text-[20px]">fact_check</span>
        <span>View Detailed 40-Pt Inspection Health Card</span>
      </button>

      {/* Switch to Ready Screen Demo CTA */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={() => setCurrentScreen("customer_tracker_ready")}
          className="text-[12px] text-[#0d631b] font-bold flex items-center gap-1 hover:underline"
        >
          <span>Simulate Completed Service & Car Ready Screen</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
