import React from "react";
import { useApp } from "../context/AppContext";

export const TaxInvoiceModal: React.FC = () => {
  const { isModalOpen, closeModal, vehicle, showToast } = useApp();

  if (!isModalOpen?.taxInvoice) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end p-3 pb-safe animate-in fade-in duration-200">
      <div className="bg-[#ffffff] rounded-2xl p-4 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-[#e4e3db]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f0eee6]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#cbffc2] flex items-center justify-center text-[#005312]">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#1b1c17]">GST Tax Invoice</h3>
              <p className="text-[11px] text-[#707a6c]">Invoice #AW-2026-INV-84920</p>
            </div>
          </div>
          <button
            onClick={() => closeModal("taxInvoice")}
            className="w-8 h-8 rounded-full bg-[#f0eee6] flex items-center justify-center text-[#40493d] hover:bg-[#eae8e0]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Invoice Body */}
        <div className="overflow-y-auto py-3 space-y-3 text-[13px] text-[#1b1c17]">
          {/* Workshop & Customer Header */}
          <div className="bg-[#f6f4ec] rounded-xl p-3 flex justify-between items-start border border-[#e4e3db]">
            <div>
              <span className="font-bold text-[14px] text-[#1b1c17] block">Sharma Auto Care</span>
              <span className="text-[11px] text-[#707a6c] block">GSTIN: 07AAAAA0000A1Z5</span>
              <span className="text-[11px] text-[#707a6c] block">Bay 03, Sector 62, Noida, UP</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-[12px] block">Customer: {vehicle.ownerName}</span>
              <span className="bg-[#eae8e0] px-1.5 py-0.5 rounded font-numeric-plate text-[11px] font-bold">
                {vehicle.plate}
              </span>
              <span className="text-[11px] text-[#707a6c] block mt-0.5">Date: Today</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-[12px] text-[#40493d] uppercase tracking-wider">Itemized Breakdown</h4>
            
            <div className="bg-[#f6f4ec] rounded-xl p-3 space-y-2 border border-[#e4e3db]/70">
              <div className="flex justify-between items-start pb-1.5 border-b border-[#e4e3db]">
                <div>
                  <p className="font-semibold text-[13px]">Castrol Magnatec 5W-40 Synthetic Oil (6L)</p>
                  <span className="text-[11px] text-[#707a6c]">OEM Grade Engine Oil Refill</span>
                </div>
                <span className="font-bold">₹1,450</span>
              </div>

              <div className="flex justify-between items-start pb-1.5 border-b border-[#e4e3db]">
                <div>
                  <p className="font-semibold text-[13px]">{vehicle.name.includes("PRIV") || vehicle.name.includes("LTD") ? (vehicle.model?.split(" ")[0] || "OEM") : (vehicle.name.split(" ")[0] || "OEM")} OEM Oil Filter & Washer</p>
                  <span className="text-[11px] text-[#707a6c]">Part #M4092-OF</span>
                </div>
                <span className="font-bold">₹750</span>
              </div>

              <div className="flex justify-between items-start pb-1.5 border-b border-[#e4e3db]">
                <div>
                  <p className="font-semibold text-[13px]">Front Ceramic Brake Pad Kit + Labor</p>
                  <span className="text-[11px] text-[#707a6c]">Replacement & Caliper Greasing</span>
                </div>
                <span className="font-bold">₹2,500</span>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-[13px]">40-Point Inspection & Car Foam Wash</p>
                  <span className="text-[11px] text-[#0d631b] font-bold">Complimentary with Service</span>
                </div>
                <span className="text-[#0d631b] font-bold">FREE</span>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-[#f6f4ec] rounded-xl p-3 space-y-1.5 border border-[#e4e3db]">
            <div className="flex justify-between text-[12px] text-[#40493d]">
              <span>Service Labor Total</span>
              <span>₹2,500</span>
            </div>
            <div className="flex justify-between text-[12px] text-[#40493d]">
              <span>Parts & Lubricants Total</span>
              <span>₹2,200</span>
            </div>
            <div className="flex justify-between text-[12px] text-[#40493d]">
              <span>GST & Cess (18% & 28% mixed)</span>
              <span>₹450</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-[#e4e3db] font-bold text-[16px] text-[#0d631b]">
              <span>Total Amount Paid (via UPI)</span>
              <span className="font-numeric-plate text-[18px]">₹5,150</span>
            </div>
          </div>

          {/* Guarantee stamp */}
          <div className="p-2.5 bg-[#cbffc2]/30 rounded-xl flex items-center gap-2 border border-[#91f78e]">
            <span className="material-symbols-outlined text-[#0d631b] text-[20px]">verified_user</span>
            <span className="text-[11px] text-[#005312] font-semibold">
              Covered under Apni Guarantee: 30 Days / 1,000 KM Workshop Warranty on Parts & Labor.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#f0eee6] flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              showToast("Downloading Official GST Tax Invoice PDF...");
              setTimeout(() => {
                closeModal("taxInvoice");
                showToast("Tax Invoice downloaded successfully!");
              }, 1000);
            }}
            className="flex-1 h-11 rounded-full btn-tactile-green font-bold text-[13px] flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Download Invoice PDF</span>
          </button>
          <button
            type="button"
            onClick={() => closeModal("taxInvoice")}
            className="h-11 px-4 rounded-full bg-[#f0eee6] text-[#1b1c17] font-semibold text-[12px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
