import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useApp } from "../context/AppContext";
import {
  Navigation,
  MapPin,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  Phone,
  MessageSquare,
  ExternalLink,
  Truck,
  Car,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  Copy,
  Compass,
  ChevronDown,
  ChevronUp,
  Route,
  RefreshCw,
} from "lucide-react";

interface PickupRouteDirectionsWidgetProps {
  customerName?: string;
  customerPhone?: string;
  destinationAddress?: string;
  vehicleName?: string;
  vehiclePlate?: string;
  onAdvanceStage?: (status: any) => void;
}

export const PickupRouteDirectionsWidget: React.FC<PickupRouteDirectionsWidgetProps> = ({
  customerName,
  customerPhone,
  destinationAddress,
  vehicleName,
  vehiclePlate,
}) => {
  const {
    userLocation,
    bookingInfo,
    selectedGarage,
    vehicle,
    customerProfile,
    showToast,
    advanceBookingStage,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"map" | "steps">("map");
  const [pickupStage, setPickupStage] = useState<"assigned" | "en_route" | "arrived" | "collected">("en_route");
  const [driverEta, setDriverEta] = useState("11 mins");
  const [driverDistance, setDriverDistance] = useState("3.8 km");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const finalCustomerName = customerName || customerProfile.name || vehicle.ownerName || "Vikram Malhotra";
  const finalCustomerPhone = customerPhone || customerProfile.phone || "+91 98101 23456";
  const finalAddress = destinationAddress || bookingInfo.address || userLocation.address || "B-402, Green Park Main, South Delhi, Delhi 110016";
  const finalVehicleName = vehicleName || vehicle.name || "Mahindra Thar LX";
  const finalPlate = vehiclePlate || vehicle.plate || "DL 01 AB 4092";

  // Coordinates: Workshop (Origin) and Customer (Destination)
  const workshopLat = selectedGarage.lat || 28.5355;
  const workshopLng = selectedGarage.lng || 77.2638;
  const customerLat = userLocation.lat || 28.5584;
  const customerLng = userLocation.lng || 77.2023;

  // Turn-by-turn navigation steps
  const turnDirections = [
    {
      id: 1,
      instruction: "Head North from Sharma Auto Care (Plot 14) onto Workshop Access Rd",
      distance: "350 m",
      icon: ArrowUp,
      landmark: "Pass Apollo Tyre Hub on left",
    },
    {
      id: 2,
      instruction: "Turn right onto Mahatma Gandhi Ring Road / Outer Ring Rd",
      distance: "1.4 km",
      icon: CornerUpRight,
      landmark: "Use right 2 lanes toward South Extension",
    },
    {
      id: 3,
      instruction: "Take the flyover slip road toward Green Park Main Market",
      distance: "850 m",
      icon: CornerUpLeft,
      landmark: "Keep left near Green Park Metro Station Gate 3",
    },
    {
      id: 4,
      instruction: "Turn left onto Block B Internal Avenue Road",
      distance: "400 m",
      icon: CornerUpLeft,
      landmark: "Security Boom Barrier Gate #2",
    },
    {
      id: 5,
      instruction: `Arrive at Customer Doorstep: ${finalAddress}`,
      distance: "Destination",
      icon: MapPin,
      landmark: "Ask for owner: " + finalCustomerName,
    },
  ];

  // Initialize Leaflet Map Route
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [(workshopLat + customerLat) / 2, (workshopLng + customerLng) / 2],
        zoom: 13,
        zoomControl: false,
        scrollWheelZoom: false,
        touchZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);

      // 1. Workshop Pin (Origin)
      const workshopIcon = L.divIcon({
        className: "custom-workshop-marker",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background: #0d631b; color: white; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 10px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
              <span>🏪 Workshop</span>
            </div>
            <div style="width: 12px; height: 12px; background: #0d631b; transform: rotate(45deg); margin-top: -6px; border-right: 2px solid white; border-bottom: 2px solid white;"></div>
          </div>
        `,
        iconSize: [80, 40],
        iconAnchor: [40, 40],
      });

      L.marker([workshopLat, workshopLng], { icon: workshopIcon }).addTo(map);

      // 2. Customer Pin (Destination)
      const customerIcon = L.divIcon({
        className: "custom-customer-marker",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background: #e65100; color: white; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 10px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
              <span>📍 Customer Doorstep</span>
            </div>
            <div style="width: 12px; height: 12px; background: #e65100; transform: rotate(45deg); margin-top: -6px; border-right: 2px solid white; border-bottom: 2px solid white;"></div>
          </div>
        `,
        iconSize: [120, 40],
        iconAnchor: [60, 40],
      });

      L.marker([customerLat, customerLng], { icon: customerIcon }).addTo(map);

      // 3. Driver Animated Location (Midpoint)
      const driverLat = workshopLat + (customerLat - workshopLat) * 0.45;
      const driverLng = workshopLng + (customerLng - workshopLng) * 0.45;

      const driverIcon = L.divIcon({
        className: "custom-driver-marker",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
            <span style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background: rgba(13, 99, 27, 0.3); animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="width: 30px; height: 30px; border-radius: 9999px; background: #0d631b; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
              🚗
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker([driverLat, driverLng], { icon: driverIcon, zIndexOffset: 500 }).addTo(map);

      // 4. Draw realistic route polyline
      const routePoints: [number, number][] = [
        [workshopLat, workshopLng],
        [workshopLat + (customerLat - workshopLat) * 0.25, workshopLng + 0.004],
        [workshopLat + (customerLat - workshopLat) * 0.5, workshopLng + (customerLng - workshopLng) * 0.4],
        [workshopLat + (customerLat - workshopLat) * 0.75, customerLng - 0.003],
        [customerLat, customerLng],
      ];

      const routeLine = L.polyline(routePoints, {
        color: "#0d631b",
        weight: 5,
        opacity: 0.85,
        dashArray: "1, 8",
        lineCap: "round",
      }).addTo(map);

      map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [workshopLat, workshopLng, customerLat, customerLng]);

  const handleOpenGoogleMaps = () => {
    const origin = `${workshopLat},${workshopLng}`;
    const destination = encodeURIComponent(finalAddress);
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(gmapsUrl, "_blank", "noopener,noreferrer");
    showToast("Opening Live Turn-by-Turn GPS on Google Maps...");
  };

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(finalAddress);
    showToast("Address copied to clipboard!");
  };

  return (
    <div className="bg-[#ffffff] rounded-2xl border-2 border-[#0d631b] shadow-md overflow-hidden space-y-0">
      {/* Header Banner */}
      <div className="bg-[#0d631b] text-white p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <Truck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[13px] leading-tight block">
                Doorstep Pickup Navigation
              </span>
              <span className="bg-[#cbffc2] text-[#005312] text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                Customer Opted
              </span>
            </div>
            <span className="text-[10px] text-white/80 block mt-0.5">
              {driverDistance} away • Approx {driverEta} driving time
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-3.5 space-y-3">
          {/* Customer Destination Contact Pill */}
          <div className="bg-[#f6f4ec] p-3 rounded-xl border border-[#e4e3db] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[13px] text-[#1b1c17] truncate">
                  {finalCustomerName}
                </span>
                <span className="font-numeric-plate text-[10px] font-bold bg-[#ffffff] px-1.5 py-0.5 rounded border border-[#e4e3db] text-[#1b1c17]">
                  {finalPlate}
                </span>
              </div>
              <p className="text-[11px] text-[#40493d] mt-0.5 flex items-center gap-1 truncate">
                <MapPin size={12} className="text-[#e65100] shrink-0" />
                <span className="truncate">{finalAddress}</span>
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  window.location.href = `tel:${finalCustomerPhone}`;
                  showToast(`Calling customer ${finalCustomerName}...`);
                }}
                className="w-8 h-8 rounded-full bg-[#0d631b] text-white flex items-center justify-center shadow-xs hover:bg-[#005312] cursor-pointer"
                title="Call Customer"
              >
                <Phone size={14} />
              </button>
              <button
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Hello ${finalCustomerName}! Sharma Auto Care valet partner Ramesh is en route to pick up your ${finalVehicleName} (${finalPlate}). ETA: 10 mins.`
                  );
                  window.open(`https://wa.me/${finalCustomerPhone.replace(/[^0-9]/g, "")}?text=${msg}`, "_blank");
                  showToast("Opening WhatsApp message to customer...");
                }}
                className="w-8 h-8 rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-xs hover:bg-[#1eb954] cursor-pointer"
                title="WhatsApp Customer"
              >
                <MessageSquare size={14} />
              </button>
              <button
                onClick={handleCopyAddress}
                className="w-8 h-8 rounded-full bg-[#eae8e0] text-[#1b1c17] flex items-center justify-center hover:bg-[#dedcd3] cursor-pointer"
                title="Copy Address"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          {/* View Toggle Tabs: Interactive Route Map vs Turn-by-Turn Steps */}
          <div className="flex items-center justify-between border-b border-[#e4e3db] pb-2">
            <div className="flex gap-1.5 bg-[#f0eee6] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("map")}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === "map"
                    ? "bg-white text-[#0d631b] shadow-xs"
                    : "text-[#707a6c] hover:text-[#1b1c17]"
                }`}
              >
                <Route size={13} />
                <span>Live Route Map</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("steps")}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === "steps"
                    ? "bg-white text-[#0d631b] shadow-xs"
                    : "text-[#707a6c] hover:text-[#1b1c17]"
                }`}
              >
                <Navigation size={13} />
                <span>Turn-by-Turn Steps ({turnDirections.length})</span>
              </button>
            </div>

            <button
              onClick={handleOpenGoogleMaps}
              className="text-[11px] font-bold text-[#0d631b] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Google Maps</span>
              <ExternalLink size={12} />
            </button>
          </div>

          {/* Tab 1: Embedded Interactive Route Map */}
          {activeTab === "map" && (
            <div className="space-y-2">
              <div className="h-52 w-full rounded-xl overflow-hidden border border-[#e4e3db] relative shadow-inner">
                <div ref={mapContainerRef} className="w-full h-full" />
                {/* Floating GPS HUD */}
                <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#e4e3db] shadow-sm text-[10px] font-bold flex items-center gap-1.5 text-[#1b1c17]">
                  <span className="w-2 h-2 rounded-full bg-[#0d631b] animate-ping"></span>
                  <span>Driver En Route • {driverEta}</span>
                </div>
              </div>

              {/* Waypoints Legend */}
              <div className="flex items-center justify-between text-[11px] px-1 text-[#40493d]">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0d631b]"></span>
                  <span><strong>Start:</strong> Sharma Auto Care</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e65100]"></span>
                  <span><strong>End:</strong> Doorstep ({finalAddress.split(",")[0]})</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Turn-by-Turn Navigation Steps List */}
          {activeTab === "steps" && (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {turnDirections.map((step, idx) => {
                const Icon = step.icon;
                const isLast = idx === turnDirections.length - 1;
                return (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded-xl border flex items-start gap-3 transition-colors ${
                      isLast
                        ? "bg-[#ffedea] border-[#ffb4ab] text-[#79241b]"
                        : "bg-[#fcfaf7] border-[#e4e3db] text-[#1b1c17]"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isLast ? "bg-[#e65100] text-white" : "bg-[#0d631b] text-white"
                      }`}
                    >
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[12px] leading-snug">
                          {step.instruction}
                        </span>
                        <span className="text-[10px] font-extrabold font-numeric-plate bg-white px-1.5 py-0.5 rounded border border-[#e4e3db] text-[#0d631b] shrink-0 ml-1">
                          {step.distance}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#707a6c] mt-0.5">{step.landmark}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Valet Driver Status Progression for Workshop Manager */}
          <div className="bg-[#f0f8ef] p-3 rounded-xl border border-[#0d631b]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#005312] uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={13} />
                Valet Dispatch Lifecycle
              </span>
              <span className="text-[10px] font-semibold text-[#0d631b]">
                Driver: Ramesh (DL-9102)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setPickupStage("en_route");
                  advanceBookingStage("VALET_DISPATCHED");
                  showToast("Valet Ramesh notified: En route to customer doorstep.");
                }}
                className={`py-1.5 px-2 rounded-lg font-bold text-[10px] text-center transition-all cursor-pointer ${
                  pickupStage === "en_route"
                    ? "bg-[#0d631b] text-white shadow-xs"
                    : "bg-white text-[#40493d] border border-[#e4e3db]"
                }`}
              >
                1. Driver En Route
              </button>

              <button
                type="button"
                onClick={() => {
                  setPickupStage("arrived");
                  showToast("Valet has reached customer doorstep. Ready for vehicle inspection.");
                }}
                className={`py-1.5 px-2 rounded-lg font-bold text-[10px] text-center transition-all cursor-pointer ${
                  pickupStage === "arrived"
                    ? "bg-[#0d631b] text-white shadow-xs"
                    : "bg-white text-[#40493d] border border-[#e4e3db]"
                }`}
              >
                2. At Doorstep
              </button>

              <button
                type="button"
                onClick={() => {
                  setPickupStage("collected");
                  advanceBookingStage("CAR_PICKED_UP");
                  showToast("Vehicle collected! Valet driving back to Sharma Auto Care Bay 03.");
                }}
                className={`py-1.5 px-2 rounded-lg font-bold text-[10px] text-center transition-all cursor-pointer ${
                  pickupStage === "collected"
                    ? "bg-[#0d631b] text-white shadow-xs"
                    : "bg-white text-[#40493d] border border-[#e4e3db]"
                }`}
              >
                3. Car Picked Up
              </button>
            </div>
          </div>

          {/* Quick Action Button: Launch Full Turn-by-Turn GPS */}
          <button
            type="button"
            onClick={handleOpenGoogleMaps}
            className="w-full h-11 rounded-xl btn-tactile-green font-bold text-[12px] flex items-center justify-center gap-2 shadow-sm active:scale-98 cursor-pointer"
          >
            <Navigation size={16} />
            <span>Launch Live Turn-by-Turn GPS Navigation</span>
            <ExternalLink size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
