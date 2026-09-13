import React from "react";
import { useApp } from "../../context/AppContext";
import { Radio, X, MapPin, ChevronRight, Volume2, Car, Zap } from "lucide-react";

export const GeofenceFloatingAlertBanner: React.FC = () => {
  const { latestGeofenceAlert, dismissGeofenceAlert, openModal } = useApp();

  if (!latestGeofenceAlert) return null;

  const isEntry = latestGeofenceAlert.eventType === "ENTER";

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg animate-in slide-in-from-top-4 duration-300">
      <div
        className={`p-4 rounded-2xl shadow-2xl border-2 backdrop-blur-xl flex items-start justify-between gap-3 ${
          isEntry
            ? "bg-[#0d631b]/95 border-[#cbffc2] text-white shadow-emerald-950/30"
            : "bg-[#e65100]/95 border-amber-300 text-white shadow-orange-950/30"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs ${
              isEntry ? "bg-[#ffffff]/20" : "bg-[#ffffff]/20"
            }`}
          >
            {isEntry ? (
              <span className="text-[20px] animate-bounce">🟢</span>
            ) : (
              <span className="text-[20px] animate-pulse">🚗</span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white/20 backdrop-blur-md text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Geofence {latestGeofenceAlert.eventType}
              </span>
              <span className="text-[11px] opacity-90 font-medium">
                {latestGeofenceAlert.timestamp}
              </span>
              <span className="font-numeric-plate bg-black/30 px-2 py-0.5 rounded text-[10px] font-bold">
                {latestGeofenceAlert.vehiclePlate}
              </span>
            </div>

            <h4 className="font-extrabold text-[14px] leading-tight">
              {isEntry
                ? `Vehicle Entered Workshop Radius (${latestGeofenceAlert.distanceMeters}m)`
                : `Vehicle Exited Workshop Perimeter (${latestGeofenceAlert.distanceMeters}m)`}
            </h4>

            <p className="text-[12px] text-white/90 line-clamp-2">
              {latestGeofenceAlert.message}
            </p>

            {latestGeofenceAlert.actionTriggered && (
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-white/90">
                <Zap size={13} className="text-yellow-300 shrink-0" />
                <span className="truncate">{latestGeofenceAlert.actionTriggered}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  dismissGeofenceAlert();
                  openModal("geofencing");
                }}
                className="bg-white text-[#1b1c17] hover:bg-white/90 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Radio size={13} className="text-[#0d631b]" />
                <span>Open Geofence Radar</span>
                <ChevronRight size={13} />
              </button>

              <button
                onClick={dismissGeofenceAlert}
                className="bg-black/25 hover:bg-black/40 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={dismissGeofenceAlert}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0 cursor-pointer transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
