import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";

export const LiveInteractiveMapModal: React.FC = () => {
  const { isModalOpen, closeModal, showToast } = useApp();
  const [driverProgress, setDriverProgress] = useState<number>(35); // 0 to 100%
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  useEffect(() => {
    if (!isModalOpen.liveMap || !isSimulating) return;
    const interval = setInterval(() => {
      setDriverProgress((prev) => {
        if (prev >= 95) {
          showToast("Geofence Triggered: Vehicle entered Sharma Auto Care Workshop Perimeter!");
          return 95;
        }
        return prev + 3;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isModalOpen.liveMap, isSimulating]);

  if (!isModalOpen.liveMap) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[#e4e3db] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#ffffff] p-4 flex items-center justify-between border-b border-[#e4e3db]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0d631b] text-[24px]">explore</span>
            <div>
              <h3 className="font-bold text-[15px] text-[#1b1c17]">Live GPS Navigation & Geofence</h3>
              <p className="text-[11px] text-[#707a6c]">Sector 15A Noida ➔ Sharma Auto Care Bay 03</p>
            </div>
          </div>
          <button
            onClick={() => closeModal("liveMap")}
            className="w-8 h-8 rounded-full bg-[#f0eee6] flex items-center justify-center text-[#1b1c17]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Live Vector / Canvas Map Stage */}
        <div className="relative h-72 bg-[#e5ece1] overflow-hidden border-b border-[#e4e3db] flex items-center justify-center">
          {/* Subtle Map Grid Lines */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#8cb37b_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

          {/* Road Network Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full">
            {/* Background Secondary Roads */}
            <path
              d="M 20 60 Q 180 80 260 220 T 460 260"
              fill="none"
              stroke="#cbd8c5"
              strokeWidth="12"
            />
            <path
              d="M 80 260 Q 200 180 340 100 T 480 40"
              fill="none"
              stroke="#cbd8c5"
              strokeWidth="10"
            />

            {/* Active GPS Route */}
            <path
              id="activeRoute"
              d="M 50 200 C 140 200, 160 80, 260 80 S 340 180, 420 120"
              fill="none"
              stroke="#4285f4"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="6 4"
            />
          </svg>

          {/* Customer Pickup Point */}
          <div className="absolute left-8 top-44 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#1b1c17] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[16px]">home</span>
            </div>
            <span className="bg-white/90 px-1.5 py-0.5 rounded text-[9px] font-bold text-[#1b1c17] shadow-xs mt-1">
              Sector 15A
            </span>
          </div>

          {/* Workshop Geofence Circle */}
          <div className="absolute right-10 top-24 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[#0d631b]/10 border-2 border-dashed border-[#0d631b] animate-pulse flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-[#0d631b] text-white flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-[20px]">storefront</span>
              </div>
            </div>
            <span className="bg-[#0d631b] text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-xs -mt-2">
              Sharma Auto Care (Bay 03)
            </span>
          </div>

          {/* Live Driver Moving Pin */}
          <div
            className="absolute transition-all duration-1000 ease-out z-20 flex flex-col items-center"
            style={{
              left: `${15 + driverProgress * 0.7}%`,
              top: `${48 - Math.sin((driverProgress / 100) * Math.PI) * 22}%`,
            }}
          >
            <div className="w-8 h-8 rounded-full bg-[#4285f4] text-white ring-4 ring-white shadow-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">directions_car</span>
            </div>
            <span className="bg-[#1b1c17] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm mt-0.5 whitespace-nowrap">
              Rahul (38 km/h)
            </span>
          </div>

          {/* Turn HUD Overlay */}
          <div className="absolute top-3 left-3 bg-[#1b1c17]/90 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-lg flex items-center gap-2.5 z-30">
            <div className="w-7 h-7 rounded-lg bg-[#4285f4] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">turn_sharp_right</span>
            </div>
            <div>
              <span className="text-[12px] font-bold block">In 180m, Merge onto Expressway</span>
              <span className="text-[10px] text-white/70">ETA 8 mins • 2.4 km remaining</span>
            </div>
          </div>
        </div>

        {/* Telemetry & Controls */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#f6f4ec] p-2.5 rounded-xl border border-[#e4e3db]">
              <span className="text-[10px] text-[#707a6c] block">Live Speed</span>
              <span className="font-numeric-plate font-bold text-[15px] text-[#1b1c17]">38 km/h</span>
            </div>
            <div className="bg-[#f6f4ec] p-2.5 rounded-xl border border-[#e4e3db]">
              <span className="text-[10px] text-[#707a6c] block">Est. Arrival</span>
              <span className="font-numeric-plate font-bold text-[15px] text-[#0d631b]">10:28 AM</span>
            </div>
            <div className="bg-[#f6f4ec] p-2.5 rounded-xl border border-[#e4e3db]">
              <span className="text-[10px] text-[#707a6c] block">Geofence</span>
              <span className="font-numeric-plate font-bold text-[15px] text-[#0d631b]">
                {driverProgress >= 80 ? "IN RADIUS" : "APPROACHING"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setIsSimulating(!isSimulating)}
              className="text-[12px] text-[#0d631b] font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isSimulating ? "pause" : "play_arrow"}
              </span>
              <span>{isSimulating ? "Pause GPS Simulation" : "Resume GPS"}</span>
            </button>

            <button
              onClick={() => showToast("Opening official Google Maps Navigation App...")}
              className="px-4 py-2 rounded-xl bg-[#0d631b] text-white text-[11px] font-bold shadow-xs"
            >
              Open in Google Maps App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
