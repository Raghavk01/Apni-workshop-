import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useApp } from "../context/AppContext";
import {
  ShieldAlert,
  Radio,
  MapPin,
  Car,
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  MessageSquare,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  X,
  Sliders,
  Clock,
  Compass,
  Zap,
  Activity,
  Trash2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export const GeofenceNotificationModal: React.FC = () => {
  const {
    isModalOpen,
    closeModal,
    geofenceConfig,
    updateGeofenceConfig,
    geofenceEvents,
    trackedVehicle,
    latestGeofenceAlert,
    triggerGeofenceSimulation,
    clearGeofenceEvents,
    vehicle,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"radar" | "events" | "settings">("radar");
  const [selectedRadius, setSelectedRadius] = useState<number>(geofenceConfig.radiusMeters);
  const [isSimulatingMove, setIsSimulatingMove] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circleLayerRef = useRef<L.Circle | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    setSelectedRadius(geofenceConfig.radiusMeters);
  }, [geofenceConfig.radiusMeters]);

  // Leaflet map setup for Geofence visualizer
  useEffect(() => {
    if (!isModalOpen.geofencing || activeTab !== "radar") return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [geofenceConfig.workshopLat, geofenceConfig.workshopLng],
          zoom: 14,
          zoomControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);

        // Workshop center pin
        const workshopIcon = L.divIcon({
          className: "geofence-workshop-pin",
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
              <div style="background: #0d631b; color: white; padding: 4px 8px; border-radius: 9999px; font-weight: 800; font-size: 10px; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
                <span>🏪 Sharma Auto Care</span>
              </div>
              <div style="width: 10px; height: 10px; background: #0d631b; transform: rotate(45deg); margin-top: -5px; border-right: 2px solid white; border-bottom: 2px solid white;"></div>
            </div>
          `,
          iconSize: [120, 36],
          iconAnchor: [60, 36],
        });

        L.marker([geofenceConfig.workshopLat, geofenceConfig.workshopLng], { icon: workshopIcon }).addTo(map);

        // Geofence Circle
        const circle = L.circle([geofenceConfig.workshopLat, geofenceConfig.workshopLng], {
          radius: geofenceConfig.radiusMeters,
          color: "#0d631b",
          weight: 2,
          fillColor: "#cbffc2",
          fillOpacity: 0.25,
          dashArray: "6, 6",
        }).addTo(map);
        circleLayerRef.current = circle;

        // Vehicle Marker
        const vehicleIcon = L.divIcon({
          className: "geofence-vehicle-marker",
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
              <span style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background: ${
                trackedVehicle.isInsideGeofence ? "rgba(13, 99, 27, 0.4)" : "rgba(230, 81, 0, 0.4)"
              }; animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <div style="width: 30px; height: 30px; border-radius: 9999px; background: ${
                trackedVehicle.isInsideGeofence ? "#0d631b" : "#e65100"
              }; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
                🚗
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const vMarker = L.marker([trackedVehicle.lat, trackedVehicle.lng], {
          icon: vehicleIcon,
          zIndexOffset: 1000,
        }).addTo(map);
        vehicleMarkerRef.current = vMarker;

        mapInstanceRef.current = map;
      } else {
        // Update circle radius if changed
        if (circleLayerRef.current) {
          circleLayerRef.current.setRadius(geofenceConfig.radiusMeters);
        }
        // Update vehicle marker position
        if (vehicleMarkerRef.current) {
          vehicleMarkerRef.current.setLatLng([trackedVehicle.lat, trackedVehicle.lng]);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isModalOpen.geofencing, activeTab, geofenceConfig.radiusMeters, trackedVehicle.lat, trackedVehicle.lng, trackedVehicle.isInsideGeofence]);

  // Clean up Leaflet on unmount or modal close
  useEffect(() => {
    if (!isModalOpen.geofencing && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      circleLayerRef.current = null;
      vehicleMarkerRef.current = null;
    }
  }, [isModalOpen.geofencing]);

  if (!isModalOpen.geofencing) return null;

  const handleApplyRadius = (rMeters: number) => {
    setSelectedRadius(rMeters);
    updateGeofenceConfig({ radiusMeters: rMeters });
    if (circleLayerRef.current) {
      circleLayerRef.current.setRadius(rMeters);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(circleLayerRef.current!.getBounds(), { padding: [30, 30] });
    }
    showToast(`Workshop Geofence Radius set to ${(rMeters / 1000).toFixed(1)} km!`);
  };

  const handleSimulateAction = async (scenario: "enter_workshop" | "exit_test_drive" | "exit_delivery" | "reset_home") => {
    setIsSimulatingMove(true);
    await triggerGeofenceSimulation(scenario);
    setTimeout(() => {
      setIsSimulatingMove(false);
      if (mapInstanceRef.current && vehicleMarkerRef.current) {
        mapInstanceRef.current.setView([trackedVehicle.lat, trackedVehicle.lng], 14, { animate: true });
      }
    }, 400);
  };

  const radiusPresets = [
    { label: "250 m", value: 250, desc: "Immediate Bay Gate" },
    { label: "500 m", value: 500, desc: "Industrial Sector" },
    { label: "1.0 km", value: 1000, desc: "Standard City Radius" },
    { label: "2.5 km", value: 2500, desc: "Corridor Perimeter" },
    { label: "5.0 km", value: 5000, desc: "Full Metro Area" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[#e4e3db] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0d631b] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <Radio size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[16px] leading-tight">Workshop Geofence Perimeter</h3>
                <span className="bg-[#cbffc2] text-[#005312] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Radar
                </span>
              </div>
              <p className="text-[11px] text-white/80 mt-0.5">
                Automated Entry & Exit alerts for {geofenceConfig.workshopName}
              </p>
            </div>
          </div>

          <button
            onClick={() => closeModal("geofencing")}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#e4e3db] bg-[#f8f7f2] px-4 pt-2">
          <button
            onClick={() => setActiveTab("radar")}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-bold text-[12px] border-b-2 transition-all cursor-pointer ${
              activeTab === "radar"
                ? "border-[#0d631b] text-[#0d631b]"
                : "border-transparent text-[#707a6c] hover:text-[#1b1c17]"
            }`}
          >
            <Activity size={15} />
            <span>Live Radar & Map</span>
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-bold text-[12px] border-b-2 transition-all cursor-pointer relative ${
              activeTab === "events"
                ? "border-[#0d631b] text-[#0d631b]"
                : "border-transparent text-[#707a6c] hover:text-[#1b1c17]"
            }`}
          >
            <Clock size={15} />
            <span>Event History ({geofenceEvents.length})</span>
            {geofenceEvents.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#0d631b] absolute top-2 right-2"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-bold text-[12px] border-b-2 transition-all cursor-pointer ${
              activeTab === "settings"
                ? "border-[#0d631b] text-[#0d631b]"
                : "border-transparent text-[#707a6c] hover:text-[#1b1c17]"
            }`}
          >
            <Sliders size={15} />
            <span>Perimeter Config</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: RADAR & SIMULATION */}
          {activeTab === "radar" && (
            <div className="space-y-4">
              {/* Active Vehicle Status HUD Bar */}
              <div
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  trackedVehicle.isInsideGeofence
                    ? "bg-[#cbffc2]/30 border-[#0d631b] text-[#005312]"
                    : "bg-[#fff3e0] border-[#e65100] text-[#e65100]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                      trackedVehicle.isInsideGeofence ? "bg-[#0d631b]" : "bg-[#e65100]"
                    }`}
                  >
                    <Car size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[14px] text-[#1b1c17]">
                        {vehicle.name || "Mahindra Thar LX"}
                      </span>
                      <span className="font-numeric-plate font-bold text-[11px] px-2 py-0.5 rounded bg-black/10 text-[#1b1c17]">
                        {vehicle.plate || "DL 01 AB 4092"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-bold flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              trackedVehicle.isInsideGeofence ? "bg-[#0d631b]" : "bg-[#e65100]"
                            }`}
                          ></span>
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                              trackedVehicle.isInsideGeofence ? "bg-[#0d631b]" : "bg-[#e65100]"
                            }`}
                          ></span>
                        </span>
                        {trackedVehicle.isInsideGeofence
                          ? "INSIDE Workshop Perimeter"
                          : "OUTSIDE Workshop Perimeter"}
                      </span>
                      <span className="text-[11px] opacity-75">
                        • {(trackedVehicle.distanceToWorkshopMeters / 1000).toFixed(2)} km from Bay 03
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-[#707a6c] uppercase font-bold block">Radius Boundary</span>
                  <span className="font-bold text-[14px] text-[#1b1c17]">
                    {(geofenceConfig.radiusMeters / 1000).toFixed(1)} km
                  </span>
                </div>
              </div>

              {/* Leaflet Map Stage */}
              <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-[#e4e3db] shadow-inner bg-[#eaf1e8]">
                <div ref={mapContainerRef} className="w-full h-full z-10" />

                {/* Turn HUD Overlay */}
                <div className="absolute top-3 left-3 bg-[#1b1c17]/85 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-lg z-20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#91f78e] animate-ping"></span>
                  <span className="text-[11px] font-bold">
                    Perimeter: {(geofenceConfig.radiusMeters / 1000).toFixed(1)} km circle active
                  </span>
                </div>

                {/* Speed & Telemetry HUD */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-[#1b1c17] px-3 py-1.5 rounded-xl shadow-md z-20 flex items-center gap-2 border border-[#e4e3db]">
                  <Compass size={14} className="text-[#0d631b]" />
                  <span className="text-[11px] font-bold">
                    Live Speed: {trackedVehicle.speedKm} km/h
                  </span>
                </div>
              </div>

              {/* Simulation Scenarios Controller */}
              <div className="bg-[#f8f7f2] rounded-2xl p-4 border border-[#e4e3db] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-[#0d631b]" />
                    <h4 className="font-bold text-[13px] text-[#1b1c17]">
                      Interactive Geofence Simulator (Test Live Triggers)
                    </h4>
                  </div>
                  <span className="text-[10px] bg-[#cbffc2] text-[#005312] font-bold px-2 py-0.5 rounded-full">
                    Instant Event Dispatch
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    disabled={isSimulatingMove}
                    onClick={() => handleSimulateAction("enter_workshop")}
                    className="p-3 rounded-xl bg-[#0d631b] hover:bg-[#094813] text-white font-bold text-[12px] flex items-center justify-between shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-left">
                      <span className="text-[16px]">🟢</span>
                      <div>
                        <span className="block leading-tight">Simulate Vehicle Entry</span>
                        <span className="text-[10px] text-white/80 font-normal">Cross into 1.0 km Bay Radius</span>
                      </div>
                    </div>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    disabled={isSimulatingMove}
                    onClick={() => handleSimulateAction("exit_test_drive")}
                    className="p-3 rounded-xl bg-[#e65100] hover:bg-[#c43f00] text-white font-bold text-[12px] flex items-center justify-between shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-left">
                      <span className="text-[16px]">🚗</span>
                      <div>
                        <span className="block leading-tight">Simulate QC Road Test Exit</span>
                        <span className="text-[10px] text-white/80 font-normal">Exits workshop perimeter (Highway)</span>
                      </div>
                    </div>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    disabled={isSimulatingMove}
                    onClick={() => handleSimulateAction("exit_delivery")}
                    className="p-3 rounded-xl bg-[#1b1c17] hover:bg-[#333] text-white font-bold text-[12px] flex items-center justify-between shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-left">
                      <span className="text-[16px]">🚀</span>
                      <div>
                        <span className="block leading-tight">Simulate Return Delivery Exit</span>
                        <span className="text-[10px] text-white/80 font-normal">En route to customer doorstep</span>
                      </div>
                    </div>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    disabled={isSimulatingMove}
                    onClick={() => handleSimulateAction("reset_home")}
                    className="p-3 rounded-xl bg-[#ffffff] hover:bg-[#eae8e0] text-[#1b1c17] font-bold text-[12px] flex items-center justify-between border border-[#e4e3db] shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-left">
                      <span className="text-[16px]">🏠</span>
                      <div>
                        <span className="block leading-tight">Reset at Customer Home</span>
                        <span className="text-[10px] text-[#707a6c] font-normal">Parked 3.8 km away</span>
                      </div>
                    </div>
                    <RefreshCw size={15} className="text-[#707a6c]" />
                  </button>
                </div>
              </div>

              {/* Radius Quick Presets */}
              <div className="space-y-2">
                <span className="text-[12px] font-bold text-[#1b1c17] block">
                  Quick Perimeter Radius Presets:
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {radiusPresets.map((p) => {
                    const isSelected = selectedRadius === p.value;
                    return (
                      <button
                        key={p.value}
                        onClick={() => handleApplyRadius(p.value)}
                        className={`py-2 px-1 rounded-xl text-center font-bold text-[11px] transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#0d631b] text-white shadow-xs"
                            : "bg-[#f0eee6] hover:bg-[#e4e3db] text-[#1b1c17]"
                        }`}
                      >
                        <span className="block">{p.label}</span>
                        <span className="text-[9px] opacity-75 font-normal block truncate">{p.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVENTS & LOGS */}
          {activeTab === "events" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[14px] text-[#1b1c17]">Geofence Transition Log</h4>
                  <p className="text-[11px] text-[#707a6c]">
                    Audit trail of all vehicle entries and exits with telemetry
                  </p>
                </div>
                {geofenceEvents.length > 0 && (
                  <button
                    onClick={clearGeofenceEvents}
                    className="text-[11px] text-[#ba1a1a] hover:bg-rose-50 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Clear Log</span>
                  </button>
                )}
              </div>

              {geofenceEvents.length === 0 ? (
                <div className="bg-[#f8f7f2] p-8 rounded-2xl text-center border border-[#e4e3db] space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#e4e3db] flex items-center justify-center mx-auto text-[#707a6c]">
                    <Clock size={24} />
                  </div>
                  <h5 className="font-bold text-[14px] text-[#1b1c17]">No Geofence Events Recorded Yet</h5>
                  <p className="text-[12px] text-[#707a6c] max-w-sm mx-auto">
                    Use the simulation controls in the Live Radar tab to trigger entry or exit events!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {geofenceEvents.map((evt) => {
                    const isEntry = evt.eventType === "ENTER";
                    return (
                      <div
                        key={evt.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isEntry
                            ? "bg-emerald-50/40 border-emerald-300"
                            : "bg-amber-50/40 border-amber-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-white font-bold text-[12px] ${
                                isEntry ? "bg-[#0d631b]" : "bg-[#e65100]"
                              }`}
                            >
                              {isEntry ? "🟢" : "🚗"}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[13px] text-[#1b1c17]">
                                  {isEntry ? "ENTERED WORKSHOP PERIMETER" : "EXITED WORKSHOP PERIMETER"}
                                </span>
                                <span
                                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                                    isEntry
                                      ? "bg-[#cbffc2] text-[#005312]"
                                      : "bg-[#fff3e0] text-[#e65100]"
                                  }`}
                                >
                                  {evt.eventType}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#707a6c]">
                                {evt.timestamp} • {evt.locationArea}
                              </span>
                            </div>
                          </div>

                          <span className="font-numeric-plate text-[11px] font-bold px-2 py-0.5 rounded bg-black/10 text-[#1b1c17]">
                            {evt.vehiclePlate}
                          </span>
                        </div>

                        <p className="text-[12px] text-[#40493d] mt-2 leading-relaxed">
                          {evt.message}
                        </p>

                        {evt.actionTriggered && (
                          <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                            <span className="text-[#707a6c] flex items-center gap-1">
                              <Zap size={12} className="text-[#0d631b]" />
                              <span>Action: {evt.actionTriggered}</span>
                            </span>
                            {evt.driverName && (
                              <span className="font-semibold text-[#1b1c17]">
                                Driver: {evt.driverName}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SETTINGS & NOTIFICATION CHANNELS */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="bg-[#f8f7f2] rounded-2xl p-4 border border-[#e4e3db] space-y-3">
                <h4 className="font-bold text-[14px] text-[#1b1c17]">Notification Channels</h4>
                <p className="text-[11px] text-[#707a6c]">
                  Configure which alerts are triggered upon crossing the workshop boundary.
                </p>

                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e4e3db] cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-[13px] text-[#1b1c17] block">
                          Notify on Workshop Entry
                        </span>
                        <span className="text-[11px] text-[#707a6c]">
                          Alert workshop managers to prep Bay 03 & tools
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={geofenceConfig.notifyOnEntry}
                      onChange={(e) => updateGeofenceConfig({ notifyOnEntry: e.target.checked })}
                      className="w-5 h-5 accent-[#0d631b] rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e4e3db] cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                        <Car size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-[13px] text-[#1b1c17] block">
                          Notify on Workshop Exit
                        </span>
                        <span className="text-[11px] text-[#707a6c]">
                          Alert customer when vehicle begins road test or return delivery
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={geofenceConfig.notifyOnExit}
                      onChange={(e) => updateGeofenceConfig({ notifyOnExit: e.target.checked })}
                      className="w-5 h-5 accent-[#0d631b] rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e4e3db] cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                        <Volume2 size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-[13px] text-[#1b1c17] block">
                          Audible Sound Chimes & Haptic Vibration
                        </span>
                        <span className="text-[11px] text-[#707a6c]">
                          Synthesized dual-tone beep chime on entry/exit
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={geofenceConfig.soundAlert}
                      onChange={(e) => updateGeofenceConfig({ soundAlert: e.target.checked })}
                      className="w-5 h-5 accent-[#0d631b] rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e4e3db] cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-green-100 text-green-800 flex items-center justify-center">
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-[13px] text-[#1b1c17] block">
                          WhatsApp Business Instant Dispatch
                        </span>
                        <span className="text-[11px] text-[#707a6c]">
                          Send automated WhatsApp template with live bay link
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={geofenceConfig.whatsappAlert}
                      onChange={(e) => updateGeofenceConfig({ whatsappAlert: e.target.checked })}
                      className="w-5 h-5 accent-[#0d631b] rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Center Location Meta */}
              <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] space-y-2">
                <span className="text-[10px] text-[#707a6c] uppercase font-bold tracking-wide block">
                  Geofence Anchor Center
                </span>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#0d631b]" />
                  <span className="font-bold text-[13px] text-[#1b1c17]">
                    {geofenceConfig.workshopName} ({geofenceConfig.workshopLat}, {geofenceConfig.workshopLng})
                  </span>
                </div>
                <p className="text-[11px] text-[#707a6c]">
                  {geofenceConfig.workshopAddress}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#f8f7f2] border-t border-[#e4e3db] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                geofenceConfig.enabled ? "bg-[#0d631b] animate-pulse" : "bg-[#ba1a1a]"
              }`}
            ></span>
            <span className="text-[12px] font-bold text-[#1b1c17]">
              {geofenceConfig.enabled ? "Geofencing Active" : "Geofencing Paused"}
            </span>
          </div>

          <button
            onClick={() => closeModal("geofencing")}
            className="px-5 py-2 rounded-xl bg-[#0d631b] hover:bg-[#094813] text-white font-bold text-[12px] shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            Close Radar
          </button>
        </div>
      </div>
    </div>
  );
};
