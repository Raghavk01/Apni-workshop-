import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

export const PickupPartnerJobScreen: React.FC = () => {
  const { vehicle, setCurrentScreen, showToast } = useApp();

  const [odometerCaptured, setOdometerCaptured] = useState(true);
  const [bumperCaptured, setBumperCaptured] = useState(true);
  const [rearCaptured, setRearCaptured] = useState(false);

  return (
    <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full pb-28">
      {/* Vehicle Job Card */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] shadow-xs space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#cbffc2] text-[#005312] text-[10px] font-extrabold uppercase tracking-wide">
              Active Pickup
            </span>
            <h2 className="font-bold text-[18px] text-[#1b1c17] mt-1 leading-tight">
              {vehicle.name} {vehicle.model}
            </h2>
            <p className="text-[12px] text-[#707a6c]">Scheduled Pickup: 10:15 AM</p>
          </div>

          <div className="text-right">
            <span className="bg-[#f6f4ec] px-2 py-0.5 rounded font-numeric-plate text-[12px] font-bold text-[#1b1c17] border border-[#e4e3db]">
              {vehicle.plate}
            </span>
            <span className="text-[10px] text-[#0d631b] font-bold block mt-1">
              Diesel AT 4x4
            </span>
          </div>
        </div>

        {/* Customer Details Row */}
        <div className="bg-[#f6f4ec] p-3 rounded-xl flex items-center justify-between border border-[#e4e3db]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#eae8e0] overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnfOtiqTK7CSAqBPF9ETLQ4vUkZuCI20ys5mzJseHNRlbX-nvStr73EJ8BMM_Y5EcIVwzpdb7qB1tYGmSL7NXodX-kXaiRzzbQkyKkhkRudW4ujnoT3hOWvlKf4VXJJYlG9SLbngceG6GKlci64aC8rgChF0V0jkusrR3z6ukT2j_rL6OLJ70TfnFLZWoSOYoud27dTuQ26HeS8aGDkQUKAOh0RqbqYf1jFFKvfH5bXEaboA6vYLi5"
                alt="Car Owner"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-[13px] text-[#1b1c17]">Vikram Malhotra</h4>
                <span className="text-[10px] font-bold text-[#e65100] flex items-center">
                  <span className="material-symbols-outlined text-[12px]">star</span> 4.9
                </span>
              </div>
              <p className="text-[11px] text-[#707a6c]">Tower B, Sector 15A, Noida</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href="tel:9911169253"
              onClick={() => showToast("Calling car owner Vikram Malhotra (9911169253)...")}
              className="w-9 h-9 rounded-full bg-[#0d631b] text-white flex items-center justify-center shadow-xs active:scale-95 no-underline"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
            </a>
            <button
              onClick={() => showToast("Opening WhatsApp message template to Vikram...")}
              className="w-9 h-9 rounded-full bg-[#cbffc2] text-[#005312] flex items-center justify-center shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Turn-by-Turn GPS Map Card */}
      <div className="bg-[#e8ece5] rounded-2xl h-44 overflow-hidden relative shadow-xs border border-[#e4e3db] flex flex-col justify-between p-3">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#a3c293_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

        {/* Navigation Step Banner */}
        <div className="relative z-10 bg-[#ffffff]/95 backdrop-blur-md px-3 py-2 rounded-xl flex items-center gap-3 shadow-md">
          <div className="w-8 h-8 rounded-lg bg-[#0d631b] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">turn_right</span>
          </div>
          <div>
            <span className="font-bold text-[13px] text-[#1b1c17] block">In 200m, Turn Right</span>
            <span className="text-[10px] text-[#707a6c]">Onto Sector 15A Main Avenue Road</span>
          </div>
        </div>

        {/* GPS Bottom Action */}
        <div className="relative z-10 flex items-center justify-between text-white text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#91f78e] animate-ping"></span>
            <span className="font-bold">1.2 km (4 mins remaining)</span>
          </div>
          <button
            onClick={() => showToast("Opening Google Maps Navigation...")}
            className="px-3 py-1 rounded-full bg-[#ffffff] text-[#1b1c17] font-bold text-[11px] shadow-md active:scale-95"
          >
            Start GPS
          </button>
        </div>
      </div>

      {/* Visual Proof & Inspection Capture Tiles */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[15px] text-[#1b1c17]">Visual Proof & Inspection</h3>
          <span className="text-[11px] text-[#0d631b] font-bold">2/3 Uploaded</span>
        </div>
        <p className="text-[11px] text-[#707a6c]">
          Take photos of odometer, fuel gauge, and vehicle body before driving to workshop.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {/* Tile 1: Odometer */}
          <div
            onClick={() => setOdometerCaptured(!odometerCaptured)}
            className={`h-24 rounded-xl border-2 flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-all ${
              odometerCaptured ? "border-[#0d631b] bg-[#cbffc2]/30" : "border-dashed border-[#e4e3db] bg-[#f6f4ec]"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                odometerCaptured ? "text-[#0d631b]" : "text-[#707a6c]"
              }`}
            >
              {odometerCaptured ? "check_circle" : "speed"}
            </span>
            <span className="font-bold text-[10px] text-[#1b1c17] mt-1 leading-tight">
              Odometer (31,420 KM)
            </span>
          </div>

          {/* Tile 2: Front Bumper */}
          <div
            onClick={() => setBumperCaptured(!bumperCaptured)}
            className={`h-24 rounded-xl border-2 flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-all ${
              bumperCaptured ? "border-[#0d631b] bg-[#cbffc2]/30" : "border-dashed border-[#e4e3db] bg-[#f6f4ec]"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                bumperCaptured ? "text-[#0d631b]" : "text-[#707a6c]"
              }`}
            >
              {bumperCaptured ? "check_circle" : "photo_camera"}
            </span>
            <span className="font-bold text-[10px] text-[#1b1c17] mt-1 leading-tight">
              Front Bumper & Grill
            </span>
          </div>

          {/* Tile 3: Rear Body */}
          <div
            onClick={() => {
              setRearCaptured(true);
              showToast("Rear body photo captured with timestamp and GPS tag.");
            }}
            className={`h-24 rounded-xl border-2 flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-all ${
              rearCaptured ? "border-[#0d631b] bg-[#cbffc2]/30" : "border-dashed border-[#0d631b] bg-[#f6f4ec]"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                rearCaptured ? "text-[#0d631b]" : "text-[#0d631b]"
              }`}
            >
              {rearCaptured ? "check_circle" : "add_a_photo"}
            </span>
            <span className="font-bold text-[10px] text-[#0d631b] mt-1 leading-tight">
              {rearCaptured ? "Rear Body Saved" : "+ Add Rear Body"}
            </span>
          </div>
        </div>
      </div>

      {/* Arrived at Workshop / Complete Pickup CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-[#ffffff]/95 backdrop-blur-md p-4 pb-safe border-t border-[#e4e3db] shadow-lg z-30">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => {
              showToast("Vehicle safely handed over to Sharma Auto Care Bay 03!");
              setCurrentScreen("workshop_bay_log");
            }}
            className="w-full h-12 rounded-full btn-tactile-green font-bold text-[13px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            <span>Handover Car at Bay 03</span>
          </button>
        </div>
      </div>
    </div>
  );
};
