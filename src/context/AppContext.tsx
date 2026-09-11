import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ScreenView,
  UserRole,
  Vehicle,
  ServiceCategory,
  WorkshopGarage,
  CartItem,
  BayLogStep,
  WorkEstimateItem,
  LiveBayUpdate,
  ApprovalRequest,
  InspectionCheckItem,
  FeedbackRating,
  ModalStates,
  Coupon,
  AppliedCoupon,
  BookingStatus,
  AmbulanceType,
  AmbulanceDispatchState,
  GeofenceConfig,
  GeofenceEvent,
  GeofenceEventType,
  TrackedVehicleState,
} from "../types";
import {
  defaultVehicle,
  serviceCategories,
  servicePackages,
  mockGarages,
  mockBayLogSteps,
  mockEstimates,
  mockLiveBayUpdates,
  mockInspectionChecklist,
  mockCoupons,
} from "../data/mockData";
import { resolveVehicleImageUrl } from "../lib/carImageResolver";
import { geolocationService } from "../services/geolocation";
import { db, auth, testFirebaseConnection } from "../lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

export interface CustomerProfile {
  name: string;
  phone: string;
  plate: string;
  isLoggedIn: boolean;
}

export interface UserLocationState {
  lat: number;
  lng: number;
  areaName: string;
  address: string;
  isLocating: boolean;
  error: string | null;
  permissionGranted: boolean;
}

interface AppContextType {
  currentScreen: ScreenView;
  setCurrentScreen: (screen: ScreenView) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  vehicle: Vehicle;
  setVehicle: (vehicle: Vehicle) => void;
  setVehiclePlate: (plate: string) => void;
  customerProfile: CustomerProfile;
  loginCustomer: (name: string, phone: string, plate: string, carDetails?: Partial<Vehicle>) => void;
  logoutCustomer: () => void;
  selectedCategory: ServiceCategory;
  setSelectedCategory: (category: ServiceCategory) => void;
  selectedPackageId: string;
  setSelectedPackageId: (id: string) => void;
  selectedGarage: WorkshopGarage;
  setSelectedGarage: (garage: WorkshopGarage) => void;
  userLocation: UserLocationState;
  nearbyWorkshops: WorkshopGarage[];
  isSearchingWorkshops: boolean;
  googleMapsApiKey: string;
  detectUserLocation: (opts?: { silent?: boolean; forceFresh?: boolean }) => Promise<void>;
  setUserLocationManual: (lat: number, lng: number, areaName: string, address?: string) => Promise<void>;
  searchLocationManual: (query: string) => Promise<boolean>;
  fetchNearbyWorkshops: (lat: number, lng: number, radiusMeters?: number, forceFresh?: boolean) => Promise<void>;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  cartTotal: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  couponDiscount: number;
  finalPayableTotal: number;
  approvalRequest: ApprovalRequest;
  approveWork: (id: string) => void;
  skipWork: (id: string) => void;
  bayLogSteps: BayLogStep[];
  addBayLogStep: (step: Omit<BayLogStep, "id">) => void;
  estimates: WorkEstimateItem[];
  addEstimate: (item: Omit<WorkEstimateItem, "id">) => void;
  liveUpdates: LiveBayUpdate[];
  addLiveUpdate: (update: Omit<LiveBayUpdate, "id">) => void;
  inspectionItems: InspectionCheckItem[];
  toggleInspectionItem: (id: string) => void;
  feedback: FeedbackRating;
  setFeedbackStar: (stars: number) => void;
  toggleFeedbackChip: (chip: string) => void;
  setFeedbackComment: (comment: string) => void;
  submitFeedback: () => void;
  isWorkshopOnline: boolean;
  setIsWorkshopOnline: (online: boolean) => void;
  bookingInfo: {
    date: string;
    timeSlot: string;
    mode: "pickup" | "workshop";
    address: string;
    totalAmount: number;
    bookingId: string;
    isPaid: boolean;
    status: BookingStatus;
    workshopId: string;
    workshopName: string;
    acceptBy: number;
    timeline: Array<{
      eventId: string;
      status: string;
      title: string;
      description: string;
      time: string;
    }>;
  };
  createBookingAndDispatch: (mode?: "pickup" | "workshop") => Promise<string>;
  acceptBookingByWorkshop: (bookingId?: string) => Promise<void>;
  rejectBookingByWorkshop: (bookingId?: string) => Promise<void>;
  advanceBookingStage: (nextStatus: BookingStatus) => Promise<void>;
  requestBayApproval: (item: {
    componentName: string;
    partsInfo: string;
    price: number;
    recommendedBy: string;
  }) => Promise<void>;
  updateBookingInfo: (partial: Partial<AppContextType["bookingInfo"]>) => void;
  setPaymentCompleted: (paid: boolean) => void;
  isModalOpen: ModalStates;
  modals: ModalStates;
  ambulanceDispatch: boolean;
  ambulanceState: AmbulanceDispatchState | null;
  dispatchAmbulance: (type: AmbulanceType, notes?: string) => Promise<AmbulanceDispatchState>;
  cancelAmbulance: () => void;
  geofenceConfig: GeofenceConfig;
  updateGeofenceConfig: (partial: Partial<GeofenceConfig>) => void;
  geofenceEvents: GeofenceEvent[];
  trackedVehicle: TrackedVehicleState;
  latestGeofenceAlert: GeofenceEvent | null;
  checkGeofenceTransition: (
    lat: number,
    lng: number,
    speedKm?: number,
    plate?: string,
    name?: string,
    areaDesc?: string
  ) => { isInside: boolean; event: GeofenceEventType | null; distanceMeters: number };
  triggerGeofenceSimulation: (scenario: "enter_workshop" | "exit_test_drive" | "exit_delivery" | "reset_home") => Promise<void>;
  dismissGeofenceAlert: () => void;
  clearGeofenceEvents: () => void;
  openModal: (modal: keyof ModalStates) => void;
  closeModal: (modal: keyof ModalStates) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  currentUser: User | null;
}

const initialModalStates: ModalStates = {
  aiDiagnose: false,
  inspectionChecklist: false,
  addEstimate: false,
  liveChat: false,
  taxInvoice: false,
  screenDrawer: false,
  razorpay: false,
  liveMap: false,
  whatsapp: false,
  vahan: false,
  auth: false,
  customerSupport: false,
  reminders: false,
  inventory: false,
  analytics: false,
  customerApproval: false,
  ambulanceDispatch: false,
  obdScanner: false,
  echallan: false,
  whatsappHub: false,
  smsGateway: false,
  liveBayStream: false,
  geofencing: false,
  locationPicker: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(() => {
    try {
      const saved = localStorage.getItem("apni_customer_session");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: "Vikram Malhotra",
      phone: "9876543210",
      plate: "UP 16 DJ 8008",
      isLoggedIn: false,
    };
  });

  const [currentScreen, setCurrentScreen] = useState<ScreenView>(() => {
    try {
      const saved = localStorage.getItem("apni_customer_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isLoggedIn) return "customer_home";
      }
    } catch {}
    return "welcome";
  });
  const [userRole, setUserRole] = useState<UserRole>("customer");
  const [vehicle, setVehicleState] = useState<Vehicle>(() => {
    try {
      const saved = localStorage.getItem("apni_customer_vehicle");
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultVehicle;
  });

  const setVehicle = (updatedVeh: Vehicle | ((prev: Vehicle) => Vehicle)) => {
    setVehicleState((prev) => {
      const next = typeof updatedVeh === "function" ? updatedVeh(prev) : updatedVeh;
      try {
        localStorage.setItem("apni_customer_vehicle", JSON.stringify(next));
      } catch {}
      return next;
    });
  };
  const [selectedCategory, setSelectedCategoryState] = useState<ServiceCategory>("periodic");
  const [selectedPackageId, setSelectedPackageId] = useState<string>("periodic_standard");

  const setSelectedCategory = (category: ServiceCategory) => {
    setSelectedCategoryState(category);
    const catMeta = serviceCategories.find((c) => c.id === category);
    if (catMeta) {
      setSelectedPackageId(catMeta.recommendedPackageId);
    } else {
      const firstInCat = servicePackages.find((p) => p.categoryId === category);
      if (firstInCat) setSelectedPackageId(firstInCat.id);
    }
  };

  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>(
    (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || ""
  );

  const [userLocation, setUserLocation] = useState<UserLocationState>(() => {
    try {
      const saved = localStorage.getItem("apni_customer_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
          return {
            lat: parsed.lat,
            lng: parsed.lng,
            areaName: parsed.areaName || "Detected Location",
            address: parsed.address || `${parsed.areaName || "Detected Location"}, India`,
            isLocating: false,
            error: null,
            permissionGranted: Boolean(parsed.permissionGranted),
          };
        }
      }
    } catch {}
    return {
      lat: 28.5244,
      lng: 77.1565,
      areaName: "Vasant Kunj, South Delhi",
      address: "Sector B, Vasant Kunj, New Delhi, Delhi 110070",
      isLocating: false,
      error: null,
      permissionGranted: false,
    };
  });

  const [nearbyWorkshops, setNearbyWorkshops] = useState<WorkshopGarage[]>(mockGarages);
  const [isSearchingWorkshops, setIsSearchingWorkshops] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/maps/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.apiKey) {
          setGoogleMapsApiKey(data.apiKey);
        }
      })
      .catch(() => {});

    // Proactively check if geolocation permission is already granted; if so, detect instantly in background
    if (typeof navigator !== "undefined" && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as any })
        .then((perm) => {
          if (perm.state === "granted") {
            detectUserLocation({ silent: true });
          }
        })
        .catch(() => {});
    }

    // Query live real workshops on initial load for current coordinates
    fetchNearbyWorkshops(userLocation.lat, userLocation.lng, 8000);
  }, []);

  // Geofencing state and engine
  const [geofenceConfig, setGeofenceConfig] = useState<GeofenceConfig>(() => {
    try {
      const saved = localStorage.getItem("apni_geofence_config");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      enabled: true,
      radiusMeters: 1000, // 1.0 km radius by default
      workshopLat: 28.5355,
      workshopLng: 77.2638,
      workshopName: "Sharma Auto Care",
      workshopAddress: "Plot 14, Okhla Industrial Area Phase 3, New Delhi 110020",
      notifyOnEntry: true,
      notifyOnExit: true,
      soundAlert: true,
      smsAlert: true,
      whatsappAlert: true,
    };
  });

  const [geofenceEvents, setGeofenceEvents] = useState<GeofenceEvent[]>(() => {
    try {
      const saved = localStorage.getItem("apni_geofence_events");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "geo-evt-001",
        vehiclePlate: "DL 01 AB 4092",
        vehicleName: "Mahindra Thar LX 4x4",
        eventType: "ENTER",
        timestamp: "10:18 AM",
        distanceMeters: 420,
        radiusMeters: 1000,
        locationArea: "Okhla Phase 3 Workshop Gate",
        lat: 28.5372,
        lng: 77.2619,
        speedKm: 28,
        message: "Vehicle ENTERED Sharma Auto Care 1.0 km Geofence perimeter. Driver Rahul Sharma approaching Bay 03.",
        actionTriggered: "Bay Ingestion Alert Dispatched to Workshop Tech Lead",
        driverName: "Rahul Sharma (Pickup Partner)",
      },
      {
        id: "geo-evt-002",
        vehiclePlate: "UP 16 DJ 8008",
        vehicleName: "Hyundai Creta SX(O)",
        eventType: "EXIT",
        timestamp: "09:30 AM",
        distanceMeters: 1350,
        radiusMeters: 1000,
        locationArea: "Ring Road Flyover Exit",
        lat: 28.5441,
        lng: 77.2512,
        speedKm: 42,
        message: "Vehicle EXITED Sharma Auto Care perimeter. Post-service 5 km Quality Road Test in progress.",
        actionTriggered: "Dynamic QC Telemetry & OBD Road Scan Enabled",
        driverName: "Anil Kumar (QC Lead)",
      },
    ];
  });

  const [trackedVehicle, setTrackedVehicle] = useState<TrackedVehicleState>({
    lat: 28.5480,
    lng: 77.2400,
    speedKm: 34,
    heading: 135,
    distanceToWorkshopMeters: 1480,
    isInsideGeofence: false,
    status: "en_route_to_workshop",
  });

  const [latestGeofenceAlert, setLatestGeofenceAlert] = useState<GeofenceEvent | null>(null);

  const updateGeofenceConfig = (partial: Partial<GeofenceConfig>) => {
    setGeofenceConfig((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem("apni_geofence_config", JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast("Geofence perimeter configuration updated!");
  };

  const playGeofenceChime = (type: "ENTER" | "EXIT") => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "ENTER") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.25); // G5
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.45);
      } else {
        osc.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
        osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.12); // D5
        osc.frequency.exponentialRampToValueAtTime(440.0, ctx.currentTime + 0.25); // A4
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.45);
      }

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([100, 60, 100]);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  const checkGeofenceTransition = (
    lat: number,
    lng: number,
    speedKm: number = 32,
    plate?: string,
    name?: string,
    areaDesc?: string
  ): { isInside: boolean; event: GeofenceEventType | null; distanceMeters: number } => {
    const targetPlate = plate || vehicle.plate || "DL 01 AB 4092";
    const targetName = name || vehicle.name || "Mahindra Thar LX";
    const distMeters = Math.round(
      calculateHaversineDistanceKm(lat, lng, geofenceConfig.workshopLat, geofenceConfig.workshopLng) * 1000
    );

    const isInside = distMeters <= geofenceConfig.radiusMeters;
    const wasInside = trackedVehicle.isInsideGeofence;
    let transitionEvent: GeofenceEventType | null = null;

    if (!wasInside && isInside) {
      transitionEvent = "ENTER";
    } else if (wasInside && !isInside) {
      transitionEvent = "EXIT";
    }

    if (transitionEvent && geofenceConfig.enabled) {
      const isEntry = transitionEvent === "ENTER";
      const shouldNotify = isEntry ? geofenceConfig.notifyOnEntry : geofenceConfig.notifyOnExit;

      if (shouldNotify) {
        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const newEvent: GeofenceEvent = {
          id: `geo-evt-${Date.now()}`,
          vehiclePlate: targetPlate,
          vehicleName: targetName,
          eventType: transitionEvent,
          timestamp,
          distanceMeters: distMeters,
          radiusMeters: geofenceConfig.radiusMeters,
          locationArea: areaDesc || (isEntry ? "Workshop Entry Perimeter" : "Workshop Exit Boundary"),
          lat,
          lng,
          speedKm,
          message: isEntry
            ? `Vehicle ${targetPlate} ENTERED ${geofenceConfig.workshopName} (${(distMeters / 1000).toFixed(2)} km away). Bay allocation active.`
            : `Vehicle ${targetPlate} EXITED ${geofenceConfig.workshopName} perimeter (${(distMeters / 1000).toFixed(2)} km away). Out for test/delivery.`,
          actionTriggered: isEntry
            ? "Automated Bay Ingestion & Mechanic Camera Feed Activated"
            : "Quality Road Test / Delivery Notification Dispatched",
          driverName: isEntry ? "Rahul Sharma (Pickup Partner)" : "Anil Kumar (Test Technician)",
        };

        setLatestGeofenceAlert(newEvent);
        setGeofenceEvents((prev) => {
          const updated = [newEvent, ...prev.slice(0, 19)];
          try {
            localStorage.setItem("apni_geofence_events", JSON.stringify(updated));
          } catch {}
          return updated;
        });

        if (geofenceConfig.soundAlert) {
          playGeofenceChime(transitionEvent);
        }

        const toastMsg = isEntry
          ? `🟢 GEOFENCE ENTER: ${targetName} (${targetPlate}) entered workshop radius (${distMeters}m)!`
          : `🚗 GEOFENCE EXIT: ${targetName} (${targetPlate}) exited workshop radius (${distMeters}m)!`;
        showToast(toastMsg);
      }
    }

    setTrackedVehicle({
      lat,
      lng,
      speedKm,
      heading: isInside ? 0 : 135,
      distanceToWorkshopMeters: distMeters,
      isInsideGeofence: isInside,
      lastTransitionTime: transitionEvent ? new Date().toLocaleTimeString() : trackedVehicle.lastTransitionTime,
      status: isInside ? "inside_workshop" : distMeters > 3000 ? "at_home" : "en_route_to_workshop",
    });

    return { isInside, event: transitionEvent, distanceMeters: distMeters };
  };

  const triggerGeofenceSimulation = async (
    scenario: "enter_workshop" | "exit_test_drive" | "exit_delivery" | "reset_home"
  ) => {
    if (scenario === "enter_workshop") {
      // Move vehicle from outside (1.6km) to inside workshop (150m)
      setTrackedVehicle((prev) => ({
        ...prev,
        isInsideGeofence: false,
      }));
      setTimeout(() => {
        checkGeofenceTransition(
          geofenceConfig.workshopLat + 0.0012,
          geofenceConfig.workshopLng + 0.0009,
          18,
          vehicle.plate,
          vehicle.name,
          "Bay 03 Entry Gate (Inside 1.0 km Perimeter)"
        );
      }, 300);
    } else if (scenario === "exit_test_drive") {
      // Move vehicle from inside to outside on test drive
      setTrackedVehicle((prev) => ({
        ...prev,
        isInsideGeofence: true,
      }));
      setTimeout(() => {
        checkGeofenceTransition(
          geofenceConfig.workshopLat + 0.015,
          geofenceConfig.workshopLng + 0.018,
          48,
          vehicle.plate,
          vehicle.name,
          "Outer Ring Road Elevated Corridor (Outside Perimeter)"
        );
      }, 300);
    } else if (scenario === "exit_delivery") {
      // Move vehicle from inside to outside towards customer doorstep
      setTrackedVehicle((prev) => ({
        ...prev,
        isInsideGeofence: true,
      }));
      setTimeout(() => {
        checkGeofenceTransition(
          userLocation.lat + 0.005,
          userLocation.lng + 0.004,
          36,
          vehicle.plate,
          vehicle.name,
          "Green Park Main Sector Road (Out for Doorstep Return)"
        );
      }, 300);
    } else if (scenario === "reset_home") {
      setTrackedVehicle({
        lat: userLocation.lat,
        lng: userLocation.lng,
        speedKm: 0,
        heading: 0,
        distanceToWorkshopMeters: 3800,
        isInsideGeofence: false,
        status: "at_home",
      });
      showToast("Vehicle GPS reset to Customer Residence (Outside Geofence).");
    }
  };

  const dismissGeofenceAlert = () => {
    setLatestGeofenceAlert(null);
  };

  const clearGeofenceEvents = () => {
    setGeofenceEvents([]);
    try {
      localStorage.removeItem("apni_geofence_events");
    } catch {}
    showToast("Geofence event log cleared.");
  };
  const calculateHaversineDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  // Helper to re-sort workshops by distance relative to a user coordinate
  const sortAndSelectWorkshops = (
    rawWorkshops: WorkshopGarage[],
    userLat: number,
    userLng: number
  ): WorkshopGarage[] => {
    const updated = rawWorkshops.map((w) => {
      const gLat = w.lat ?? userLat;
      const gLng = w.lng ?? userLng;
      const dist = calculateHaversineDistanceKm(userLat, userLng, gLat, gLng);
      return {
        ...w,
        distanceKm: dist,
        etaMins: Math.max(8, Math.round(dist * 4.2 + 6)),
        isClosest: false,
      };
    });

    updated.sort((a, b) => a.distanceKm - b.distanceKm);
    if (updated.length > 0) {
      updated[0].isClosest = true;
      setSelectedGarage(updated[0]);
    }
    setNearbyWorkshops(updated);
    return updated;
  };

  const fetchNearbyWorkshops = async (lat: number, lng: number, radiusMeters = 8000, forceFresh = false) => {
    setIsSearchingWorkshops(true);
    try {
      const result = await geolocationService.getNearbyWorkshops(lat, lng, radiusMeters, forceFresh);
      if (result.workshops && result.workshops.length > 0) {
        sortAndSelectWorkshops(result.workshops, lat, lng);
      } else {
        sortAndSelectWorkshops(nearbyWorkshops, lat, lng);
      }
    } catch (err) {
      console.error("Failed to fetch nearby workshops:", err);
      // Recalculate distance for existing workshops
      sortAndSelectWorkshops(nearbyWorkshops, lat, lng);
    } finally {
      setIsSearchingWorkshops(false);
    }
  };

  const setUserLocationManual = async (
    lat: number,
    lng: number,
    areaName: string,
    address?: string
  ) => {
    const nextState: UserLocationState = {
      lat,
      lng,
      areaName,
      address: address || `${areaName}, India`,
      isLocating: false,
      error: null,
      permissionGranted: true,
    };
    setUserLocation(nextState);
    try {
      localStorage.setItem("apni_customer_location", JSON.stringify(nextState));
    } catch {}

    // Instant local resort so distances update in 0ms
    sortAndSelectWorkshops(nearbyWorkshops, lat, lng);
    showToast(`📍 Location set to ${areaName}. Nearest workshops updated!`);
    await fetchNearbyWorkshops(lat, lng, 8000);
  };

  const searchLocationManual = async (query: string): Promise<boolean> => {
    if (!query.trim()) return false;
    setUserLocation((prev) => ({ ...prev, isLocating: true, error: null }));
    showToast(`🔍 Searching location: "${query}"...`);

    try {
      const res = await fetch("/api/places/search-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.success && typeof data.latitude === "number" && typeof data.longitude === "number") {
        const nextState: UserLocationState = {
          lat: data.latitude,
          lng: data.longitude,
          areaName: data.areaName,
          address: data.address,
          isLocating: false,
          error: null,
          permissionGranted: true,
        };
        setUserLocation(nextState);
        try {
          localStorage.setItem("apni_customer_location", JSON.stringify(nextState));
        } catch {}

        sortAndSelectWorkshops(nearbyWorkshops, data.latitude, data.longitude);
        showToast(`📍 Located: ${data.areaName}! Updating nearest workshops...`);
        await fetchNearbyWorkshops(data.latitude, data.longitude, 8000);
        return true;
      }
    } catch (err) {
      console.error("Search address error:", err);
    } finally {
      setUserLocation((prev) => ({ ...prev, isLocating: false }));
    }

    showToast(`Could not find "${query}". Please check spelling or select from quick hubs.`);
    return false;
  };

  const detectUserLocation = async (opts?: { silent?: boolean; forceFresh?: boolean }) => {
    const isForceFresh = opts?.forceFresh !== undefined ? opts.forceFresh : true;
    if (!opts?.silent) {
      setUserLocation((prev) => ({ ...prev, isLocating: true, error: null }));
      showToast("📍 Accessing high-accuracy device GPS satellite...");
    }

    try {
      if (isForceFresh) {
        geolocationService.clearCache();
      }

      // High-Accuracy GPS acquisition with 2-stage progressive fallback
      const geoResult = await geolocationService.getCurrentPosition({
        enableHighAccuracy: true, // High-Accuracy satellite & WiFi mode
        timeout: 9000,
        maximumAge: isForceFresh ? 0 : 30000,
        forceFresh: isForceFresh,
        ttlMs: 60000, // 60s short TTL cache
      });

      const lat = geoResult.coords.latitude;
      const lng = geoResult.coords.longitude;

      // 1. Immediately re-sort workshops with 0ms delay so user sees instant results
      sortAndSelectWorkshops(nearbyWorkshops, lat, lng);

      // 2. Set coordinates immediately in userLocation state so UI updates instantly (<16ms)
      const initialArea = geoResult.areaName || `GPS (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`;
      setUserLocation((prev) => {
        const next: UserLocationState = {
          lat,
          lng,
          areaName: initialArea,
          address: geoResult.address || `GPS Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          isLocating: false,
          error: null,
          permissionGranted: true,
        };
        try {
          localStorage.setItem("apni_customer_location", JSON.stringify(next));
        } catch {}
        return next;
      });

      if (!opts?.silent) {
        showToast(`📍 High-precision GPS acquired! (${lat.toFixed(3)}°, ${lng.toFixed(3)}°) Resolving address...`);
      }

      // 3. Reverse geocode via cached service (in background)
      geolocationService
        .reverseGeocode(lat, lng, isForceFresh)
        .then((geoData) => {
          if (geoData && geoData.areaName) {
            setUserLocation((prev) => {
              const updated: UserLocationState = {
                ...prev,
                areaName: geoData.areaName,
                address: geoData.address || `${geoData.areaName}, India`,
                isLocating: false,
              };
              try {
                localStorage.setItem("apni_customer_location", JSON.stringify(updated));
              } catch {}
              return updated;
            });
            if (!opts?.silent) {
              showToast(`📍 Located at ${geoData.areaName}! Nearest workshops updated.`);
            }
          }
        })
        .catch((e) => console.warn("Reverse geocode warning:", e));

      // 4. Fetch live fresh workshops via cached map data layer
      await fetchNearbyWorkshops(lat, lng, 8000, Boolean(isForceFresh));
    } catch (err: any) {
      console.warn("Geolocation detection error:", err);
      setUserLocation((prev) => ({
        ...prev,
        isLocating: false,
        error: err?.message || "Location error",
      }));
      if (!opts?.silent) {
        if (err?.code === 1) {
          showToast("⚠️ Location permission denied. Opening Location Picker to select your area.");
          openModal("locationPicker");
        } else if (err?.code === 3) {
          showToast("⚠️ GPS timed out. Please choose your area from the list or tap the map.");
          openModal("locationPicker");
        } else {
          showToast("⚠️ Could not acquire GPS. Opening Location Picker.");
          openModal("locationPicker");
        }
      }
    }
  };

  const [selectedGarage, setSelectedGarage] = useState<WorkshopGarage>(mockGarages[0]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    return [
      {
        id: "periodic_standard",
        packageId: "periodic_standard",
        title: "Standard Periodic Service",
        categoryId: "periodic",
        categoryTitle: "Periodic Service",
        price: 3999,
        originalPrice: 4999,
        duration: "3-4 hours duration",
        inclusions: [
          "Engine oil replacement (OEM Synthetic Grade 5W-40)",
          "Engine Air & Oil Filters replacement",
          "40-Point Full Vehicle computerized health scan",
          "Front & Rear brake pads cleaning & inspection",
        ],
        oemParts: ["Castrol EDGE 5W-40 Synthetic", "Mahindra Genuine Filters"],
        warranty: "60 Days / 2,000 KM Apni Warranty",
        workshopId: mockGarages[0].id,
        workshopName: mockGarages[0].name,
      },
    ];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>({
    code: "APNI15",
    title: "15% Instant Discount",
    discountAmount: 405,
    description: "15% OFF up to ₹500 on all workshop services & OEM spares.",
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPayableTotal = Math.max(0, cartTotal - couponDiscount);

  const applyCoupon = (rawCode: string): { success: boolean; message: string } => {
    const cleanCode = rawCode.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: "Please enter a coupon code." };
    }
    const found = mockCoupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (!found) {
      if (cleanCode === "SAVE10" || cleanCode === "APNI10") {
        const discount = Math.min(300, Math.round((cartTotal * 10) / 100));
        setAppliedCoupon({
          code: cleanCode,
          title: "10% Special Promo",
          discountAmount: discount,
          description: "10% promo discount applied!",
        });
        showToast(`Coupon ${cleanCode} applied! Saved ₹${discount}`);
        return { success: true, message: `Coupon ${cleanCode} applied! Saved ₹${discount}` };
      }
      return { success: false, message: `Invalid coupon "${cleanCode}". Try APNI15 or MONSOON500.` };
    }

    if (found.minOrderValue && cartTotal < found.minOrderValue) {
      return {
        success: false,
        message: `Min order value of ₹${found.minOrderValue.toLocaleString()} required for ${found.code}.`,
      };
    }

    let discount = 0;
    if (found.discountType === "percent") {
      const calc = Math.round((cartTotal * found.discountValue) / 100);
      discount = found.maxDiscount ? Math.min(found.maxDiscount, calc) : calc;
    } else {
      discount = Math.min(cartTotal, found.discountValue);
    }

    if (discount <= 0) {
      return { success: false, message: "Cart total is 0. Add services first." };
    }

    setAppliedCoupon({
      code: found.code,
      title: found.title,
      discountAmount: discount,
      description: found.description,
    });
    showToast(`Coupon ${found.code} applied! Saved ₹${discount}`);
    return { success: true, message: `Coupon ${found.code} applied! Saved ₹${discount}` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast("Coupon removed.");
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
    showToast(`"${item.title}" added to cart for ${item.workshopName || selectedGarage.name}!`);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    showToast("Service removed from cart.");
  };

  const clearCart = () => {
    setCart([]);
  };

  const isInCart = (id: string) => {
    return cart.some((i) => i.id === id || i.packageId === id);
  };

  const [bayLogSteps, setBayLogSteps] = useState<BayLogStep[]>(mockBayLogSteps);
  const [estimates, setEstimates] = useState<WorkEstimateItem[]>(mockEstimates);
  const [liveUpdates, setLiveUpdates] = useState<LiveBayUpdate[]>(mockLiveBayUpdates);
  const [inspectionItems, setInspectionItems] = useState<InspectionCheckItem[]>(mockInspectionChecklist);
  const [isWorkshopOnline, setIsWorkshopOnline] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest>({
    id: "appr-1",
    componentName: "Front Brake Pad Replacement",
    recommendedBy: "Rajesh (Head Tech)",
    partsInfo: "Genuine OEM Mahindra Brake Kit (Front Set)",
    price: 3200,
    status: "pending",
  });

  const [feedback, setFeedback] = useState<FeedbackRating>({
    stars: 5,
    selectedChips: ["Transparent pricing", "Good behavior"],
    comment: "",
    submitted: false,
  });

  const [bookingInfo, setBookingInfo] = useState({
    date: "Today",
    timeSlot: "Morning (9 AM - 12 PM)",
    mode: "pickup" as "pickup" | "workshop",
    address: "Sector B, Pocket 8, Vasant Kunj, New Delhi",
    totalAmount: 2699,
    bookingId: "AW-2026-0319-4582",
    isPaid: true,
    status: "PENDING_WORKSHOP_ACCEPTANCE" as BookingStatus,
    workshopId: "garage-1",
    workshopName: "Sharma Auto Care",
    acceptBy: Date.now() + 90 * 1000,
    timeline: [
      {
        eventId: "evt-1",
        status: "PENDING_WORKSHOP_ACCEPTANCE",
        title: "Booking Initiated & Dispatched",
        description: "Dispatched to Sharma Auto Care. 90-second bay confirmation countdown active.",
        time: "Just now",
      },
    ],
  });

  const [ambulanceState, setAmbulanceState] = useState<AmbulanceDispatchState | null>(() => {
    try {
      const saved = localStorage.getItem("apni_ambulance_dispatch");
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const dispatchAmbulance = async (
    type: AmbulanceType = "ALS_ICU",
    notes: string = ""
  ): Promise<AmbulanceDispatchState> => {
    const typeNames: Record<AmbulanceType, string> = {
      ALS_ICU: "Advance Life Support (ALS) / ICU on Wheels",
      BLS: "Basic Life Support (BLS) Trauma Unit",
      TRAUMA_UNIT: "Rapid Emergency & Spine Trauma Mobile",
    };

    const typeEquipment: Record<AmbulanceType, string[]> = {
      ALS_ICU: [
        "Transport Ventilator & Multi-Para Cardiac Monitor",
        "Automated External Defibrillator (AED)",
        "Certified Emergency Paramedic + BLS Doctor on Board",
        "Emergency Intubation & Suction Unit",
      ],
      BLS: [
        "Dual Oxygen Cylinders with Flowmeters",
        "Foldable Stretcher & Spine Board",
        "Emergency First Responder & Vital Check Kit",
        "IV Fluids & Emergency Dressing Supplies",
      ],
      TRAUMA_UNIT: [
        "Vacuum Splints & Cervical Immobilization Collars",
        "High-Flow Oxygen Resuscitator",
        "Paramedic Trauma Specialist",
        "Direct Trauma Care & Real-Time Hospital Telemetry",
      ],
    };

    // Realistic authentic Indian emergency vehicle registration marks
    const plates = ["DL 1E AM 1080", "DL 01 AB 9911", "HR 26 ER 1084", "UP 16 EM 0108"];
    const randomPlate = plates[Math.floor(Math.random() * plates.length)];

    const dispatched: AmbulanceDispatchState = {
      id: `amb-${Date.now()}`,
      isDispatched: true,
      type,
      typeName: typeNames[type],
      numberPlate: randomPlate,
      driverName: "Anoop Kumar (Senior Ambulance Pilot)",
      paramedicName: "Rajesh Sharma (Lead Emergency Paramedic)",
      driverPhone: "+91 98101 99108",
      hospitalPartner: "Max / Fortis Emergency Trauma Grid & National 108 Network",
      pickupAddress: userLocation.address || "Sector B, Vasant Kunj, New Delhi",
      pickupArea: userLocation.areaName || "South Delhi",
      pickupLat: userLocation.lat,
      pickupLng: userLocation.lng,
      ambulanceLat: userLocation.lat + 0.0062,
      ambulanceLng: userLocation.lng + 0.0048,
      etaMins: 3,
      distanceKm: 1.4,
      status: "dispatched",
      dispatchedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      equipment: typeEquipment[type],
    };

    setAmbulanceState(dispatched);
    try {
      localStorage.setItem("apni_ambulance_dispatch", JSON.stringify(dispatched));
    } catch {}

    showToast(`🚑 Emergency Ambulance Dispatched! Plate: ${dispatched.numberPlate} (ETA ~3 mins)`);
    return dispatched;
  };

  const cancelAmbulance = () => {
    setAmbulanceState(null);
    try {
      localStorage.removeItem("apni_ambulance_dispatch");
    } catch {}
    showToast("Ambulance request cancelled.");
  };

  const [isModalOpen, setIsModalOpen] = useState<ModalStates>(initialModalStates);

  // Initialize Firebase Auth & Connection
  useEffect(() => {
    testFirebaseConnection();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for current booking
  useEffect(() => {
    if (!bookingInfo.bookingId) return;
    try {
      const unsub = onSnapshot(
        doc(db, "bookings", bookingInfo.bookingId),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setBookingInfo((prev) => ({
              ...prev,
              status: (data.status as BookingStatus) || prev.status,
              totalAmount: typeof data.totalAmount === "number" ? data.totalAmount : prev.totalAmount,
              acceptBy: typeof data.acceptBy === "number" ? data.acceptBy : prev.acceptBy,
            }));
          }
        },
        (err) => {
          console.warn("Firestore onSnapshot error (running with local state):", err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn("Firestore onSnapshot setup error:", e);
    }
  }, [bookingInfo.bookingId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openModal = (modal: keyof ModalStates) => {
    setIsModalOpen((prev) => ({ ...prev, [modal]: true }));
  };

  const closeModal = (modal: keyof ModalStates) => {
    setIsModalOpen((prev) => ({ ...prev, [modal]: false }));
  };

  const setVehiclePlate = (plate: string) => {
    setVehicle((prev) => ({ ...prev, plate }));
  };

  const setPaymentCompleted = (paid: boolean) => {
    setBookingInfo((prev) => ({ ...prev, isPaid: paid }));
  };

  // Create booking and initiate 90-second workshop acceptance timer
  const createBookingAndDispatch = async (mode?: "pickup" | "workshop"): Promise<string> => {
    const newBookingId = `AW-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const deadline = Date.now() + 90 * 1000;
    const amount = finalPayableTotal || bookingInfo.totalAmount || 2699;
    const initialTimeline = [
      {
        eventId: "evt-1",
        status: "PENDING_WORKSHOP_ACCEPTANCE",
        title: "Booking Dispatched to Workshop",
        description: `Sent to ${selectedGarage.name}. 90-second bay reservation window active.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];

    setBookingInfo({
      bookingId: newBookingId,
      date: bookingInfo.date || "Today",
      timeSlot: bookingInfo.timeSlot || "Morning (9 AM - 12 PM)",
      mode: mode || bookingInfo.mode,
      address: bookingInfo.address,
      totalAmount: amount,
      isPaid: bookingInfo.isPaid,
      status: "PENDING_WORKSHOP_ACCEPTANCE",
      workshopId: selectedGarage.id || "garage-1",
      workshopName: selectedGarage.name || "Sharma Auto Care",
      acceptBy: deadline,
      timeline: initialTimeline,
    });

    try {
      await setDoc(doc(db, "bookings", newBookingId), {
        bookingId: newBookingId,
        userId: auth.currentUser?.uid || "user_vikram_malhotra",
        workshopId: selectedGarage.id || "garage-1",
        workshopName: selectedGarage.name,
        vehiclePlate: vehicle.plate,
        vehicleName: vehicle.name,
        totalAmount: amount,
        status: "PENDING_WORKSHOP_ACCEPTANCE",
        acceptBy: deadline,
        serviceMode: mode || bookingInfo.mode,
        scheduledDate: bookingInfo.date,
        scheduledSlot: bookingInfo.timeSlot,
        createdAt: new Date().toISOString(),
      });

      await setDoc(doc(db, "bookings", newBookingId, "timeline", "evt-1"), {
        eventId: "evt-1",
        status: "PENDING_WORKSHOP_ACCEPTANCE",
        title: "Booking Initiated",
        description: `Dispatched to ${selectedGarage.name}. Bay confirmation pending.`,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Firestore booking persist error:", e);
    }

    showToast(`Dispatched to ${selectedGarage.name}! 90s bay confirmation active.`);
    return newBookingId;
  };

  // Workshop accepts the incoming job within the 90s window
  const acceptBookingByWorkshop = async (_id?: string) => {
    const targetId = _id || bookingInfo.bookingId;
    const updatedTimeline = [
      ...bookingInfo.timeline,
      {
        eventId: `evt-${Date.now()}`,
        status: "BOOKING_CONFIRMED",
        title: "Booking Accepted by Workshop",
        description: `${selectedGarage.name} confirmed Bay 03. Valet assigned.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];

    setBookingInfo((prev) => ({
      ...prev,
      status: "BOOKING_CONFIRMED",
      timeline: updatedTimeline,
    }));

    try {
      await setDoc(
        doc(db, "bookings", targetId),
        {
          status: "BOOKING_CONFIRMED",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await setDoc(doc(db, "bookings", targetId, "timeline", `evt-${Date.now()}`), {
        eventId: `evt-${Date.now()}`,
        status: "BOOKING_CONFIRMED",
        title: "Booking Accepted",
        description: `${selectedGarage.name} confirmed job. Bay assigned.`,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Firestore accept sync error:", e);
    }

    showToast(`${selectedGarage.name} accepted job! Valet partner assigned.`);
  };

  // Workshop declines or timer expires -> auto reroute
  const rejectBookingByWorkshop = async (_id?: string) => {
    const targetId = _id || bookingInfo.bookingId;
    setBookingInfo((prev) => ({
      ...prev,
      status: "REJECTED",
    }));

    try {
      await setDoc(
        doc(db, "bookings", targetId),
        {
          status: "REJECTED",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("Firestore reject sync error:", e);
    }

    showToast("Workshop passed. Re-routing to next nearest verified garage...");
    setTimeout(() => {
      setSelectedGarage(mockGarages[1] || mockGarages[0]);
      createBookingAndDispatch();
    }, 1200);
  };

  // Move booking along lifecycle
  const advanceBookingStage = async (nextStatus: BookingStatus) => {
    const titles: Record<string, string> = {
      VALET_DISPATCHED: "Valet En Route for Doorstep Pickup",
      CAR_PICKED_UP: "Car Picked Up & Bay Inspection Ingestion",
      BAY_INGESTED: "Car Ingested into Bay 03",
      UNDER_INSPECTION: "40-Point Diagnostic Inspection Underway",
      AWAITING_CUSTOMER_APPROVAL: "Awaiting Customer Approval for Brake Pads",
      REPAIR_IN_PROGRESS: "Servicing & Repair in Progress",
      QC_PASSED: "Final Quality Check & Road Test Passed",
      READY_FOR_DELIVERY: "Ready for Delivery with Digital Tax Invoice",
      COMPLETED: "Service Completed & Car Delivered",
    };

    const title = titles[nextStatus] || "Stage Updated";
    const updatedTimeline = [
      ...bookingInfo.timeline,
      {
        eventId: `evt-${Date.now()}`,
        status: nextStatus,
        title,
        description: `Service state transitioned to ${nextStatus.replace(/_/g, " ")}.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];

    setBookingInfo((prev) => ({
      ...prev,
      status: nextStatus,
      timeline: updatedTimeline,
    }));

    try {
      await setDoc(
        doc(db, "bookings", bookingInfo.bookingId),
        {
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await setDoc(doc(db, "bookings", bookingInfo.bookingId, "timeline", `evt-${Date.now()}`), {
        eventId: `evt-${Date.now()}`,
        status: nextStatus,
        title,
        description: `Stage updated to ${nextStatus}.`,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Stage update sync error:", e);
    }

    showToast(`Updated: ${title}`);
  };

  // Workshop technician requests customer approval for extra work found in bay
  const requestBayApproval = async (item: {
    componentName: string;
    partsInfo: string;
    price: number;
    recommendedBy: string;
  }) => {
    const apprId = `appr-${Date.now()}`;
    setApprovalRequest({
      id: apprId,
      componentName: item.componentName,
      partsInfo: item.partsInfo,
      price: item.price,
      recommendedBy: item.recommendedBy,
      status: "pending",
    });

    setBookingInfo((prev) => ({
      ...prev,
      status: "AWAITING_CUSTOMER_APPROVAL",
    }));

    try {
      await setDoc(doc(db, "bookings", bookingInfo.bookingId, "approvals", apprId), {
        id: apprId,
        bookingId: bookingInfo.bookingId,
        componentName: item.componentName,
        partsInfo: item.partsInfo,
        price: item.price,
        recommendedBy: item.recommendedBy,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      });

      await setDoc(
        doc(db, "bookings", bookingInfo.bookingId),
        {
          status: "AWAITING_CUSTOMER_APPROVAL",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("Approval request sync error:", e);
    }

    showToast(`Approval dispatched to car owner for ₹${item.price.toLocaleString()}!`);
  };

  // Car owner approves extra work
  const approveWork = async (id: string) => {
    setApprovalRequest((prev) => ({ ...prev, status: "approved" }));
    const extraPrice = approvalRequest.price || 3200;
    const newTotal = bookingInfo.totalAmount + extraPrice;

    setBookingInfo((prev) => ({
      ...prev,
      totalAmount: newTotal,
      status: "REPAIR_IN_PROGRESS",
    }));

    showToast(`Work approved! ₹${extraPrice.toLocaleString()} added to final invoice.`);

    try {
      await setDoc(
        doc(db, "bookings", bookingInfo.bookingId, "approvals", id || "appr-1"),
        {
          status: "APPROVED",
          approvedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await setDoc(
        doc(db, "bookings", bookingInfo.bookingId),
        {
          status: "REPAIR_IN_PROGRESS",
          totalAmount: newTotal,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("Approval sync error:", e);
    }
  };

  // Car owner skips extra work
  const skipWork = async (id: string) => {
    setApprovalRequest((prev) => ({ ...prev, status: "skipped" }));
    setBookingInfo((prev) => ({
      ...prev,
      status: "REPAIR_IN_PROGRESS",
    }));
    showToast("Item skipped and saved to service advisory. Repair resuming.");

    try {
      await setDoc(
        doc(db, "bookings", bookingInfo.bookingId, "approvals", id || "appr-1"),
        {
          status: "REJECTED",
          rejectedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await setDoc(
        doc(db, "bookings", bookingInfo.bookingId),
        {
          status: "REPAIR_IN_PROGRESS",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("Skip approval sync error:", e);
    }
  };

  const addBayLogStep = (step: Omit<BayLogStep, "id">) => {
    const newStep: BayLogStep = {
      ...step,
      id: "step-" + (bayLogSteps.length + 1),
    };
    setBayLogSteps((prev) => [newStep, ...prev]);
    showToast("Bay activity photo and log updated in real-time!");
  };

  const addEstimate = (item: Omit<WorkEstimateItem, "id">) => {
    const newItem: WorkEstimateItem = {
      ...item,
      id: "est-" + (estimates.length + 1),
    };
    setEstimates((prev) => [newItem, ...prev]);
    showToast(`Estimate request of ₹${item.totalCost.toLocaleString()} dispatched to vehicle owner!`);
  };

  const addLiveUpdate = (update: Omit<LiveBayUpdate, "id">) => {
    const newUpdate: LiveBayUpdate = {
      ...update,
      id: "upd-" + (liveUpdates.length + 1),
    };
    setLiveUpdates((prev) => [newUpdate, ...prev]);
    showToast("Live bay update published to customer stream!");
  };

  const toggleInspectionItem = (id: string) => {
    setInspectionItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "pass" ? "attention" : item.status === "attention" ? "critical" : "pass",
            }
          : item
      )
    );
  };

  const setFeedbackStar = (stars: number) => {
    setFeedback((prev) => ({ ...prev, stars }));
  };

  const toggleFeedbackChip = (chip: string) => {
    setFeedback((prev) => {
      const exists = prev.selectedChips.includes(chip);
      return {
        ...prev,
        selectedChips: exists
          ? prev.selectedChips.filter((c) => c !== chip)
          : [...prev.selectedChips, chip],
      };
    });
  };

  const setFeedbackComment = (comment: string) => {
    setFeedback((prev) => ({ ...prev, comment }));
  };

  const submitFeedback = async () => {
    setFeedback((prev) => ({ ...prev, submitted: true }));
    showToast("Thank you! Rating & review recorded on Sharma Auto Care profile.");

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, "feedback", `fb-${Date.now()}`), {
          bookingId: bookingInfo.bookingId,
          userId: auth.currentUser.uid,
          stars: feedback.stars,
          comment: feedback.comment,
          selectedChips: feedback.selectedChips,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn("Feedback sync error:", e);
    }
  };

  const loginCustomer = (name: string, phone: string, plate: string, carDetails?: Partial<Vehicle>) => {
    const newProfile: CustomerProfile = {
      name: name.trim() || "Customer",
      phone: phone.trim(),
      plate: plate.toUpperCase().trim(),
      isLoggedIn: true,
    };
    setCustomerProfile(newProfile);
    try {
      localStorage.setItem("apni_customer_session", JSON.stringify(newProfile));
    } catch {}

    const updatedVehicle: Vehicle = {
      ...defaultVehicle,
      plate: newProfile.plate,
      ownerName: newProfile.name,
      ...(carDetails || {}),
    };

    if (!updatedVehicle.imageUrl) {
      updatedVehicle.imageUrl = resolveVehicleImageUrl(updatedVehicle);
    }

    setVehicle(updatedVehicle);

    setUserRole("customer");
    setCurrentScreen("customer_home");
    showToast(`Welcome back, ${newProfile.name}! Vehicle ${newProfile.plate} loaded.`);
  };

  const logoutCustomer = () => {
    const clearedProfile: CustomerProfile = {
      name: "",
      phone: "",
      plate: "",
      isLoggedIn: false,
    };
    setCustomerProfile(clearedProfile);
    try {
      localStorage.removeItem("apni_customer_session");
    } catch {}
    setCurrentScreen("welcome");
    showToast("Logged out successfully.");
  };

  const updateBookingInfo = (partial: Partial<typeof bookingInfo>) => {
    setBookingInfo((prev) => ({ ...prev, ...partial }));
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        userRole,
        setUserRole,
        vehicle,
        setVehicle,
        setVehiclePlate,
        customerProfile,
        loginCustomer,
        logoutCustomer,
        selectedCategory,
        setSelectedCategory,
        selectedPackageId,
        setSelectedPackageId,
        selectedGarage,
        setSelectedGarage,
        userLocation,
        nearbyWorkshops,
        isSearchingWorkshops,
        googleMapsApiKey,
        detectUserLocation,
        setUserLocationManual,
        searchLocationManual,
        fetchNearbyWorkshops,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        cartTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        couponDiscount,
        finalPayableTotal,
        approvalRequest,
        approveWork,
        skipWork,
        bayLogSteps,
        addBayLogStep,
        estimates,
        addEstimate,
        liveUpdates,
        addLiveUpdate,
        inspectionItems,
        toggleInspectionItem,
        feedback,
        setFeedbackStar,
        toggleFeedbackChip,
        setFeedbackComment,
        submitFeedback,
        isWorkshopOnline,
        setIsWorkshopOnline,
        bookingInfo,
        updateBookingInfo,
        createBookingAndDispatch,
        acceptBookingByWorkshop,
        rejectBookingByWorkshop,
        advanceBookingStage,
        requestBayApproval,
        setPaymentCompleted,
        isModalOpen,
        modals: isModalOpen,
        ambulanceDispatch: isModalOpen.ambulanceDispatch,
        ambulanceState,
        dispatchAmbulance,
        cancelAmbulance,
        geofenceConfig,
        updateGeofenceConfig,
        geofenceEvents,
        trackedVehicle,
        latestGeofenceAlert,
        checkGeofenceTransition,
        triggerGeofenceSimulation,
        dismissGeofenceAlert,
        clearGeofenceEvents,
        openModal,
        closeModal,
        toastMessage,
        showToast,
        currentUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
