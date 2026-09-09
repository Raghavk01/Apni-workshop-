import React, { useState, useEffect, Component, ReactNode } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useApiIsLoaded,
  useApiLoadingStatus,
  APILoadingStatus,
} from "@vis.gl/react-google-maps";
import { WorkshopGarage } from "../types";

interface RealGoogleMapProps {
  apiKey: string;
  userLocation: { lat: number; lng: number; areaName: string };
  workshops: WorkshopGarage[];
  selectedGarage: WorkshopGarage | null;
  onSelectWorkshop: (garage: WorkshopGarage) => void;
  onBookWorkshop?: (garage: WorkshopGarage) => void;
  onGcpReferrerError?: () => void;
}

interface MapErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: () => void;
}

interface MapErrorBoundaryState {
  hasError: boolean;
}

// Error boundary to catch any unexpected Google Maps script rendering exceptions
class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  constructor(props: MapErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): MapErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn("Google Maps render caught in Error Boundary:", error, info);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Sub-component to manage map panning when location or selected garage updates
const MapCameraSync: React.FC<{
  targetLat: number;
  targetLng: number;
}> = ({ targetLat, targetLng }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    try {
      map.panTo({ lat: targetLat, lng: targetLng });
    } catch (e) {}
  }, [map, targetLat, targetLng]);

  return null;
};

// Safe Markers wrapper that executes if Google Maps JS API is available
const GoogleMapSafeMarkers: React.FC<{
  userLocation: { lat: number; lng: number; areaName: string };
  workshops: WorkshopGarage[];
  selectedGarage: WorkshopGarage | null;
  onSelectWorkshop: (garage: WorkshopGarage) => void;
  onBookWorkshop?: (garage: WorkshopGarage) => void;
}> = ({ userLocation, workshops, selectedGarage, onSelectWorkshop, onBookWorkshop }) => {
  const [activeInfoWindow, setActiveInfoWindow] = useState<WorkshopGarage | null>(null);

  const hasMarkerLib =
    typeof window !== "undefined" &&
    (window as any).google &&
    (window as any).google.maps &&
    (window as any).google.maps.marker &&
    (window as any).google.maps.marker.AdvancedMarkerElement;

  if (!hasMarkerLib) {
    return null;
  }

  return (
    <>
      <MapCameraSync
        targetLat={selectedGarage?.lat || userLocation.lat}
        targetLng={selectedGarage?.lng || userLocation.lng}
      />

      {/* User Location Beacon */}
      <AdvancedMarker
        position={{ lat: userLocation.lat, lng: userLocation.lng }}
        title={`Your location (${userLocation.areaName})`}
      >
        <div className="relative flex flex-col items-center">
          <span className="w-9 h-9 rounded-full bg-blue-500/25 animate-ping absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 pointer-events-none"></span>
          <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white z-10">
            <span className="material-symbols-outlined text-[15px]">directions_car</span>
          </div>
          <span className="mt-0.5 px-1.5 py-0.2 bg-black/80 rounded-full border border-white/20 text-[8px] font-bold text-white tracking-wider whitespace-nowrap">
            YOU
          </span>
        </div>
      </AdvancedMarker>

      {/* Real Workshop Markers */}
      {workshops.map((garage) => {
        const lat = garage.lat || userLocation.lat;
        const lng = garage.lng || userLocation.lng;
        const isSelected = selectedGarage?.id === garage.id;

        return (
          <AdvancedMarker
            key={garage.id}
            position={{ lat, lng }}
            title={`${garage.name} (${garage.rating}★)`}
            onClick={() => {
              onSelectWorkshop(garage);
              setActiveInfoWindow(garage);
            }}
          >
            <div className="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-md border whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[#0d631b] text-white border-[#86efac] ring-2 ring-[#4ade80]"
                    : "bg-white text-[#111a13] border-[#86efac]"
                }`}
              >
                <span className="text-[#f59e0b]">★</span>
                <span>{garage.rating}</span>
                <span className="text-[9px] opacity-80">({garage.distanceKm}km)</span>
              </div>
              <div
                className={`w-1.5 h-1.5 rotate-45 -mt-1 ${
                  isSelected
                    ? "bg-[#0d631b] border-r border-b border-[#86efac]"
                    : "bg-white border-r border-b border-[#86efac]"
                }`}
              ></div>
            </div>
          </AdvancedMarker>
        );
      })}

      {/* Interactive InfoWindow for clicked real workshop */}
      {activeInfoWindow && (
        <InfoWindow
          position={{
            lat: activeInfoWindow.lat || userLocation.lat,
            lng: activeInfoWindow.lng || userLocation.lng,
          }}
          onCloseClick={() => setActiveInfoWindow(null)}
        >
          <div className="p-1 max-w-xs text-[#1b1c17]">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-[13px] text-[#0d631b]">{activeInfoWindow.name}</h4>
              <span className="text-[10px] font-bold bg-[#fff8e1] text-[#b45309] px-1 rounded">
                ★ {activeInfoWindow.rating}
              </span>
            </div>
            <p className="text-[11px] text-[#40493d] mt-0.5">{activeInfoWindow.locationArea}</p>
            <p className="text-[10px] text-[#707a6c] mt-0.5">
              {activeInfoWindow.distanceKm} km away • ~{activeInfoWindow.etaMins} mins drive
            </p>
            {activeInfoWindow.phone && (
              <p className="text-[10px] text-[#0d631b] font-medium mt-0.5">
                📞 {activeInfoWindow.phone}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#e4e3db]">
              <a
                href={
                  activeInfoWindow.googleMapsUri ||
                  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    activeInfoWindow.name + " " + (activeInfoWindow.address || "")
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded-md bg-[#f0eee6] hover:bg-[#e4e3db] text-[10px] font-bold flex items-center gap-1 text-[#1b1c17]"
              >
                <span className="material-symbols-outlined text-[13px]">directions</span>
                <span>Directions</span>
              </a>
              {onBookWorkshop && (
                <button
                  onClick={() => onBookWorkshop(activeInfoWindow)}
                  className="px-2.5 py-1 rounded-md bg-[#0d631b] hover:bg-[#005312] text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  Book Bay
                </button>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

// Map content loaded guard
const GoogleMapInner: React.FC<{
  userLocation: { lat: number; lng: number; areaName: string };
  workshops: WorkshopGarage[];
  selectedGarage: WorkshopGarage | null;
  onSelectWorkshop: (garage: WorkshopGarage) => void;
  onBookWorkshop?: (garage: WorkshopGarage) => void;
  onAuthFailure: () => void;
}> = ({ userLocation, workshops, selectedGarage, onSelectWorkshop, onBookWorkshop, onAuthFailure }) => {
  const loadingStatus = useApiLoadingStatus();
  const apiLoaded = useApiIsLoaded();

  useEffect(() => {
    if (loadingStatus === APILoadingStatus.FAILED) {
      onAuthFailure();
    }
  }, [loadingStatus, onAuthFailure]);

  if (!apiLoaded || loadingStatus !== APILoadingStatus.LOADED) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#f6f4ec] text-[#40493d] gap-2">
        <div className="w-8 h-8 rounded-full border-3 border-[#0d631b] border-t-transparent animate-spin"></div>
        <span className="text-[12px] font-bold">Connecting to Google Maps Platform...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Map
        defaultCenter={{ lat: userLocation.lat, lng: userLocation.lng }}
        defaultZoom={13}
        mapId="DEMO_MAP_ID"
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl={true}
        streetViewControl={false}
        fullscreenControl={false}
        internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
        className="w-full h-full"
      >
        <GoogleMapSafeMarkers
          userLocation={userLocation}
          workshops={workshops}
          selectedGarage={selectedGarage}
          onSelectWorkshop={onSelectWorkshop}
          onBookWorkshop={onBookWorkshop}
        />
      </Map>
    </div>
  );
};

// Direct Live Interactive Google Maps View
const DirectGoogleMapsViewer: React.FC<{
  userLocation: { lat: number; lng: number; areaName: string };
  workshops: WorkshopGarage[];
  selectedGarage: WorkshopGarage | null;
  onSelectWorkshop: (garage: WorkshopGarage) => void;
  onBookWorkshop?: (garage: WorkshopGarage) => void;
}> = ({ userLocation, workshops, selectedGarage, onSelectWorkshop, onBookWorkshop }) => {
  const targetGarage = selectedGarage || workshops[0];
  const targetQuery = targetGarage
    ? `${targetGarage.name}, ${targetGarage.address || targetGarage.locationArea}`
    : `car repair workshop near ${userLocation.areaName}`;

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    targetQuery
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full h-full relative bg-[#f6f4ec] flex flex-col overflow-hidden">
      {/* Live Google Maps Iframe */}
      <iframe
        title="Google Maps Live Workshop View"
        src={embedUrl}
        className="w-full flex-1 border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Floating Workshop Strip on Google Maps */}
      <div className="absolute bottom-2 inset-x-2 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-[#e4e3db] shadow-lg flex items-center justify-between gap-3 pointer-events-auto">
          {targetGarage ? (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#0d631b]">
                  verified
                </span>
                <h4 className="font-extrabold text-[12px] text-[#111a13] truncate">
                  {targetGarage.name}
                </h4>
                <span className="text-[10px] font-bold bg-[#fff8e1] text-[#b45309] px-1.5 py-0.2 rounded-md">
                  ★ {targetGarage.rating}
                </span>
              </div>
              <p className="text-[11px] text-[#40493d] truncate mt-0.5">
                📍 {targetGarage.address || targetGarage.locationArea} • {targetGarage.distanceKm} km away
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-[#707a6c]">Select a workshop to view on Google Maps</p>
          )}

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {targetGarage && (
              <a
                href={
                  targetGarage.googleMapsUri ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    targetGarage.name + " " + (targetGarage.address || "")
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-[#f0eee6] hover:bg-[#e4e3db] text-[#1b1c17] rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px] text-[#4285f4]">open_in_new</span>
                <span>Open App</span>
              </a>
            )}
            {targetGarage && onBookWorkshop && (
              <button
                onClick={() => onBookWorkshop(targetGarage)}
                className="px-3 py-1.5 bg-[#0d631b] hover:bg-[#005312] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              >
                <span>Book Bay</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const RealGoogleMap: React.FC<RealGoogleMapProps> = ({
  apiKey,
  userLocation,
  workshops,
  selectedGarage,
  onSelectWorkshop,
  onBookWorkshop,
  onGcpReferrerError,
}) => {
  const [useJsApi, setUseJsApi] = useState<boolean>(false);
  const [authError, setAuthError] = useState<boolean>(false);
  const [retryKey, setRetryKey] = useState<number>(0);

  // Catch Google Maps JavaScript API Referrer / Authentication failure & script errors
  useEffect(() => {
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps JS API Authentication/Referrer Failure detected");
      setAuthError(true);
      setUseJsApi(false);
      onGcpReferrerError?.();
      if (typeof prevAuthFailure === "function") {
        try {
          prevAuthFailure();
        } catch (e) {}
      }
    };

    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || "";
      const src = event.filename || "";
      if (
        msg.includes("Google Maps") ||
        msg.includes("RefererNotAllowedMapError") ||
        msg.includes("Script error.") ||
        src.includes("maps.googleapis.com")
      ) {
        event.preventDefault();
        setAuthError(true);
        setUseJsApi(false);
        onGcpReferrerError?.();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason || "");
      if (reason.includes("Google Maps") || reason.includes("RefererNotAllowedMapError")) {
        event.preventDefault();
        setAuthError(true);
        setUseJsApi(false);
        onGcpReferrerError?.();
      }
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      (window as any).gm_authFailure = prevAuthFailure;
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [onGcpReferrerError]);

  // Use Direct Google Maps viewer by default (bypasses GCP Referrer restrictions)
  if (!useJsApi || !apiKey || authError) {
    return (
      <DirectGoogleMapsViewer
        userLocation={userLocation}
        workshops={workshops}
        selectedGarage={selectedGarage}
        onSelectWorkshop={onSelectWorkshop}
        onBookWorkshop={onBookWorkshop}
      />
    );
  }

  return (
    <MapErrorBoundary
      fallback={
        <DirectGoogleMapsViewer
          userLocation={userLocation}
          workshops={workshops}
          selectedGarage={selectedGarage}
          onSelectWorkshop={onSelectWorkshop}
          onBookWorkshop={onBookWorkshop}
        />
      }
      onError={() => {
        setAuthError(true);
        setUseJsApi(false);
      }}
    >
      <APIProvider
        key={retryKey}
        apiKey={apiKey}
        solutionChannel="GMP_aistudio_web"
        onError={() => {
          setAuthError(true);
          setUseJsApi(false);
        }}
      >
        <GoogleMapInner
          userLocation={userLocation}
          workshops={workshops}
          selectedGarage={selectedGarage}
          onSelectWorkshop={onSelectWorkshop}
          onBookWorkshop={onBookWorkshop}
          onAuthFailure={() => {
            setAuthError(true);
            setUseJsApi(false);
          }}
        />
      </APIProvider>
    </MapErrorBoundary>
  );
};
