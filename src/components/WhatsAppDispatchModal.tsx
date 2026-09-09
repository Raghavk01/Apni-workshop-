import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export const WhatsAppDispatchModal: React.FC = () => {
  const { isModalOpen, closeModal, approvalRequest, bookingInfo, vehicle, showToast } = useApp();
  const [selectedTemplate, setSelectedTemplate] = useState<"approval" | "booking" | "invoice">("approval");

  if (!isModalOpen.whatsapp) return null;

  const phone = "+919911169253";

  const getTemplateText = () => {
    switch (selectedTemplate) {
      case "approval":
        return `🚗 *Apni Workshop Live Bay Alert*
Namaste Vikram ji,
Technician Suresh at Sharma Auto Care (Bay 03) has flagged an urgent component during inspection of your *${vehicle.name} (${vehicle.plate})*:

⚠️ *Item:* ${approvalRequest.componentName}
💰 *Est. Cost:* ₹${approvalRequest.price.toLocaleString()} (OEM Parts + Fitting)
📸 *Observation:* Pad thickness 2.1mm (critical wear).

Tap below to view live bay photo & approve work:
👉 https://apniworkshop.in/track/${bookingInfo.bookingId}?action=approve`;

      case "booking":
        return `✅ *Apni Workshop Booking Confirmed!*
Ref: *${bookingInfo.bookingId}*
Vehicle: *${vehicle.name} (${vehicle.plate})*
Package: *Standard Periodic Service (30,000 KM)*
Driver *Rahul Sharma* has been assigned for doorstep pickup.

Live GPS Tracker:
👉 https://apniworkshop.in/track/${bookingInfo.bookingId}`;

      case "invoice":
        return `🧾 *Your ${vehicle.name} is Ready for Delivery!*
All 40-point QC checks passed (Score 94/100).
Total Amount: *₹5,150* (Paid via UPI).

Download your official GST Invoice & QC Certificate:
👉 https://apniworkshop.in/invoice/${bookingInfo.bookingId}.pdf`;
    }
  };

  const handleSendToRealWhatsApp = () => {
    const text = encodeURIComponent(getTemplateText());
    const waUrl = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${text}`;
    window.open(waUrl, "_blank");
    showToast("Dispatched via WhatsApp Business Cloud API!");
    closeModal("whatsapp");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[#e4e3db] flex flex-col max-h-[92vh]">
        {/* WhatsApp Brand Header */}
        <div className="bg-[#075e54] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#25d366] flex items-center justify-center text-white font-bold shadow-sm">
              <span className="material-symbols-outlined text-[24px]">chat</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-[14px]">WhatsApp Business Cloud Dispatch</h3>
                <span className="bg-[#25d366] text-[#075e54] text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-white/80">Recipient: Vikram Malhotra (+91 98101 23456)</p>
            </div>
          </div>

          <button
            onClick={() => closeModal("whatsapp")}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Template Selector Tabs */}
        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="grid grid-cols-3 gap-1 bg-[#f0eee6] p-1 rounded-xl">
            <button
              onClick={() => setSelectedTemplate("approval")}
              className={`py-1.5 rounded-lg text-[11px] font-bold ${
                selectedTemplate === "approval" ? "bg-white text-[#075e54] shadow-xs" : "text-[#707a6c]"
              }`}
            >
              1-Tap Quote
            </button>
            <button
              onClick={() => setSelectedTemplate("booking")}
              className={`py-1.5 rounded-lg text-[11px] font-bold ${
                selectedTemplate === "booking" ? "bg-white text-[#075e54] shadow-xs" : "text-[#707a6c]"
              }`}
            >
              Live Driver GPS
            </button>
            <button
              onClick={() => setSelectedTemplate("invoice")}
              className={`py-1.5 rounded-lg text-[11px] font-bold ${
                selectedTemplate === "invoice" ? "bg-white text-[#075e54] shadow-xs" : "text-[#707a6c]"
              }`}
            >
              GST Invoice & QC
            </button>
          </div>

          {/* WhatsApp Chat Bubble Simulation */}
          <div className="bg-[#efeae2] p-4 rounded-2xl space-y-2 border border-[#d6cfc5]">
            <div className="bg-[#dcf8c6] p-3 rounded-2xl rounded-tr-none shadow-xs text-[12px] text-[#111b21] space-y-2 font-sans border border-[#cbe9b5]">
              <pre className="whitespace-pre-wrap font-sans leading-relaxed">{getTemplateText()}</pre>
              <div className="text-right text-[10px] text-[#667781] flex items-center justify-end gap-1">
                <span>10:28 AM</span>
                <span className="material-symbols-outlined text-[14px] text-[#53bdeb]">done_all</span>
              </div>
            </div>
          </div>

          {/* Cloud API Info */}
          <div className="text-[11px] text-[#707a6c] bg-[#f6f4ec] p-2.5 rounded-xl border border-[#e4e3db] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#075e54] text-[18px]">verified_user</span>
            <span>Meta WhatsApp API SLA: 99.98% delivery rate within 2 seconds.</span>
          </div>

          {/* Action Dispatch Button */}
          <button
            onClick={handleSendToRealWhatsApp}
            className="w-full h-12 rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-[#075e54] font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
            <span>Dispatch via WhatsApp Business API</span>
          </button>
        </div>
      </div>
    </div>
  );
};
