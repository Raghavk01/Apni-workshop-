import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  X,
  MessageSquare,
  CheckCheck,
  Send,
  ExternalLink,
  FileText,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
} from "lucide-react";

export const WhatsAppBusinessHubModal: React.FC = () => {
  const { isModalOpen, closeModal, vehicle, customerProfile, bookingInfo, showToast } = useApp();
  const [selectedTemplate, setSelectedTemplate] = useState<
    "valet_pickup" | "bay_live" | "part_approval" | "tax_invoice"
  >("valet_pickup");
  const [recipientPhone, setRecipientPhone] = useState(
    customerProfile.phone || "+91 98101 23456"
  );
  const [isSending, setIsSending] = useState(false);

  if (!isModalOpen.whatsappHub) return null;

  const handleSendTemplate = (phone: string, template: string) => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      showToast(`WhatsApp Business Cloud notification dispatched to ${phone}!`);
    }, 900);
  };

  const getTemplateContent = () => {
    switch (selectedTemplate) {
      case "valet_pickup":
        return {
          title: "Doorstep Valet Pickup & Live GPS Link",
          header: `🚗 Valet Dispatched for ${vehicle.plate}`,
          body: `Namaste ${customerProfile.name || "Customer"}! Your Apni Workshop valet pilot Anoop is en-route for doorstep vehicle pickup.\n\n📍 Track Valet Live: https://apniworkshop.in/track/${bookingInfo.bookingId || "BK-108"}\n⏱️ Estimated Arrival: 12 mins`,
          footer: "Apni Workshop • Official Meta Cloud API",
          buttons: ["📍 Track Valet GPS", "📞 Call Valet Pilot"],
        };
      case "bay_live":
        return {
          title: "Live Bay Camera & Inspection Feed",
          header: `📹 Live Bay CCTV Feed Active - Bay 03`,
          body: `Your ${vehicle.name} (${vehicle.plate}) has been ingested into Bay 03. Technician Rajesh has initiated the 40-Point Diagnostic Inspection.\n\n🎥 Watch Live Bay Webcam: https://apniworkshop.in/live-bay/${bookingInfo.bookingId || "BK-108"}`,
          footer: "HD 60FPS Low-Latency Live Stream",
          buttons: ["▶️ Watch Live Bay Cam", "📋 View Checklist"],
        };
      case "part_approval":
        return {
          title: "Worn Part Photo Proof & 1-Tap Approval",
          header: `⚠️ Action Required: Front Brake Pad Wear (15% Left)`,
          body: `Technician Inspection Alert: Front Brake Pads require replacement for road safety. OEM Bosch Ceramic pads available.\n\n💰 Price: ₹3,200 (Inclusive of GST & Labor)\n📸 High-Res Photo attached.`,
          footer: "Apni Workshop Instant Approval Engine",
          buttons: ["✅ Approve Work (₹3,200)", "⏭️ Skip for Now"],
        };
      case "tax_invoice":
        return {
          title: "Digital GST Tax Invoice & Service Certificate",
          header: `🧾 Service Complete - Tax Invoice #${bookingInfo.bookingId || "INV-9812"}`,
          body: `Your vehicle service is complete and Quality Check passed.\n\nTotal Paid: ₹${bookingInfo.totalAmount.toLocaleString()} via Razorpay UPI.\n📄 Download your official digital tax invoice & 6-month warranty certificate below.`,
          footer: "Apni Workshop GST Compliant Invoice",
          buttons: ["📄 Download Tax Invoice PDF", "⭐ Rate Service Experience"],
        };
    }
  };

  const currentTemplate = getTemplateContent();

  const handleOpenDirectWhatsApp = () => {
    const text = encodeURIComponent(`${currentTemplate.header}\n\n${currentTemplate.body}`);
    const cleanPhone = recipientPhone.replace(/[^0-9]/g, "");
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`, "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={() => closeModal("whatsappHub")}
    >
      <div
        className="bg-[#ffffff] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#e4e3db] overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#075E54] text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-[#075E54] flex items-center justify-center font-bold">
              <span className="text-[20px]">💬</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[16px] tracking-tight">
                  WhatsApp Business Cloud API Hub
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                  Official Meta Verified
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium">
                Automated Customer Updates, Live Bay Tracking & PDF Invoices
              </p>
            </div>
          </div>

          <button
            onClick={() => closeModal("whatsappHub")}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Template Selector Bar */}
        <div className="bg-[#f0f2f5] border-b border-slate-200 p-3 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <button
            onClick={() => setSelectedTemplate("valet_pickup")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedTemplate === "valet_pickup"
                ? "bg-[#128C7E] text-white shadow-2xs"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            1. Valet Pickup GPS
          </button>
          <button
            onClick={() => setSelectedTemplate("bay_live")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedTemplate === "bay_live"
                ? "bg-[#128C7E] text-white shadow-2xs"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            2. Live Bay Cam Link
          </button>
          <button
            onClick={() => setSelectedTemplate("part_approval")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedTemplate === "part_approval"
                ? "bg-[#128C7E] text-white shadow-2xs"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            3. Part Approval Photo
          </button>
          <button
            onClick={() => setSelectedTemplate("tax_invoice")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedTemplate === "tax_invoice"
                ? "bg-[#128C7E] text-white shadow-2xs"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            4. Tax Invoice PDF
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Recipient Phone Configuration */}
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-[12px]">
            <span className="font-bold text-slate-600 shrink-0">Recipient:</span>
            <input
              type="text"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white rounded-xl border border-slate-200 font-mono text-[12px] focus:outline-hidden focus:border-[#128C7E]"
            />
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
              Opted-In ✓
            </span>
          </div>

          {/* Authentic WhatsApp Message Preview Bubble */}
          <div className="bg-[#EFEAE2] p-4 rounded-3xl border border-slate-300 shadow-inner space-y-3 relative overflow-hidden">
            <div className="text-center">
              <span className="bg-[#FFFFFF]/90 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full shadow-2xs">
                TODAY • META CLOUD BUSINESS API
              </span>
            </div>

            {/* WhatsApp Message Bubble */}
            <div className="max-w-md bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-md border border-slate-200 space-y-2 text-slate-900 ml-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="font-extrabold text-[13px] text-[#075E54]">
                  {currentTemplate.header}
                </span>
              </div>

              <p className="text-[12px] text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                {currentTemplate.body}
              </p>

              <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
                {currentTemplate.footer}
              </div>

              {/* Action Buttons in Message */}
              <div className="pt-2 space-y-1.5">
                {currentTemplate.buttons.map((btn, idx) => (
                  <div
                    key={idx}
                    className="w-full py-2 bg-[#F0F2F5] hover:bg-slate-200 rounded-xl text-center text-[11px] font-bold text-[#00A884] flex items-center justify-center gap-1 border border-slate-200"
                  >
                    <span>{btn}</span>
                  </div>
                ))}
              </div>

              {/* Timestamp & Double Blue Tick */}
              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                <span>11:45 AM</span>
                <CheckCheck size={14} className="text-[#53bdeb]" />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              onClick={handleOpenDirectWhatsApp}
              className="py-2.5 px-4 rounded-2xl bg-white border border-[#25D366] text-[#075E54] hover:bg-emerald-50 text-[12px] font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>Open in WhatsApp Web</span>
            </button>

            <button
              onClick={() => handleSendTemplate(recipientPhone, selectedTemplate)}
              disabled={isSending}
              className="py-2.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-extrabold text-[13px] flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Send size={15} />
              <span>{isSending ? "Dispatching API..." : "Send Cloud API Broadcast"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
