import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

export const AddEstimateModal: React.FC = () => {
  const { isModalOpen, closeModal, addEstimate, requestBayApproval, showToast } = useApp();
  const [component, setComponent] = useState("Rear Shock Absorber Bushings leaking");
  const [partsCost, setPartsCost] = useState("1500");
  const [laborCost, setLaborCost] = useState("600");
  const [sending, setSending] = useState(false);

  if (!isModalOpen?.addEstimate) return null;

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      const parts = Number(partsCost) || 1500;
      const labor = Number(laborCost) || 600;
      const total = parts + labor;

      addEstimate({
        title: component || "Additional Bay Diagnostic Issue",
        subTitle: "Customer Approval Requested via WhatsApp",
        approved: false,
        totalCost: total,
        breakdown: [
          { label: `• Genuine Component Parts`, cost: parts },
          { label: `• Replacement Labor & Fitting`, cost: labor },
        ],
        tag: "Fair Market Price Guaranteed",
        stockStatus: "Stock in Bay",
      });

      requestBayApproval({
        componentName: component || "Rear Shock Absorber Bushings leaking",
        partsInfo: `Genuine OEM parts (₹${parts}) + Fitting Labor (₹${labor})`,
        price: total,
        recommendedBy: "Suresh (Bay 03 Head Tech)",
      });

      setSending(false);
      closeModal("addEstimate");
      showToast("Estimate dispatched to car owner via SMS, in-app approval & WhatsApp!");
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#30312c]/60 backdrop-blur-xs flex flex-col justify-end p-4 pb-safe animate-in fade-in slide-in-from-bottom duration-200">
      <div className="bg-[#ffffff] rounded-2xl p-4 shadow-xl flex flex-col gap-3 border border-[#e4e3db]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ffddb8] flex items-center justify-center text-[#2a1700]">
              <span className="material-symbols-outlined text-[18px]">engineering</span>
            </div>
            <h4 className="font-bold text-[16px] text-[#1b1c17]">Add Bay Diagnostic Issue</h4>
          </div>
          <button
            onClick={() => closeModal("addEstimate")}
            className="w-8 h-8 rounded-full bg-[#f0eee6] flex items-center justify-center text-[#40493d] hover:bg-[#eae8e0]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="text-[12px] text-[#40493d]">
          Found additional wear during inspection? Send immediate price quote & bay picture directly to Mr. Vikram Malhotra for 1-tap approval.
        </p>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-[#40493d] uppercase tracking-wider">
            Detected Component Issue
          </label>
          <div className="bg-[#f6f4ec] rounded-xl px-3 py-2 flex items-center gap-2 border border-[#e4e3db]">
            <span className="material-symbols-outlined text-[#0d631b] text-[18px]">search</span>
            <input
              type="text"
              value={component}
              onChange={(e) => setComponent(e.target.value)}
              placeholder="e.g. Rear Shock Absorber Bushings leaking"
              className="bg-transparent text-[#1b1c17] text-[13px] w-full outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#40493d] uppercase tracking-wider">
              Est. Parts (₹)
            </label>
            <input
              type="number"
              value={partsCost}
              onChange={(e) => setPartsCost(e.target.value)}
              placeholder="1,500"
              className="bg-[#f6f4ec] rounded-xl px-3 py-2 font-numeric-plate text-[16px] text-[#1b1c17] outline-none border border-[#e4e3db]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#40493d] uppercase tracking-wider">
              Est. Labor (₹)
            </label>
            <input
              type="number"
              value={laborCost}
              onChange={(e) => setLaborCost(e.target.value)}
              placeholder="600"
              className="bg-[#f6f4ec] rounded-xl px-3 py-2 font-numeric-plate text-[16px] text-[#1b1c17] outline-none border border-[#e4e3db]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={() => showToast("Bay camera attached: 1 close-up photo added to estimate draft.")}
            className="flex-1 h-11 rounded-xl bg-[#f0eee6] hover:bg-[#eae8e0] text-[#1b1c17] font-semibold text-[12px] flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            <span>Attach Evidence</span>
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={handleSend}
            className="flex-1 h-11 rounded-xl bg-[#0d631b] hover:bg-[#005312] text-white font-bold text-[12px] flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
          >
            {sending ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">send</span>
            )}
            <span>{sending ? "Sending..." : "Request Approval"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
