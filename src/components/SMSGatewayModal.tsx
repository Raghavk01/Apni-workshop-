import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  X,
  Smartphone,
  ShieldAlert,
  Send,
  CheckCircle2,
  Phone,
  KeyRound,
  Radio,
  Share2,
} from "lucide-react";

export const SMSGatewayModal: React.FC = () => {
  const { isModalOpen, closeModal, vehicle, userLocation, customerProfile, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<"sos_sms" | "otp_verify" | "dlt_templates">("sos_sms");
  const [emergencyPhone, setEmergencyPhone] = useState("+91 98101 99108");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [inputOtp, setInputOtp] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isModalOpen.smsGateway) return null;

  const handleSendEmergencySMS = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      showToast(`🚨 High-Priority Emergency SMS Dispatched to ${emergencyPhone} via DLT Gateway!`);
    }, 800);
  };

  const handleGenerateOtp = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    showToast(`SMS OTP Dispatched: ${randomOtp}`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOtp === generatedOtp) {
      showToast("OTP Verified Successfully! Identity authenticated.");
    } else {
      showToast("Invalid OTP. Please check the SMS code.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={() => closeModal("smsGateway")}
    >
      <div
        className="bg-[#ffffff] w-full max-w-lg rounded-3xl shadow-2xl border border-[#e4e3db] overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1b1c17] text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Smartphone size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[16px] tracking-tight">
                  SMS Gateway & DLT Broadcast
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold">
                  MSG91 / Fast2SMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                DLT Header: APNIWK • Real-Time SMS & Roadside SOS
              </p>
            </div>
          </div>

          <button
            onClick={() => closeModal("smsGateway")}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="bg-slate-100 border-b border-slate-200 p-2.5 flex items-center gap-1.5 text-[12px]">
          <button
            onClick={() => setActiveTab("sos_sms")}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "sos_sms" ? "bg-rose-600 text-white shadow-2xs" : "text-slate-700 hover:bg-white"
            }`}
          >
            🚨 Roadside SOS SMS
          </button>
          <button
            onClick={() => setActiveTab("otp_verify")}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "otp_verify" ? "bg-[#0d631b] text-white shadow-2xs" : "text-slate-700 hover:bg-white"
            }`}
          >
            🔐 6-Digit OTP Auth
          </button>
          <button
            onClick={() => setActiveTab("dlt_templates")}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "dlt_templates" ? "bg-[#1b1c17] text-white shadow-2xs" : "text-slate-700 hover:bg-white"
            }`}
          >
            📜 DLT Templates
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: SOS SMS */}
          {activeTab === "sos_sms" && (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[12px] text-rose-950 uppercase flex items-center gap-1.5">
                    <ShieldAlert size={16} className="text-rose-600" />
                    <span>Instant Roadside Emergency Broadcast</span>
                  </span>
                  <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                    Priority 1 DLT
                  </span>
                </div>
                <p className="text-[11px] text-rose-800">
                  Broadcasts your live GPS coordinates, vehicle registration ({vehicle.plate}), and emergency medical status to your selected emergency contact number.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">
                  Emergency Mobile Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[12px] font-mono font-bold"
                  />
                </div>
              </div>

              {/* SMS Text Preview */}
              <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200 space-y-1 text-[12px] text-slate-800 font-mono">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  SMS Body (Sender: VK-APNIWK):
                </span>
                <p className="whitespace-pre-line leading-relaxed">
                  {`[EMERGENCY SOS] Raghav Kapoor has requested urgent roadside / medical assistance for vehicle ${vehicle.plate}.\n📍 Location: ${userLocation.address || userLocation.areaName}\n🔗 Live GPS Map: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}\n- Apni Workshop 24x7 SOS Grid`}
                </p>
              </div>

              <button
                onClick={handleSendEmergencySMS}
                disabled={isSending}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-extrabold text-[14px] shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                <Send size={16} />
                <span>{isSending ? "Transmitting via DLT..." : "Broadcast Emergency SOS SMS"}</span>
              </button>
            </div>
          )}

          {/* TAB 2: OTP GENERATOR & AUTH */}
          {activeTab === "otp_verify" && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-center">
                <KeyRound size={28} className="mx-auto text-[#0d631b]" />
                <h4 className="font-extrabold text-[14px] text-slate-900">
                  Vehicle Doorstep Handover & Pickup OTP
                </h4>
                <p className="text-[11px] text-slate-600">
                  Generate a secure 6-digit OTP to authenticate vehicle handover to the assigned valet pilot.
                </p>
                <button
                  onClick={handleGenerateOtp}
                  className="mt-1 px-4 py-2 rounded-xl bg-[#0d631b] hover:bg-[#094813] text-white font-bold text-[12px] shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Generate 6-Digit SMS OTP
                </button>
              </div>

              {generatedOtp && (
                <form onSubmit={handleVerifyOtp} className="space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <div className="text-center space-y-1">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase">
                      Active SMS Token
                    </span>
                    <div className="font-mono text-[32px] font-black tracking-widest text-emerald-950">
                      {generatedOtp}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={inputOtp}
                      onChange={(e) => setInputOtp(e.target.value)}
                      placeholder="Enter 6-Digit Code to verify"
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-emerald-300 text-center font-mono font-black text-[16px] tracking-widest"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-[12px] cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: DLT TEMPLATES */}
          {activeTab === "dlt_templates" && (
            <div className="space-y-2 text-[11px]">
              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <span className="font-bold text-slate-800">1. Booking Dispatched (Template ID: 140716892)</span>
                <p className="text-slate-600 font-mono">
                  {"Your booking for {#var#} has been confirmed. Valet pilot {#var#} is assigned. Track at {#var#}. - APNIWK"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <span className="font-bold text-slate-800">2. Bay Inspection Alert (Template ID: 140716893)</span>
                <p className="text-slate-600 font-mono">
                  {"Car {#var#} is now in Bay 03. Live camera feed available at {#var#}. - APNIWK"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <span className="font-bold text-slate-800">3. Invoice Ready (Template ID: 140716894)</span>
                <p className="text-slate-600 font-mono">
                  {"Service complete. Tax invoice amount ₹{#var#} paid via UPI. Download at {#var#}. - APNIWK"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
