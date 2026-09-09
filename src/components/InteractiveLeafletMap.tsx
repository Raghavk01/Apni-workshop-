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
}

export const InteractiveLeafletMap: React.FC<InteractiveLeafletMapProps> = ({
  userLocation,
  workshops,
  selectedGarage,
  onSelectWorkshop,
  onBookWorkshop,
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
      });

      // Add high-resolution crisp road tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add custom zoom control at top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when user location changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13, {
      animate: true,
    });

    // Update or create user location marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const userIcon = L.divIcon({
        className: "custom-user-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
            <span style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(59, 130, 246, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="width: 28px; height: 28px; border-radius: 9999px; background: #1d4ed8; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
              <span class="material-symbols-outlined" style="font-size: 16px;">directions_car</span>
            </div>
            <span style="margin-top: 2px; padding: 1px 6px; border-radius: 9999px; background: rgba(0,0,0,0.8); color: white; font-size: 9px; font-weight: bold; white-space: nowrap;">You</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(mapInstanceRef.current);
    }
  }, [userLocation]);

  // Update Workshop Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    (Object.values(markersRef.current) as L.Marker[]).forEach((m) => m.remove());
    markersRef.current = {};

    workshops.forEach((garage) => {
      const lat = garage.lat || userLocation.lat;
      const lng = garage.lng || userLocation.lng;
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

    // If selected garage, pan to it smoothly
    if (selectedGarage?.lat && selectedGarage?.lng) {
      map.panTo([selectedGarage.lat, selectedGarage.lng], { animate: true });
    }
  }, [workshops, selectedGarage, userLocation, onSelectWorkshop]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
