import React, { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { WorkshopGarage } from "../../types";
import { safeMapRemove } from "../../utils/leafletFix";

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

  // Recenter map helper
  const handleRecenter = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    try {
      map.invalidateSize();
      map.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }
    } catch (e) {
      console.warn("Recenter error:", e);
    }
  }, [userLocation.lat, userLocation.lng]);

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 14,
        zoomControl: false,
        scrollWheelZoom: true,
        touchZoom: true,
      });

      // High-resolution OpenStreetMap standard tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add zoom control at top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Listen for click to update user location
      map.on("click", (e: L.LeafletMouseEvent) => {
        if (onSetUserLocation) {
          onSetUserLocation(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;

      // Invalidate size on initial mount
      setTimeout(() => {
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.invalidateSize();
          } catch (e) {}
        }
      }, 150);
    }

    // ResizeObserver to ensure map tiles refresh on layout shifts or screen changes
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch (e) {}
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        safeMapRemove(mapInstanceRef.current);
        mapInstanceRef.current = null;
        userMarkerRef.current = null;
        markersRef.current = {};
      }
    };
  }, [onSetUserLocation]);

  // 2. Synchronize User Marker and Map Center on userLocation change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      map.invalidateSize();

      // Custom User Pin with live pulse halo and area label
      const userIcon = L.divIcon({
        className: "custom-leaflet-user-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab;">
            <span style="position: absolute; width: 44px; height: 44px; top: -6px; border-radius: 9999px; background: rgba(13, 99, 27, 0.28); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="width: 32px; height: 32px; border-radius: 9999px; background: #0d631b; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; z-index: 10;">
              <span class="material-symbols-outlined" style="font-size: 18px;">person_pin_circle</span>
            </div>
            <div style="width: 8px; height: 4px; border-radius: 9999px; background: rgba(0,0,0,0.4); margin-top: 1px;"></div>
            <span style="margin-top: 2px; padding: 2px 8px; border-radius: 9999px; background: #0d631b; color: white; font-size: 9.5px; font-weight: 800; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.4);">
              You (Drag to move)
            </span>
          </div>
        `,
        iconSize: [40, 52],
        iconAnchor: [20, 32],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
        userMarkerRef.current.setIcon(userIcon);
      } else {
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

      // Smoothly view user location
      map.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
    } catch (e) {
      console.warn("Leaflet update center warning:", e);
    }
  }, [userLocation.lat, userLocation.lng, userLocation.areaName, onSetUserLocation]);

  // 3. Render Workshop Garage Markers and Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => {
      try {
        m.remove();
      } catch (e) {}
    });
    markersRef.current = {};

    const boundsPoints: [number, number][] = [[userLocation.lat, userLocation.lng]];

    workshops.forEach((garage) => {
      const lat = garage.lat || userLocation.lat;
      const lng = garage.lng || userLocation.lng;
      boundsPoints.push([lat, lng]);
      const isSelected = selectedGarage?.id === garage.id;

      const iconHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            display: flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.22);
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
        iconSize: [44, 44],
        iconAnchor: [22, 44],
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 900 : 500,
      }).addTo(map);

      // Click to select garage
      marker.on("click", () => {
        onSelectWorkshop(garage);
      });

      // Bind rich popup with instant booking and direct directions
      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; color: #1b1c17; min-width: 170px;">
          <div style="font-weight: 800; color: #0d631b; font-size: 13px; line-height: 1.2;">${garage.name}</div>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">★ ${garage.rating} (${garage.reviewCount || 300}+ reviews)</div>
          <div style="color: #334155; font-size: 11px; margin-top: 2px; font-weight: 600;">📍 ${garage.distanceKm} km away • ~${garage.etaMins} mins</div>
          <div style="margin-top: 8px; display: flex; gap: 6px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(garage.name + " " + (garage.address || ""))}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #f1f5f9; color: #0f172a; padding: 4px 6px; border-radius: 6px; font-weight: 700; font-size: 10px; text-decoration: none; border: 1px solid #cbd5e1;">Directions</a>
            <button id="book-btn-${garage.id}" style="flex: 1; background: #0d631b; color: white; padding: 4px 6px; border-radius: 6px; font-weight: 700; font-size: 10px; border: none; cursor: pointer;">Book</button>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`book-btn-${garage.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onBookWorkshop) {
              onBookWorkshop(garage);
            } else {
              onSelectWorkshop(garage);
            }
          };
        }
      });

      markersRef.current[garage.id] = marker;
    });

    // Auto fit bounds to comfortably include user pin and closest 3-4 workshop pins
    if (boundsPoints.length > 1) {
      try {
        const bounds = L.latLngBounds(boundsPoints.slice(0, 5));
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 });
      } catch (e) {}
    }
  }, [workshops, selectedGarage?.id, userLocation.lat, userLocation.lng, onSelectWorkshop, onBookWorkshop]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating map interaction hint (top-left) */}
      <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-[#e4e3db] shadow-md flex items-center gap-1.5 pointer-events-auto">
          <span className="material-symbols-outlined text-[15px] text-[#0d631b]">touch_app</span>
          <span className="text-[10.5px] font-bold text-[#1b1c17]">
            Tap map or drag green pin to set exact location
          </span>
        </div>
      </div>

      {/* Floating In-Map Quick Recenter Button (bottom-right) */}
      <div className="absolute bottom-3 right-3 z-20">
        <button
          type="button"
          onClick={handleRecenter}
          className="bg-white hover:bg-[#eef8ed] text-[#0d631b] border border-[#c8e6c9] shadow-lg px-3 py-1.5 rounded-xl font-extrabold text-[11px] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          title="Center map on your location"
        >
          <span className="material-symbols-outlined text-[16px]">my_location</span>
          <span>Center on Me</span>
        </button>
      </div>
    </div>
  );
};
