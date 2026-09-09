import React from "react";
import { useApp } from "../context/AppContext";

export const CustomerLiveTrackerReadyScreen: React.FC = () => {
  const {
    feedback,
    setFeedbackStar,
    toggleFeedbackChip,
    setFeedbackComment,
    submitFeedback,
    vehicle,
    openModal,
    setCurrentScreen,
    showToast,
  } = useApp();

  const feedbackChips = [
    "Transparent pricing",
    "Good behavior",
    "On-time delivery",
    "Clean workshop",
    "Genuine OEM parts",
    "Detailed video updates",
  ];

  return (
    <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full pb-24">
      {/* Ready Celebration Card */}
      <div className="bg-gradient-to-br from-[#0d631b] to-[#00390a] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mx-auto border border-white/30 shadow-inner">
          <span className="material-symbols-outlined text-[32px]">task_alt</span>
        </div>

        <h2 className="font-extrabold text-[20px] text-white leading-tight">
          Your Thar is Ready!
        </h2>
        <p className="text-[12px] text-white/80 max-w-xs mx-auto">
          All service works and quality checks completed. Your car is spotless and ready for doorstep delivery.
        </p>

        {/* 3 Status Badges */}
        <div className="pt-3 flex justify-center items-center gap-2">
          <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">check</span> Serviced
          </span>
          <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">verified</span> QC Passed (94%)
          </span>
          <span className="bg-[#cbffc2] text-[#005312] text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
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
            <span className="text-[11px] text-[#707a6c]">Sharma Auto Care • GSTIN Verified</span>
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
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
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

        {/* Feedback chips */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {feedbackChips.map((chip) => {
            const isSelected = feedback.selectedChips.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                onClick={() => toggleFeedbackChip(chip)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  isSelected
                    ? "bg-[#cbffc2] text-[#005312] border border-[#0d631b]"
                    : "bg-[#f6f4ec] text-[#40493d] hover:bg-[#f0eee6]"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={feedback.comment}
          onChange={(e) => setFeedbackComment(e.target.value)}
          placeholder="Add comments for technician Suresh..."
          className="w-full p-2.5 bg-[#f6f4ec] rounded-xl text-[12px] text-[#1b1c17] outline-none border border-[#e4e3db]"
        />

        <button
          onClick={submitFeedback}
          disabled={feedback.submitted}
          className="w-full h-11 rounded-full btn-tactile-green font-bold text-[12px] flex items-center justify-center gap-1 active:scale-95 transition-all disabled:opacity-60"
        >
          {feedback.submitted ? (
            <>
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Feedback Submitted</span>
            </>
          ) : (
            <span>Submit Rating & Review</span>
          )}
        </button>
      </div>

      {/* Return Home Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            showToast("Returned to Apni Workshop Home.");
            setCurrentScreen("customer_home");
          }}
          className="w-full h-12 rounded-full bg-[#f0eee6] hover:bg-[#eae8e0] text-[#1b1c17] font-bold text-[13px] flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          <span>Back to Home Screen</span>
        </button>
      </div>
    </div>
  );
};
