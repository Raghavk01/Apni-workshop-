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
  detectUserLocation: () => Promise<void>;
  setUserLocationManual: (lat: number, lng: number, areaName: string, address?: string) => Promise<void>;
  fetchNearbyWorkshops: (lat: number, lng: number, radiusMeters?: number) => Promise<void>;
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

  const [userLocation, setUserLocation] = useState<UserLocationState>({
    lat: 28.5244,
    lng: 77.1565,
    areaName: "Vasant Kunj, South Delhi",
    address: "Sector B, Vasant Kunj, New Delhi, Delhi 110070",
    isLocating: false,
    error: null,
    permissionGranted: false,
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

    // Query live real workshops on initial load
    fetchNearbyWorkshops(userLocation.lat, userLocation.lng, 8000);
  }, []);

  const fetchNearbyWorkshops = async (lat: number, lng: number, radiusMeters = 5000) => {
    setIsSearchingWorkshops(true);
    try {
      const res = await fetch("/api/places/nearby-workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, radiusMeters }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.workshops) && data.workshops.length > 0) {
        setNearbyWorkshops(data.workshops);
        if (data.workshops[0]) {
          setSelectedGarage(data.workshops[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch nearby workshops:", err);
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
    setUserLocation({
      lat,
      lng,
      areaName,
      address: address || `${areaName}, India`,
      isLocating: false,
      error: null,
      permissionGranted: true,
    });
    showToast(`📍 Location set to ${areaName}. Searching workshops...`);
    await fetchNearbyWorkshops(lat, lng, 5000);
  };

  const detectUserLocation = async () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setUserLocation((prev) => ({
        ...prev,
        isLocating: false,
        error: "Geolocation is not supported by this browser.",
      }));
      showToast("Geolocation is not supported by this device/browser.");
      return;
    }

    setUserLocation((prev) => ({ ...prev, isLocating: true, error: null }));
    showToast("📍 Requesting GPS Location access...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch("/api/places/reverse-geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude: lat, longitude: lng }),
          });
          const data = await res.json();
          const areaName = data.areaName || `GPS (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;
          const address = data.address || `${areaName}, India`;

          setUserLocation({
            lat,
            lng,
            areaName,
            address,
            isLocating: false,
            error: null,
            permissionGranted: true,
          });

          showToast(`📍 Located at: ${areaName}! Finding nearby workshops...`);
          await fetchNearbyWorkshops(lat, lng, 5000);
        } catch (revErr) {
          setUserLocation({
            lat,
            lng,
            areaName: `Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
            address: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            isLocating: false,
            error: null,
            permissionGranted: true,
          });
          await fetchNearbyWorkshops(lat, lng, 5000);
        }
      },
      (err) => {
        let msg = "Could not access location.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location permission denied. Please select a city or search above.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Location request timed out. Please try again.";
        }
        setUserLocation((prev) => ({
          ...prev,
          isLocating: false,
          error: msg,
        }));
        showToast(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
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
