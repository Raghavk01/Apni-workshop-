import React, { useState } from "react";
import { WorkEstimateItem } from "../types";

interface CustomerApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimates: WorkEstimateItem[];
  onToggleEstimate: (id: string) => void;
  onApproveAll: () => void;
  onPayNow: () => void;
  showToast: (msg: string) => void;
}

export const CustomerApprovalModal: React.FC<CustomerApprovalModalProps> = ({
  isOpen,
  onClose,
  estimates,
  onToggleEstimate,
  onApproveAll,
  onPayNow,
  showToast,
}) => {
  const [signatureName, setSignatureName] = useState("Vikram Malhotra");
  const [hasSigned, setHasSigned] = useState(true);

  if (!isOpen) return null;

  const approvedTotal = estimates
    .filter((item) => item.approved)
    .reduce((sum, item) => sum + item.totalCost, 0);

  const cgst = Math.round(approvedTotal * 0.09);
  const sgst = Math.round(approvedTotal * 0.09);
  const grandTotal = approvedTotal + cgst + sgst;

  const handleShareWhatsAppEstimate = () => {
    const text = encodeURIComponent(
      `🚗 *Apni Workshop Digital Estimate Approval*\n\nVehicle: DL 4C BE 1081 (Kia Seltos)\nApproved Service Items Total: *₹${grandTotal.toLocaleString("en-IN")}* (Incl. 18% GST)\n\nTap to view & approve itemized line items: https://apniworkshop.com/approve/DL4CBE1081`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    showToast("Shared Interactive Estimate Link via WhatsApp!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
              <span className="material-symbols-outlined">edit_document</span>
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                WhatsApp Digital Estimate Approval
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Live Interactive
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                DL 4C BE 1081 • Vikram Malhotra • Sharma Auto Care
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Information Banner */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-500 text-xl mt-0.5">
              touch_app
            </span>
            <div className="text-xs text-slate-700 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">
                Interactive Line-Item Toggle
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Car owners can turn individual recommended repair items ON or OFF directly in their WhatsApp tracking link before digital signing.
              </p>
            </div>
          </div>

          {/* Line Items List */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Recommended Work Items & Spares
            </h4>
            {estimates.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleEstimate(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  item.approved
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-white mt-0.5 transition-colors ${
                      item.approved ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {item.approved ? "check" : "add"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      {item.tag && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.subTitle}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                      {item.breakdown.map((b, i) => (
                        <span key={i} className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {b.label}: ₹{b.cost}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-base text-slate-900 dark:text-white">
                    ₹{item.totalCost.toLocaleString("en-IN")}
                  </p>
                  <span
                    className={`text-[10px] font-bold ${
                      item.approved ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                    }`}
                  >
                    {item.approved ? "APPROVED" : "DECLINED"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Breakdown Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Approved Line Items Subtotal</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ₹{approvedTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Central GST (CGST 9%)</span>
              <span className="font-medium text-slate-800 dark:text-slate-300">₹{cgst}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>State GST (SGST 9%)</span>
              <span className="font-medium text-slate-800 dark:text-slate-300">₹{sgst}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold text-sm text-slate-900 dark:text-white">
              <span>Grand Total Payable</span>
              <span className="text-primary font-black text-lg">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Digital Signature Pad Box */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">draw</span>
                Digital Authorization Signature
              </label>
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">verified</span>
                IP Verified & Timestamped
              </span>
            </div>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Enter full name for e-signature"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
            <p className="text-[10px] text-slate-400">
              By submitting, you authorize Sharma Auto Care to perform the selected work items.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleShareWhatsAppEstimate}
            className="flex-1 py-3 px-4 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-base">share</span>
            <span>Share Link on WhatsApp</span>
          </button>
          <button
            onClick={() => {
              onPayNow();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-primary/25"
          >
            <span className="material-symbols-outlined text-base">payments</span>
            <span>Pay & Approve (₹{grandTotal.toLocaleString("en-IN")})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
