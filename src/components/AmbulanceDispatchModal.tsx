import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { AmbulanceType } from "../types";
import {
  X,
  Phone,
  MessageCircle,
  MapPin,
  ShieldAlert,
  Clock,
  Navigation,
  Activity,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Radio,
  Share2,
} from "lucide-react";

export const AmbulanceDispatchModal: React.FC = () => {
  const {
    isModalOpen,
    closeModal,
    userLocation,
    ambulanceState,
    dispatchAmbulance,
    cancelAmbulance,
    showToast,
  } = useApp();

  const [selectedType, setSelectedType] = useState<AmbulanceType>("ALS_ICU");
  const [emergencyNote, setEmergencyNote] = useState<string>("");
  const [patientCondition, setPatientCondition] = useState<string>("Accident / Trauma Emergency");
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [etaSeconds, setEtaSeconds] = useState<number>(180); // 3 minutes countdown

  // Countdown timer when ambulance is dispatched
  useEffect(() => {
    if (!ambulanceState?.isDispatched) return;
    const interval = setInterval(() => {
      setEtaSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [ambulanceState?.isDispatched]);

  if (!isModalOpen.ambulanceDispatch) return null;

  const handleDispatch = async () => {
    setIsRequesting(true);
    try {
      await dispatchAmbulance(selectedType, emergencyNote);
      setEtaSeconds(180);
    } finally {
      setIsRequesting(false);
    }
  };

  const formatEta = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleShareLocation = () => {
    const text = `🚨 EMERGENCY MEDICAL REQUEST: Ambulance dispatched to ${userLocation.address || userLocation.areaName}. Coordinates: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => closeModal("ambulanceDispatch")}
    >
      <div
        className="bg-[#ffffff] w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-rose-200 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Emergency Header */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white p-4 flex items-center justify-between shadow-md relative overflow-hidden">
          {/* Pulsing Siren Accent */}
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none animate-pulse"></div>

          <div className="flex items-center gap-2.5 z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
              <span className="text-[22px]">🚑</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-[16px] tracking-tight">
                  {ambulanceState?.isDispatched ? "Ambulance Dispatched" : "24x7 Emergency Ambulance"}
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
              </div>
              <p className="text-[11px] text-rose-100 font-medium">
                National 108 Emergency Network • Direct GPS Dispatch
              </p>
            </div>
          </div>

          <button
            onClick={() => closeModal("ambulanceDispatch")}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer z-10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Case 1: Ambulance is actively dispatched */}
          {ambulanceState?.isDispatched ? (
            <div className="space-y-4">
              {/* Authentic Indian Emergency Number Plate Badge */}
              <div className="bg-gradient-to-br from-amber-50 via-white to-slate-50 border-2 border-slate-300 rounded-2xl p-4 shadow-sm text-center relative overflow-hidden">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-center gap-1">
                  <ShieldAlert size={12} className="text-rose-600" />
                  <span>Dispatched Emergency Vehicle Plate</span>
                </div>

                {/* Styled Indian High-Security Registration Plate (HSRP) */}
                <div className="inline-flex items-center justify-center bg-white border-2 border-slate-800 rounded-lg px-4 py-2 shadow-md mx-auto relative group hover:scale-[1.02] transition-transform">
                  {/* Blue IND Strip with Hologram */}
                  <div className="bg-[#002B7F] text-white px-2 py-1 rounded-l-md flex flex-col items-center justify-center mr-3 -ml-2 border-r border-slate-300 select-none">
                    <span className="text-[8px] leading-none">🇮🇳</span>
                    <span className="text-[8px] font-black tracking-tighter leading-none mt-0.5">IND</span>
                  </div>

                  {/* High Contrast Plate Number */}
                  <span className="font-numeric-plate text-[22px] sm:text-[26px] font-black tracking-widest text-slate-950 uppercase select-all">
                    {ambulanceState.numberPlate}
                  </span>
                </div>

                <p className="text-[12px] font-bold text-rose-700 mt-2">
                  {ambulanceState.typeName}
                </p>
              </div>

              {/* Live ETA & Status Tracker */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex flex-col items-center justify-center shadow-md animate-pulse">
                    <Clock size={18} />
                    <span className="text-[10px] font-black uppercase mt-0.5">ETA</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[20px] font-black text-rose-950 tracking-tight font-mono">
                        {formatEta(etaSeconds)}
                      </span>
                      <span className="text-[11px] font-bold text-rose-700">mins remaining</span>
                    </div>
                    <p className="text-[11px] text-rose-800 font-medium">
                      Distance: ~{ambulanceState.distanceKm} km away • High Siren Priority
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-2xs">
                    <Radio size={11} className="animate-spin" />
                    <span>Live Beacon</span>
                  </span>
                </div>
              </div>

              {/* Stepper Checklist */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  Dispatch & Transit Stages
                </h4>
                <div className="space-y-2 text-[12px]">
                  <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Ambulance Dispatched & GPS Locked</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-rose-600 font-bold animate-pulse">
                    <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>En Route to Patient Location with Emergency Flasher</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400 font-medium">
                    <span className="w-4 h-4 rounded-full border border-slate-300 text-[9px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span>On-Scene Patient Stabilisation & Vitals Check</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400 font-medium">
                    <span className="w-4 h-4 rounded-full border border-slate-300 text-[9px] flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span>Transit to Max / Fortis Emergency Trauma Wing</span>
                  </div>
                </div>
              </div>

              {/* Paramedic & Pilot Contact Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Assigned Crew
                    </span>
                    <h4 className="font-bold text-[13px] text-slate-900">{ambulanceState.paramedicName}</h4>
                    <p className="text-[11px] text-slate-500">{ambulanceState.driverName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${ambulanceState.driverPhone}`}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                    >
                      <Phone size={14} />
                      <span>Call Driver</span>
                    </a>
                  </div>
                </div>

                {/* Equipment Highlights */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {ambulanceState.equipment.map((eq, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-100 px-2 py-0.5 rounded-md"
                    >
                      ✓ {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pickup Address Confirmation */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-start gap-2.5">
                <MapPin size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Pickup Location
                  </span>
                  <p className="text-[12px] font-bold text-slate-800 leading-snug truncate">
                    {ambulanceState.pickupAddress}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Coordinates: ({ambulanceState.pickupLat.toFixed(4)}, {ambulanceState.pickupLng.toFixed(4)})
                  </span>
                </div>
                <button
                  onClick={handleShareLocation}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                  title="Share Live Emergency Link via WhatsApp"
                >
                  <Share2 size={13} />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              {/* Actions: Cancel or Direct 108 Emergency */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={cancelAmbulance}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[12px] transition-colors cursor-pointer"
                >
                  Cancel Request
                </button>
                <a
                  href="tel:108"
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[12px] flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Phone size={14} />
                  <span>Call National 108</span>
                </a>
              </div>
            </div>
          ) : (
            /* Case 2: Request Form (1-Tap Dispatch) */
            <div className="space-y-4">
              {/* Current Detected Location Display */}
              <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-rose-600" />
                    <span className="text-[11px] font-bold text-rose-950 uppercase tracking-wider">
                      Patient Pickup Location (GPS)
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-rose-200/80 text-rose-800 px-2 py-0.5 rounded-full">
                    Auto-Detected
                  </span>
                </div>

                <p className="text-[13px] font-bold text-slate-900 leading-snug">
                  {userLocation.address || userLocation.areaName || "Sector B, Vasant Kunj, South Delhi"}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-rose-100">
                  <span>GPS Lat: {userLocation.lat.toFixed(4)}°, Lng: {userLocation.lng.toFixed(4)}°</span>
                  <span className="text-emerald-700 font-bold">Accuracy: ~15m</span>
                </div>
              </div>

              {/* Ambulance Types Selection */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-800 flex items-center justify-between">
                  <span>Select Ambulance Service Level</span>
                  <span className="text-[10px] text-slate-500">24x7 Immediate Response</span>
                </label>

                <div className="space-y-2">
                  {/* Tier 1: ALS / ICU */}
                  <div
                    onClick={() => setSelectedType("ALS_ICU")}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      selectedType === "ALS_ICU"
                        ? "border-rose-600 bg-rose-50/50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          selectedType === "ALS_ICU" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <HeartPulse size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-[13px] text-slate-900">
                            Advance Life Support (ALS) / ICU
                          </h4>
                          <span className="text-[9px] font-extrabold bg-rose-600 text-white px-1.5 py-0.2 rounded">
                            CRITICAL
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Ventilator, Defibrillator (AED), Multi-para monitor & ICU Paramedic.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-rose-700 shrink-0">~3 mins ETA</span>
                  </div>

                  {/* Tier 2: BLS */}
                  <div
                    onClick={() => setSelectedType("BLS")}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      selectedType === "BLS"
                        ? "border-rose-600 bg-rose-50/50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          selectedType === "BLS" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Activity size={18} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[13px] text-slate-900">
                          Basic Life Support (BLS)
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Continuous Oxygen, Stretcher, First Aid & Vital Monitoring responder.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-rose-700 shrink-0">~4 mins ETA</span>
                  </div>

                  {/* Tier 3: Trauma */}
                  <div
                    onClick={() => setSelectedType("TRAUMA_UNIT")}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      selectedType === "TRAUMA_UNIT"
                        ? "border-rose-600 bg-rose-50/50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          selectedType === "TRAUMA_UNIT" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[13px] text-slate-900">
                          Spine & Accident Trauma Unit
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Spinal immobilization board, vacuum splints, fracture & trauma care.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-rose-700 shrink-0">~5 mins ETA</span>
                  </div>
                </div>
              </div>

              {/* Emergency Landmark Note */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Landmark / Patient Notes (Optional)
                </label>
                <input
                  type="text"
                  value={emergencyNote}
                  onChange={(e) => setEmergencyNote(e.target.value)}
                  placeholder="e.g. Near Gate 3, Red Building 2nd Floor, Patient unconscious"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[12px] text-slate-900 focus:outline-hidden focus:border-rose-500 focus:bg-white transition-all"
                />
              </div>

              {/* Instant 1-Tap Request Button */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDispatch}
                  disabled={isRequesting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-extrabold text-[15px] shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="text-[18px]">🚑</span>
                  <span>{isRequesting ? "Dispatching Emergency Unit..." : "Confirm & Dispatch Ambulance"}</span>
                </button>

                {/* Direct National Emergency Dialers */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <a
                    href="tel:108"
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone size={13} className="text-rose-600" />
                    <span>Call 108 (Ambulance)</span>
                  </a>
                  <a
                    href="tel:112"
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone size={13} className="text-rose-600" />
                    <span>Call 112 (National SOS)</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
