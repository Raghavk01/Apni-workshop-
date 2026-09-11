import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MetroHub {
  name: string;
  region: string;
  lat: number;
  lng: number;
  address: string;
  popularTag?: string;
}

const METRO_HUBS: MetroHub[] = [
  // Delhi NCR
  { name: "Vasant Kunj", region: "Delhi NCR", lat: 28.5244, lng: 77.1565, address: "Sector B, Pocket 8, Vasant Kunj, New Delhi 110070", popularTag: "South Delhi Hub" },
  { name: "Saket & Malviya Nagar", region: "Delhi NCR", lat: 28.5245, lng: 77.2066, address: "District Centre, Saket, New Delhi 110017" },
  { name: "Green Park & Hauz Khas", region: "Delhi NCR", lat: 28.5584, lng: 77.2023, address: "Green Park Main Market, New Delhi 110016" },
  { name: "Greater Kailash (GK)", region: "Delhi NCR", lat: 28.5482, lng: 77.2346, address: "M-Block Market, GK-1, New Delhi 110048" },
  { name: "Lajpat Nagar & Defence Colony", region: "Delhi NCR", lat: 28.5700, lng: 77.2400, address: "Central Market, Lajpat Nagar II, New Delhi 110024" },
  { name: "Connaught Place (CP)", region: "Delhi NCR", lat: 28.6315, lng: 77.2167, address: "Inner Circle, Connaught Place, New Delhi 110001", popularTag: "Central Delhi" },
  { name: "Dwarka Sector 10", region: "Delhi NCR", lat: 28.5921, lng: 77.0460, address: "Sector 10, Dwarka, New Delhi 110075" },
  { name: "Karol Bagh & Patel Nagar", region: "Delhi NCR", lat: 28.6517, lng: 77.1906, address: "Padam Singh Road, Karol Bagh, New Delhi 110005", popularTag: "Spare Parts Hub" },
  { name: "Mayapuri Auto Hub", region: "Delhi NCR", lat: 28.6317, lng: 77.1265, address: "Mayapuri Industrial Area Phase II, New Delhi 110064", popularTag: "Major Garage Cluster" },
  { name: "Cyber City & DLF Phase 2", region: "Delhi NCR", lat: 28.4950, lng: 77.0895, address: "DLF Cyber City, Gurugram, Haryana 122002", popularTag: "Gurugram Hub" },
  { name: "Sohna Road & Golf Course Ext", region: "Delhi NCR", lat: 28.4069, lng: 77.0396, address: "Sohna Road, Gurugram, Haryana 122018" },
  { name: "Noida Sector 18 & 62", region: "Delhi NCR", lat: 28.5708, lng: 77.3260, address: "Atta Market / Sector 18, Noida, UP 201301", popularTag: "Noida Auto Hub" },
  { name: "Indirapuram & Vaishali", region: "Delhi NCR", lat: 28.6415, lng: 77.3713, address: "Vaibhav Khand, Indirapuram, Ghaziabad, UP 201014" },
  { name: "Faridabad Industrial Area", region: "Delhi NCR", lat: 28.4089, lng: 77.3178, address: "Sector 15, Faridabad, Haryana 121007" },

  // Bengaluru
  { name: "Koramangala 4th & 5th Block", region: "Bengaluru", lat: 12.9352, lng: 77.6245, address: "80 Feet Road, Koramangala, Bengaluru 560034", popularTag: "South Bangalore" },
  { name: "Indiranagar 100 Feet Rd", region: "Bengaluru", lat: 12.9784, lng: 77.6408, address: "100 Feet Road, Indiranagar, Bengaluru 560038", popularTag: "East Bangalore" },
  { name: "Whitefield & ITPL", region: "Bengaluru", lat: 12.9698, lng: 77.7499, address: "ITPL Main Road, Whitefield, Bengaluru 560066" },
  { name: "HSR Layout Sector 1", region: "Bengaluru", lat: 12.9121, lng: 77.6446, address: "27th Main Road, HSR Layout, Bengaluru 560102" },
  { name: "Electronic City Phase 1", region: "Bengaluru", lat: 12.8452, lng: 77.6602, address: "Hosur Road, Electronic City, Bengaluru 560100" },

  // Mumbai & MMR
  { name: "Bandra West & Linking Rd", region: "Mumbai", lat: 19.0596, lng: 72.8295, address: "Linking Road, Bandra West, Mumbai 400050", popularTag: "Western Suburbs" },
  { name: "Andheri West & Lokhandwala", region: "Mumbai", lat: 19.1363, lng: 72.8277, address: "Lokhandwala Complex, Andheri West, Mumbai 400053" },
  { name: "Powai & Hiranandani", region: "Mumbai", lat: 19.1176, lng: 72.9060, address: "Central Avenue, Hiranandani Gardens, Powai 400076" },
  { name: "Thane West & Ghodbunder Rd", region: "Mumbai", lat: 19.2183, lng: 72.9781, address: "Ghodbunder Road, Thane West, Maharashtra 400601" },
  { name: "Vashi & Navi Mumbai", region: "Mumbai", lat: 19.0330, lng: 73.0297, address: "Sector 17, Vashi, Navi Mumbai 400703" },

  // Hyderabad
  { name: "Hitec City & Madhapur", region: "Hyderabad", lat: 17.4474, lng: 78.3762, address: "Madhapur, Hitec City, Hyderabad 500081", popularTag: "Cyberabad" },
  { name: "Gachibowli Financial District", region: "Hyderabad", lat: 17.4401, lng: 78.3489, address: "ISB Road, Gachibowli, Hyderabad 500032" },
  { name: "Banjara Hills & Jubilee Hills", region: "Hyderabad", lat: 17.4156, lng: 78.4350, address: "Road No 1, Banjara Hills, Hyderabad 500034" },

  // Pune
  { name: "Baner & Balewadi", region: "Pune", lat: 18.5590, lng: 73.7868, address: "Baner Road, Pune, Maharashtra 411045", popularTag: "Pune West" },
  { name: "Hinjewadi IT Park", region: "Pune", lat: 18.5913, lng: 73.7389, address: "Phase 1, Hinjewadi, Pune 411057" },
  { name: "Kothrud & Paud Road", region: "Pune", lat: 18.5074, lng: 73.8077, address: "Paud Road, Kothrud, Pune 411038" },
  { name: "Viman Nagar & Kharadi", region: "Pune", lat: 18.5679, lng: 73.9143, address: "Viman Nagar Main Road, Pune 411014" },

  // Other Metros
  { name: "Sector 17, Chandigarh", region: "Other Metros", lat: 30.7398, lng: 76.7827, address: "Sector 17 City Centre, Chandigarh 160017", popularTag: "Tri-City Hub" },
  { name: "Malviya Nagar, Jaipur", region: "Other Metros", lat: 26.8530, lng: 75.8050, address: "Calgiri Marg, Malviya Nagar, Jaipur 302017", popularTag: "Jaipur Hub" },
  { name: "Anna Nagar, Chennai", region: "Other Metros", lat: 13.0850, lng: 80.2101, address: "2nd Avenue, Anna Nagar, Chennai 600040", popularTag: "Chennai Hub" },
  { name: "SG Highway, Ahmedabad", region: "Other Metros", lat: 23.0525, lng: 72.5204, address: "SG Highway Auto Corridor, Ahmedabad 380054", popularTag: "Ahmedabad Hub" },
  { name: "Park Street, Kolkata", region: "Other Metros", lat: 22.5535, lng: 88.3518, address: "Park Street, Central Kolkata 700016", popularTag: "Kolkata Hub" },
];

export const LocationPickerModal: React.FC = () => {
  const {
    isModalOpen,
    closeModal,
    userLocation,
    setUserLocationManual,
    detectUserLocation,
    searchLocationManual,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [manualHouse, setManualHouse] = useState("");
  const [manualStreet, setManualStreet] = useState("");
  const [manualPincode, setManualPincode] = useState("");
  const [pinLat, setPinLat] = useState<number>(userLocation.lat);
  const [pinLng, setPinLng] = useState<number>(userLocation.lng);
  const [pinAddress, setPinAddress] = useState<string>(userLocation.address);
  const [pinArea, setPinArea] = useState<string>(userLocation.areaName);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const isOpen = isModalOpen?.locationPicker;

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPinLat(userLocation.lat);
      setPinLng(userLocation.lng);
      setPinAddress(userLocation.address);
      setPinArea(userLocation.areaName);
    }
  }, [isOpen, userLocation]);

  // Initialize interactive Leaflet map inside modal
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [pinLat, pinLng],
          zoom: 14,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          maxZoom: 19,
        }).addTo(map);

        const customIcon = L.divIcon({
          className: "custom-pin",
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: grab;">
              <div style="width: 38px; height: 38px; border-radius: 9999px; background: #0d631b; border: 3px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
                <span class="material-symbols-outlined" style="font-size: 20px;">location_on</span>
              </div>
              <div style="width: 10px; height: 4px; border-radius: 9999px; background: rgba(0,0,0,0.4); margin-top: 2px;"></div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
        });

        const marker = L.marker([pinLat, pinLng], {
          icon: customIcon,
          draggable: true,
        }).addTo(map);

        marker.on("dragend", async () => {
          const pos = marker.getLatLng();
          handleUpdateCoordinates(pos.lat, pos.lng);
        });

        map.on("click", (e: L.LeafletMouseEvent) => {
          marker.setLatLng(e.latlng);
          handleUpdateCoordinates(e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } else {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.setView([pinLat, pinLng], 14);
        if (markerRef.current) {
          markerRef.current.setLatLng([pinLat, pinLng]);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, pinLat, pinLng]);

  // Reverse geocode when pin moves
  const handleUpdateCoordinates = async (lat: number, lng: number) => {
    setPinLat(lat);
    setPinLng(lng);
    setIsReverseGeocoding(true);

    try {
      const res = await fetch("/api/places/reverse-geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.areaName) {
          setPinArea(data.areaName);
          setPinAddress(data.address || `${data.areaName}, India`);
        }
      }
    } catch {
      setPinArea(`GPS (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`);
      setPinAddress(`Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  if (!isOpen) return null;

  const handleLiveGPSClick = async () => {
    showToast("📍 Querying high-accuracy device GPS satellite...");
    await detectUserLocation({ forceFresh: true });
    closeModal("locationPicker");
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const ok = await searchLocationManual(searchQuery);
    setIsSearching(false);
    if (ok) {
      closeModal("locationPicker");
    }
  };

  const handleSelectHub = async (hub: MetroHub) => {
    await setUserLocationManual(hub.lat, hub.lng, hub.name, hub.address);
    closeModal("locationPicker");
  };

  const handleConfirmPinLocation = async () => {
    const fullAddress = [
      manualHouse.trim(),
      manualStreet.trim(),
      pinAddress || pinArea,
      manualPincode.trim() ? `PIN: ${manualPincode.trim()}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    await setUserLocationManual(pinLat, pinLng, pinArea, fullAddress || pinAddress);
    closeModal("locationPicker");
  };

  const regions = ["All", "Delhi NCR", "Bengaluru", "Mumbai", "Hyderabad", "Pune", "Other Metros"];

  const filteredHubs = METRO_HUBS.filter((h) => {
    const matchesRegion = selectedRegion === "All" || h.region === selectedRegion;
    const matchesSearch =
      !searchQuery.trim() ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white text-[#1b1c17] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e1e3db] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e1e3db] flex items-center justify-between bg-[#f8f7f2]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0d631b]/10 text-[#0d631b] flex items-center justify-center border border-[#0d631b]/20 font-bold">
              <span className="material-symbols-outlined text-[20px]">my_location</span>
            </div>
            <div>
              <h2 className="text-[16px] font-extrabold text-[#1b1c17] tracking-tight">
                Select Your Service Location
              </h2>
              <p className="text-[11px] text-[#71796d] font-medium">
                Accurate GPS matches you with nearest certified garages & rapid doorstep valets
              </p>
            </div>
          </div>
          <button
            onClick={() => closeModal("locationPicker")}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#71796d] transition-colors"
            title="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Current Active Location Card & 1-Tap Live GPS Button */}
          <div className="bg-[#eef8ed] border border-[#0d631b]/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#0d631b] text-[22px] mt-0.5 animate-pulse">
                location_on
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d631b] bg-[#0d631b]/15 px-2 py-0.5 rounded-full">
                    Current Active Pin
                  </span>
                  {userLocation.isLocating && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                      Acquiring GPS...
                    </span>
                  )}
                </div>
                <div className="text-[13px] font-extrabold text-[#1b1c17] mt-0.5">
                  {userLocation.areaName}
                </div>
                <div className="text-[11px] text-[#40493d] line-clamp-1">
                  {userLocation.address}
                </div>
              </div>
            </div>

            <button
              onClick={handleLiveGPSClick}
              disabled={userLocation.isLocating}
              className="flex items-center justify-center gap-1.5 bg-[#0d631b] text-white px-3.5 py-2 rounded-xl text-[12px] font-bold hover:bg-[#0a4e15] active:scale-95 transition-all shadow-sm shrink-0 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">
                {userLocation.isLocating ? "sync" : "satellite_alt"}
              </span>
              <span>{userLocation.isLocating ? "Detecting..." : "Live GPS Re-Detect"}</span>
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colony, sector, city, landmark or pincode (e.g. Indiranagar, 110070)..."
              className="w-full bg-[#f4f3ec] border border-[#d8d8ce] rounded-xl pl-10 pr-24 py-2.5 text-[13px] text-[#1b1c17] placeholder:text-[#888e82] focus:outline-none focus:ring-2 focus:ring-[#0d631b] focus:border-[#0d631b] transition-all"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#71796d]">
              search
            </span>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#1b1c17] text-white px-3 rounded-lg text-[11px] font-bold hover:bg-[#2e3128] transition-colors disabled:opacity-40"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Interactive Map with Pin Dropper */}
          <div className="border border-[#e1e3db] rounded-xl overflow-hidden shadow-inner bg-[#f4f3ec]">
            <div className="bg-[#f0eee6] px-3.5 py-2 border-b border-[#e1e3db] flex items-center justify-between text-[11px] text-[#40493d]">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-[16px] text-[#0d631b]">pin_drop</span>
                <span>Tap or Drag Pin to Fine-Tune Doorstep Location</span>
              </div>
              {isReverseGeocoding ? (
                <span className="text-[10px] font-bold text-[#0d631b] animate-pulse">Resolving address...</span>
              ) : (
                <span className="text-[10px] text-[#71796d]">({pinLat.toFixed(3)}°, {pinLng.toFixed(3)}°)</span>
              )}
            </div>

            <div ref={mapContainerRef} className="h-44 sm:h-48 w-full z-10" />

            <div className="p-3 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-[#e1e3db]">
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-extrabold text-[#1b1c17] truncate">
                  {pinArea}
                </div>
                <div className="text-[11px] text-[#71796d] truncate">
                  {pinAddress}
                </div>
              </div>
              <button
                onClick={handleConfirmPinLocation}
                className="bg-[#0d631b] text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-lg hover:bg-[#0a4e15] transition-all shrink-0 active:scale-95 shadow-sm"
              >
                Set This Pin Point
              </button>
            </div>
          </div>

          {/* Doorstep Address Form (Optional details) */}
          <div className="bg-[#faf9f4] border border-[#e1e3db] rounded-xl p-3.5 space-y-2.5">
            <div className="text-[12px] font-extrabold text-[#1b1c17] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#0d631b]">home</span>
              <span>Exact Doorstep Details for Valet Driver (Optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="House / Flat No / Tower"
                value={manualHouse}
                onChange={(e) => setManualHouse(e.target.value)}
                className="bg-white border border-[#d8d8ce] rounded-lg px-2.5 py-1.5 text-[12px] text-[#1b1c17] placeholder:text-[#888e82] focus:outline-none focus:ring-1 focus:ring-[#0d631b]"
              />
              <input
                type="text"
                placeholder="Street / Society / Landmark"
                value={manualStreet}
                onChange={(e) => setManualStreet(e.target.value)}
                className="bg-white border border-[#d8d8ce] rounded-lg px-2.5 py-1.5 text-[12px] text-[#1b1c17] placeholder:text-[#888e82] focus:outline-none focus:ring-1 focus:ring-[#0d631b]"
              />
              <input
                type="text"
                placeholder="6-Digit Pincode (e.g. 110070)"
                value={manualPincode}
                onChange={(e) => setManualPincode(e.target.value)}
                className="bg-white border border-[#d8d8ce] rounded-lg px-2.5 py-1.5 text-[12px] text-[#1b1c17] placeholder:text-[#888e82] focus:outline-none focus:ring-1 focus:ring-[#0d631b]"
              />
            </div>
          </div>

          {/* Quick Major Automotive Hubs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-extrabold text-[#1b1c17] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#0d631b]">hub</span>
                <span>Select from Popular Metro & Automotive Hubs</span>
              </div>
              <span className="text-[11px] text-[#71796d]">
                {filteredHubs.length} hubs available
              </span>
            </div>

            {/* Region Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                    selectedRegion === reg
                      ? "bg-[#1b1c17] text-white"
                      : "bg-[#f0eee6] text-[#40493d] hover:bg-[#e4e2d8]"
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            {/* Hubs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredHubs.map((hub) => (
                <button
                  key={hub.name}
                  onClick={() => handleSelectHub(hub)}
                  className="text-left p-2.5 rounded-xl border border-[#e1e3db] bg-white hover:border-[#0d631b] hover:bg-[#f2faf0] transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="font-extrabold text-[12px] text-[#1b1c17] group-hover:text-[#0d631b] transition-colors">
                      {hub.name}
                    </div>
                    {hub.popularTag && (
                      <span className="text-[9px] font-bold text-[#0d631b] bg-[#0d631b]/10 px-1.5 py-0.5 rounded">
                        {hub.popularTag}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#71796d] line-clamp-1 mt-1">
                    {hub.address}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e1e3db] bg-[#f8f7f2] flex items-center justify-between">
          <div className="text-[11px] text-[#71796d] hidden sm:block">
            📍 Selecting a location updates nearby garages with real live distance & ETA.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => closeModal("locationPicker")}
              className="px-4 py-2 rounded-xl text-[12px] font-bold text-[#40493d] hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPinLocation}
              className="bg-[#0d631b] text-white px-5 py-2 rounded-xl text-[12px] font-extrabold hover:bg-[#0a4e15] shadow-md transition-all active:scale-95"
            >
              Confirm & Save Location
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
