import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { OBDCodeRecord } from "../../types";
import {
  X,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Search,
  Zap,
  Gauge,
  Thermometer,
  BatteryCharging,
  Activity,
  Trash2,
  Sparkles,
  ShieldCheck,
  Radio,
} from "lucide-react";

const mockOBDCodes: OBDCodeRecord[] = [
  {
    code: "P0300",
    category: "Powertrain (P)",
    description: "Random / Multiple Cylinder Misfire Detected",
    severity: "critical",
    symptoms: [
      "Engine hesitates during hard acceleration",
      "Noticeable rough idling and vibration",
      "Flashing Check Engine Light (MIL)",
      "Higher fuel consumption and unburned exhaust odor",
    ],
    suggestedRepair: "Inspect & replace faulty OEM Spark Plugs (NGK Laser Iridium) and check Ignition Coil Pack #3.",
    estimatedLaborMins: 45,
    oemPartCost: 2450,
    freezeFrame: {
      rpm: 2150,
      speedKm: 48,
      coolantTempC: 91,
      fuelTrim: "+14.2% (Short Term)",
      throttlePos: "22%",
    },
  },
  {
    code: "P0171",
    category: "Powertrain (P)",
    description: "System Too Lean (Bank 1) - Insufficient Fuel / Vacuum Leak",
    severity: "warning",
    symptoms: [
      "Loss of low-end torque",
      "Hissing sound from intake manifold gasket",
      "Stalling at traffic stops when engine is cold",
    ],
    suggestedRepair: "Clean Mass Air Flow (MAF) sensor with electronic spray and test PCV valve vacuum line for cracks.",
    estimatedLaborMins: 30,
    oemPartCost: 1100,
    freezeFrame: {
      rpm: 840,
      speedKm: 0,
      coolantTempC: 88,
      fuelTrim: "+22.5% (Lean Limit)",
      throttlePos: "12%",
    },
  },
  {
    code: "P0420",
    category: "Powertrain (P)",
    description: "Catalyst System Efficiency Below Threshold (Bank 1)",
    severity: "advisory",
    symptoms: [
      "Mild exhaust sulfur odor",
      "Reduced high-speed highway fuel mileage",
      "Failed PUCC Emission Test (HC / CO elevated)",
    ],
    suggestedRepair: "Perform catalytic converter decarbonization flush & test downstream Heated Oxygen Sensor (O2 Sensor).",
    estimatedLaborMins: 60,
    oemPartCost: 3800,
    freezeFrame: {
      rpm: 1980,
      speedKm: 65,
      coolantTempC: 93,
      fuelTrim: "+4.1%",
      throttlePos: "18%",
    },
  },
  {
    code: "C0035",
    category: "Chassis (C)",
    description: "Left Front Wheel Speed Sensor Circuit Malfunction",
    severity: "warning",
    symptoms: [
      "ABS & Traction Control Warning Lights illuminated",
      "Pulsing brake pedal feel at low speeds on dry tarmac",
    ],
    suggestedRepair: "Inspect ABS magnetic reluctor ring and replace Left Front ABS Hub Sensor wiring harness.",
    estimatedLaborMins: 40,
    oemPartCost: 1650,
  },
];

export const OBDDiagnosticModal: React.FC = () => {
  const { isModalOpen, closeModal, vehicle, showToast } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<"active_dtc" | "telemetry" | "lookup">("active_dtc");
  const [detectedCodes, setDetectedCodes] = useState<OBDCodeRecord[]>(mockOBDCodes);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedCodeResult, setSearchedCodeResult] = useState<OBDCodeRecord | null>(null);
  const [milResetDone, setMilResetDone] = useState(false);

  // Live telemetry state
  const [telemetry, setTelemetry] = useState({
    rpm: 840,
    speed: 0,
    coolant: 89,
    battery: 14.1,
    throttle: 13,
    fuelPressure: 380,
    engineLoad: 18,
    intakeTemp: 34,
  });

  if (!isModalOpen.obdScanner) return null;

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setDetectedCodes(mockOBDCodes);
      setMilResetDone(false);
      showToast("OBD-II ECU diagnostic scan complete! 4 DTCs identified.");
    }, 1200);
  };

  const handleClearCodes = () => {
    setDetectedCodes([]);
    setMilResetDone(true);
    showToast("MIL Check Engine Lamp reset! DTC memory cleared from ECU.");
  };

  const handleSearchCode = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toUpperCase().trim();
    if (!query) return;

    const found = mockOBDCodes.find((c) => c.code === query);
    if (found) {
      setSearchedCodeResult(found);
    } else {
      setSearchedCodeResult({
        code: query,
        category: query.startsWith("P")
          ? "Powertrain (P)"
          : query.startsWith("C")
          ? "Chassis (C)"
          : query.startsWith("B")
          ? "Body (B)"
          : "Network (U)",
        description: `Standard Diagnostic Code ${query} - Sensor / Circuit Out of Range`,
        severity: "warning",
        symptoms: ["Check Engine Warning", "ECU Fallback Safety Mode", "Diagnostic Scan Recommended"],
        suggestedRepair: "Perform electronic pinout test on wiring harness and verify sensor signal output with multimeter.",
        estimatedLaborMins: 45,
        oemPartCost: 1850,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={() => closeModal("obdScanner")}
    >
      <div
        className="bg-[#ffffff] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#e4e3db] overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1b1c17] text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Cpu size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[16px] tracking-tight">
                  OBD-II Diagnostic Scanner & Telematics
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ELM327 BT Active</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {vehicle.name} • {vehicle.plate} • ISO 15031 / BS-VI CAN Bus
              </p>
            </div>
          </div>

          <button
            onClick={() => closeModal("obdScanner")}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#f6f4ec] border-b border-[#e4e3db] px-4 py-2 flex items-center justify-between gap-2 text-[12px]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("active_dtc")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === "active_dtc"
                  ? "bg-[#0d631b] text-white shadow-2xs"
                  : "text-[#40493d] hover:bg-[#eae8e0]"
              }`}
            >
              Active DTCs ({detectedCodes.length})
            </button>
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === "telemetry"
                  ? "bg-[#0d631b] text-white shadow-2xs"
                  : "text-[#40493d] hover:bg-[#eae8e0]"
              }`}
            >
              Live Telematics
            </button>
            <button
              onClick={() => setActiveTab("lookup")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === "lookup"
                  ? "bg-[#0d631b] text-white shadow-2xs"
                  : "text-[#40493d] hover:bg-[#eae8e0]"
              }`}
            >
              9,000+ DTC Lookup
            </button>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#e4e3db] hover:border-[#0d631b] text-[#0d631b] font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all text-[11px] disabled:opacity-50"
          >
            <RotateCw size={13} className={isScanning ? "animate-spin" : ""} />
            <span>{isScanning ? "Scanning ECU..." : "Rescan"}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: ACTIVE DTCS */}
          {activeTab === "active_dtc" && (
            <div className="space-y-3">
              {detectedCodes.length === 0 ? (
                <div className="text-center py-10 bg-emerald-50/50 rounded-3xl border border-emerald-200 p-6 space-y-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <ShieldCheck size={28} />
                  </div>
                  <h4 className="font-extrabold text-[16px] text-emerald-900">
                    No Diagnostic Trouble Codes Found!
                  </h4>
                  <p className="text-[12px] text-emerald-700 max-w-sm mx-auto">
                    All powertrain sensors, ABS, and emission modules are communicating properly with zero active fault flags.
                  </p>
                  <button
                    onClick={handleScan}
                    className="mt-2 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-[12px] shadow-sm hover:bg-emerald-800 transition-all cursor-pointer"
                  >
                    Run Full System Scan
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {detectedCodes.length} Active Engine & Chassis Fault Codes
                    </span>
                    <button
                      onClick={handleClearCodes}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200"
                    >
                      <Trash2 size={12} />
                      <span>Clear Codes & Reset MIL</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {detectedCodes.map((dtc) => (
                      <div
                        key={dtc.code}
                        className={`rounded-2xl p-3.5 border-2 transition-all space-y-2.5 ${
                          dtc.severity === "critical"
                            ? "bg-rose-50/60 border-rose-300"
                            : dtc.severity === "warning"
                            ? "bg-amber-50/60 border-amber-300"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[16px] font-black tracking-wider bg-white px-2.5 py-1 rounded-lg border shadow-xs text-slate-900">
                              {dtc.code}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border text-slate-700">
                              {dtc.category}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              dtc.severity === "critical"
                                ? "bg-rose-600 text-white"
                                : dtc.severity === "warning"
                                ? "bg-amber-600 text-white"
                                : "bg-slate-600 text-white"
                            }`}
                          >
                            {dtc.severity}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-[13px] text-slate-900 leading-snug">
                            {dtc.description}
                          </h4>
                        </div>

                        {/* Symptoms */}
                        <div className="bg-white/80 rounded-xl p-2.5 border border-black/5 text-[11px] space-y-1">
                          <span className="font-bold text-slate-700 block">Reported Symptoms:</span>
                          <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                            {dtc.symptoms.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Suggested Repair */}
                        <div className="flex items-start gap-2 bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 text-[11px]">
                          <Sparkles size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-bold text-emerald-950">Workshop Solution: </span>
                            <span className="text-emerald-900">{dtc.suggestedRepair}</span>
                            <div className="mt-1 flex items-center gap-3 text-[10px] font-bold text-emerald-800">
                              <span>OEM Part: ₹{dtc.oemPartCost.toLocaleString()}</span>
                              <span>•</span>
                              <span>Est. Labor: ~{dtc.estimatedLaborMins} mins</span>
                            </div>
                          </div>
                        </div>

                        {/* Freeze Frame Data */}
                        {dtc.freezeFrame && (
                          <div className="pt-1 flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
                            <span className="bg-white px-2 py-0.5 rounded border">RPM: {dtc.freezeFrame.rpm}</span>
                            <span className="bg-white px-2 py-0.5 rounded border">Speed: {dtc.freezeFrame.speedKm} km/h</span>
                            <span className="bg-white px-2 py-0.5 rounded border">Coolant: {dtc.freezeFrame.coolantTempC}°C</span>
                            <span className="bg-white px-2 py-0.5 rounded border">Throttle: {dtc.freezeFrame.throttlePos}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: LIVE TELEMETRY GAUGES */}
          {activeTab === "telemetry" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#1b1c17] text-white rounded-2xl p-3.5 space-y-1 shadow-xs text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Engine RPM</span>
                  <div className="font-mono text-[24px] font-black text-emerald-400 leading-none">
                    {telemetry.rpm}
                  </div>
                  <span className="text-[9px] text-slate-500 block">Idle Spec: 800 - 900</span>
                </div>

                <div className="bg-[#1b1c17] text-white rounded-2xl p-3.5 space-y-1 shadow-xs text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Coolant Temp</span>
                  <div className="font-mono text-[24px] font-black text-amber-400 leading-none">
                    {telemetry.coolant}°C
                  </div>
                  <span className="text-[9px] text-slate-500 block">Normal (85-95°C)</span>
                </div>

                <div className="bg-[#1b1c17] text-white rounded-2xl p-3.5 space-y-1 shadow-xs text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Alternator Volts</span>
                  <div className="font-mono text-[24px] font-black text-sky-400 leading-none">
                    {telemetry.battery}V
                  </div>
                  <span className="text-[9px] text-slate-500 block">Charging Optimal</span>
                </div>

                <div className="bg-[#1b1c17] text-white rounded-2xl p-3.5 space-y-1 shadow-xs text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Throttle Pos</span>
                  <div className="font-mono text-[24px] font-black text-purple-400 leading-none">
                    {telemetry.throttle}%
                  </div>
                  <span className="text-[9px] text-slate-500 block">Electronic TPS</span>
                </div>
              </div>

              {/* Real-time CAN Bus Parameters */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Live Sensor Stream
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="bg-white p-2.5 rounded-xl border flex items-center justify-between">
                    <span className="text-slate-600">Common Rail Fuel Pressure</span>
                    <span className="font-mono font-bold text-slate-900">{telemetry.fuelPressure} bar</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border flex items-center justify-between">
                    <span className="text-slate-600">Calculated Engine Load</span>
                    <span className="font-mono font-bold text-slate-900">{telemetry.engineLoad}%</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border flex items-center justify-between">
                    <span className="text-slate-600">Intake Air Temp (IAT)</span>
                    <span className="font-mono font-bold text-slate-900">{telemetry.intakeTemp}°C</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border flex items-center justify-between">
                    <span className="text-slate-600">MAF Airflow Rate</span>
                    <span className="font-mono font-bold text-slate-900">4.12 g/s</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 9,000+ DTC CODE LOOKUP */}
          {activeTab === "lookup" && (
            <div className="space-y-4">
              <form onSubmit={handleSearchCode} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter any code (e.g. P0300, P0420, P0171, C0035, U0100)..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] font-mono font-bold focus:outline-hidden focus:border-[#0d631b] focus:bg-white uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#0d631b] text-white font-bold text-[12px] hover:bg-[#094813] transition-all cursor-pointer shadow-xs shrink-0"
                >
                  Decode
                </button>
              </form>

              {searchedCodeResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[20px] font-black text-slate-900 bg-white px-3 py-1 rounded-xl border shadow-xs">
                      {searchedCodeResult.code}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 uppercase bg-slate-200 px-2.5 py-1 rounded-full">
                      {searchedCodeResult.category}
                    </span>
                  </div>

                  <h4 className="font-bold text-[14px] text-slate-900">
                    {searchedCodeResult.description}
                  </h4>

                  <div className="bg-white p-3 rounded-xl border text-[12px] space-y-1.5">
                    <span className="font-bold text-slate-700">OEM Diagnosis & Repair Action:</span>
                    <p className="text-slate-600">{searchedCodeResult.suggestedRepair}</p>
                    <div className="pt-2 border-t flex items-center justify-between text-[11px] text-[#0d631b] font-bold">
                      <span>Estimated Part Cost: ₹{searchedCodeResult.oemPartCost.toLocaleString()}</span>
                      <span>Labor: ~{searchedCodeResult.estimatedLaborMins} mins</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
