import React from "react";
import { useApp } from "../context/AppContext";

export const MechanicLiveBayLogScreen: React.FC = () => {
  const {
    bayLogSteps,
    addBayLogStep,
    estimates,
    vehicle,
    openModal,
    setCurrentScreen,
    showToast,
  } = useApp();

  const handleCaptureBayPhoto = () => {
    addBayLogStep({
      title: "New Caliper Pin Greasing & Bleed",
      time: "Just Now",
      description: "Applied high-temp silicone grease to slide pins. Hydraulic brake bleed verified.",
      status: "done",
      photos: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBdNXrIvKrD1yN7nINMoJfjKSJjuFDhpZuEIBZUeMOuGO_QkcSAoIhY7_y610lKnUqsOVrCvP5JI5vXq6d5TJ7ZBquqmcyeDae-CAKwfXU-s1tu4wpof97Z73sJlbgqI0D0SpL69db1qjDsiW5mL3JhEmwdlMZoOQRIivZ9SBzeIYBe9etehIDgLeJtQDv4NE3t4V6J4tY5KikV1ej_NKvh53_MSrfnB1SNxPdy4LFP5hhH1KKRsD8J",
      ],
      photoBadge: "1 photo dispatched to Vikram",
    });
  };

  const totalEstimateCost = estimates.reduce((acc, curr) => acc + curr.totalCost, 0);

  return (
    <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full pb-28">
      {/* Top Bay Indicator Card */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] shadow-xs space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#cbffc2] text-[#005312] text-[10px] font-extrabold uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#005312] animate-ping"></span>
              Bay 03 Mechanical
            </span>
            <h2 className="font-bold text-[18px] text-[#1b1c17] mt-1 leading-tight">
              {vehicle.name} {vehicle.model}
            </h2>
            <p className="text-[12px] text-[#707a6c]">
              Owner: {vehicle.ownerName} • Elapsed: 32 mins
            </p>
          </div>

          <div className="text-right">
            <span className="bg-[#f6f4ec] px-2 py-0.5 rounded font-numeric-plate text-[12px] font-bold text-[#1b1c17] border border-[#e4e3db]">
              {vehicle.plate}
            </span>
            <span className="text-[10px] text-[#0d631b] font-bold block mt-1">
              Tech: Suresh (Master)
            </span>
          </div>
        </div>

        {/* Quick Action Buttons for Mechanic */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f0eee6]">
          <button
            onClick={handleCaptureBayPhoto}
            className="h-10 rounded-xl bg-[#f0eee6] hover:bg-[#eae8e0] text-[#1b1c17] font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-[#0d631b]">add_a_photo</span>
            <span>+ Add Bay Photo</span>
          </button>

          <button
            onClick={() => openModal("aiDiagnose")}
            className="h-10 rounded-xl bg-[#a3f69c]/70 hover:bg-[#a3f69c] text-[#005312] font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            <span>AI Diagnostic Copilot</span>
          </button>
        </div>
      </div>

      {/* Live Bay Log Timeline with Photos */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[15px] text-[#1b1c17]">Live Bay Log</h3>
          <span className="text-[11px] text-[#0d631b] font-bold">Auto-syncing to owner</span>
        </div>

        <div className="space-y-4 relative pl-2 pt-1">
          {bayLogSteps.map((step, idx) => (
            <div key={step.id} className="flex items-start gap-3 relative">
              {idx !== bayLogSteps.length - 1 && (
                <div
                  className={`absolute left-3.5 top-6 bottom-0 w-0.5 ${
                    step.status === "done" ? "bg-[#0d631b]" : "bg-[#eae8e0]"
                  }`}
                ></div>
              )}

              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                  step.status === "done"
                    ? "bg-[#0d631b] text-white"
                    : step.status === "in_progress"
                    ? "bg-[#cbffc2] text-[#005312] ring-2 ring-[#0d631b] animate-pulse"
                    : "bg-[#eae8e0] text-[#707a6c]"
                }`}
              >
                {step.status === "done" ? (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                ) : (
                  <span className="material-symbols-outlined text-[14px]">build</span>
                )}
              </div>

              <div className="flex-1 pb-1">
                <div className="flex items-center justify-between gap-1">
                  <h4
                    className={`text-[13px] font-bold ${
                      step.status === "in_progress" ? "text-[#0d631b]" : "text-[#1b1c17]"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <span className="text-[10px] text-[#707a6c]">{step.time}</span>
                </div>
                <p className="text-[11px] text-[#40493d] mt-0.5">{step.description}</p>

                {/* Evidence photos if attached */}
                {step.photos && step.photos.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      {step.photos.map((ph, pIdx) => (
                        <div
                          key={pIdx}
                          className="w-20 h-16 rounded-lg overflow-hidden bg-[#eae8e0] border border-[#e4e3db] flex-shrink-0"
                        >
                          <img src={ph} alt="Bay step" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    {step.photoBadge && (
                      <span className="text-[10px] font-semibold text-[#0d631b] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">send</span>
                        {step.photoBadge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Approved Work & Estimates (₹7,450) */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[15px] text-[#1b1c17]">Approved Work & Estimates</h3>
            <span className="text-[11px] text-[#707a6c]">All jobs approved by vehicle owner</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#707a6c] block">Total In-Bay</span>
            <span className="font-numeric-plate font-extrabold text-[16px] text-[#0d631b]">
              ₹{totalEstimateCost.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {estimates.map((est) => (
            <div key={est.id} className="bg-[#f6f4ec] rounded-xl p-3 border border-[#e4e3db] space-y-1.5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-[13px] text-[#1b1c17]">{est.title}</h4>
                  <p className="text-[11px] text-[#0d631b] font-medium">{est.subTitle}</p>
                </div>
                <span className="font-numeric-plate font-bold text-[14px] text-[#1b1c17]">
                  ₹{est.totalCost.toLocaleString()}
                </span>
              </div>

              <div className="space-y-0.5 text-[11px] text-[#40493d]">
                {est.breakdown.map((b, bIdx) => (
                  <div key={bIdx} className="flex justify-between">
                    <span>{b.label}</span>
                    <span>₹{b.cost}</span>
                  </div>
                ))}
              </div>

              {est.tag && (
                <div className="pt-1 flex items-center justify-between text-[10px] text-[#707a6c]">
                  <span className="bg-[#cbffc2] text-[#005312] px-2 py-0.5 rounded font-bold">
                    {est.tag}
                  </span>
                  <span className="font-semibold text-[#1b1c17]">{est.stockStatus}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Found New Issue CTA */}
        <button
          onClick={() => openModal("addEstimate")}
          className="w-full h-11 rounded-xl bg-[#f0eee6] hover:bg-[#eae8e0] text-[#1b1c17] font-bold text-[12px] flex items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px] text-[#e65100]">add_circle</span>
          <span>Found New Issue? + Add Estimate</span>
        </button>
      </div>

      {/* Sticky Complete & Final QC CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-[#ffffff]/95 backdrop-blur-md p-4 pb-safe border-t border-[#e4e3db] shadow-lg z-30">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => {
              showToast("Work completed in Bay 03! Advancing to Final QC certification...");
              setCurrentScreen("customer_tracker_ready");
            }}
            className="w-full h-12 rounded-full btn-tactile-green font-bold text-[13px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">task_alt</span>
            <span>Complete Work & Move to Final QC</span>
          </button>
        </div>
      </div>
    </div>
  );
};
