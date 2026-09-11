import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { WorkshopGarage } from "../types";

interface InteractiveLeafletMapProps {
  userLocation: { lat: number; lng: number; areaName: string };
  workshops: WorkshopGarage[];
  selectedGarage: WorkshopGarage | null;
  onSelectWorkshop: (garage: WorkshopGarage) => void;
  onBookWorkshop?: (garage: WorkshopGarage) => void;
  onSetUserLocation?: (lat: number, lng: number) => void;
}

export const InteractiveLeafletMap: React.FC<InteractiveLeafletMapProps> = ({
  userLocation,
  workshops,
  selectedGarage,
  onSelectWorkshop,
  onBookWorkshop,
  onSetUserLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        zoomControl: false,
        scrollWheelZoom: true,
        touchZoom: true,
      });

      // Add high-resolution crisp road tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add custom zoom control at top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Listen for click to allow user to instantly set their pinpoint location
      map.on("click", (e: L.LeafletMouseEvent) => {
        if (onSetUserLocation) {
          onSetUserLocation(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;

      // Invalidate size to ensure proper tile rendering
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onSetUserLocation]);

  // Update center when user location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();
    map.setView([userLocation.lat, userLocation.lng], 13, {
      animate: true,
    });

    // Update or create user location marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const userIcon = L.divIcon({
        className: "custom-user-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: grab;">
            <span style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background: rgba(13, 99, 27, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="width: 30px; height: 30px; border-radius: 9999px; background: #0d631b; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
              <span class="material-symbols-outlined" style="font-size: 16px;">person_pin_circle</span>
            </div>
            <span style="margin-top: 2px; padding: 1px 7px; border-radius: 9999px; background: #0d631b; color: white; font-size: 9px; font-weight: 800; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">You (Drag to move)</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        if (onSetUserLocation) {
          onSetUserLocation(pos.lat, pos.lng);
        }
      });

      userMarkerRef.current = marker;
    }
  }, [userLocation, onSetUserLocation]);

  // Update Workshop Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    (Object.values(markersRef.current) as L.Marker[]).forEach((m) => m.remove());
    markersRef.current = {};

    const boundsPoints: [number, number][] = [[userLocation.lat, userLocation.lng]];

    workshops.forEach((garage) => {
      const lat = garage.lat || userLocation.lat;
      const lng = garage.lng || userLocation.lng;
      boundsPoints.push([lat, lng]);
      const isSelected = selectedGarage?.id === garage.id;

      const iconHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="
            display: flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            background: ${isSelected ? "#0d631b" : "#ffffff"};
            color: ${isSelected ? "#ffffff" : "#111a13"};
            border: 2px solid ${isSelected ? "#86efac" : "#0d631b"};
            transform: ${isSelected ? "scale(1.15)" : "scale(1.0)"};
            transition: all 0.2s ease;
          ">
            <span style="color: #f59e0b;">★</span>
            <span>${garage.rating}</span>
            <span style="font-size: 10px; opacity: 0.9;">(${garage.distanceKm}km)</span>
          </div>
          <div style="
            width: 8px; height: 8px; transform: rotate(45deg); margin-top: -4px;
            background: ${isSelected ? "#0d631b" : "#ffffff"};
            border-right: 2px solid ${isSelected ? "#86efac" : "#0d631b"};
            border-bottom: 2px solid ${isSelected ? "#86efac" : "#0d631b"};
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `workshop-pin-${garage.id}`,
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 900 : 500,
      }).addTo(map);

      marker.on("click", () => {
        onSelectWorkshop(garage);
      });

      markersRef.current[garage.id] = marker;
    });

    // If there are multiple workshops, smoothly fit bounds to show user and closest hubs
    if (boundsPoints.length > 1 && !selectedGarage) {
      try {
        const bounds = L.latLngBounds(boundsPoints.slice(0, 5));
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
      } catch (e) {}
    } else if (selectedGarage?.lat && selectedGarage?.lng) {
      map.panTo([selectedGarage.lat, selectedGarage.lng], { animate: true });
    }
  }, [workshops, selectedGarage, userLocation, onSelectWorkshop]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating map interaction hint */}
      <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-[#e4e3db] shadow-md flex items-center gap-1.5 pointer-events-auto">
          <span className="material-symbols-outlined text-[15px] text-[#0d631b]">touch_app</span>
          <span className="text-[10.5px] font-bold text-[#1b1c17]">
            Tap map or drag green pin to set exact location
          </span>
        </div>
      </div>
    </div>
  );
};
