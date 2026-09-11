export type UserRole = "customer" | "workshop";

export type BookingStatus =
  | "PENDING_WORKSHOP_ACCEPTANCE"
  | "BOOKING_CONFIRMED"
  | "VALET_DISPATCHED"
  | "CAR_PICKED_UP"
  | "BAY_INGESTED"
  | "UNDER_INSPECTION"
  | "AWAITING_CUSTOMER_APPROVAL"
  | "REPAIR_IN_PROGRESS"
  | "QC_PASSED"
  | "READY_FOR_DELIVERY"
  | "COMPLETED"
  | "REJECTED";

export type ScreenView =
  | "welcome" // Screen 0: Welcome & Number Plate / Mobile OTP Onboarding
  | "customer_home" // Screen 1: Apni Workshop Customer Home
  | "customer_book_package" // Screen 2: Book Service - Select Package
  | "customer_book_garages" // Screen 3: Book Service - Garages List
  | "customer_cart" // Screen: Dedicated Cart & Review
  | "customer_book_schedule" // Screen 4: Book Service - Schedule & Mode
  | "customer_tracker_journey" // Screen 5: Live Tracker - Pickup En Route
  | "customer_tracker_inspection" // Screen 6: Live Tracker - Under Inspection & Approval
  | "customer_tracker_ready" // Screen 7: Live Tracker - Car Ready & Tax Invoice
  | "workshop_dashboard" // Screen 8: Sharma Auto Care Partner Dashboard
  | "workshop_bay_log"; // Screen 9: Mechanic Live Bay Log - Work in Progress

export interface Vehicle {
  id: string;
  plate: string;
  name: string;
  model: string;
  makeModel?: string;
  fuelType: string;
  transmission: string;
  drive: string;
  ownerName: string;
  owner?: string;
  ownershipSerial?: string;
  vehicleAge?: string;
  financier?: string;
  taxValidity?: string;
  insuranceExpiry?: string;
  insurancePolicyNo?: string;
  puccExpiry?: string;
  puccCertNo?: string;
  fitnessValid?: string;
  membership: string;
  imageUrl: string;
  rto?: string;
  emissionNorm?: string;
  regDate?: string;
  chassisNo?: string;
  engineNo?: string;
  engineCc?: string;
  powerBhp?: string;
  torqueNm?: string;
  mileageKm?: number;
  category?: "4x4 SUV" | "Compact SUV" | "Hatchback" | "Sedan" | "EV" | "Luxury";
  serviceAdvisory?: string;
  challanSummary?: {
    totalPending: number;
    amount: number;
    lastChallanDate?: string;
    details?: string;
  };
  stolenBlacklistStatus?: string;
  resaleValueEstimate?: string;
}

export type ServiceCategory =
  | "periodic"
  | "ac"
  | "dent"
  | "battery"
  | "spa"
  | "custom";

export interface ServiceCategoryMeta {
  id: ServiceCategory;
  title: string;
  icon: string;
  badge?: string;
  color: string;
  description: string;
  recommendedPackageId: string;
}

export interface ServicePackage {
  id: string;
  categoryId: ServiceCategory;
  title: string;
  badge?: string;
  badgeType?: "recommended" | "popular" | "best_value" | "specialist";
  duration: string;
  priceMin: number;
  priceMax: number;
  originalPrice?: number;
  displayPrice: string;
  features: string[];
  icon: string;
  oemPartsIncluded?: string[];
  warranty?: string;
  recommendationReason?: string;
}

export interface TaskRating {
  rating: number;
  reviewCount: number;
  specialtyHighlight: string;
  taskBadge?: string;
  technicianExperience?: string;
  recentTaskReview?: {
    author: string;
    vehicle: string;
    comment: string;
    rating: number;
    timeAgo: string;
  };
}

export interface WorkshopGarage {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  etaMins: number;
  locationArea: string;
  isRecommended?: boolean;
  isClosest?: boolean;
  specialistTag?: string;
  price: number;
  originalPrice: number;
  features: string[];
  imageUrl: string;
  verified: boolean;
  doorstepFree: boolean;
  liveBaysAvailable?: number;
  taskRatings?: Partial<Record<ServiceCategory, TaskRating>>;
  lat?: number;
  lng?: number;
  address?: string;
  phone?: string;
  googleMapsUri?: string;
}

export interface CartItem {
  id: string; // unique item id
  packageId?: string;
  title: string;
  categoryId: ServiceCategory;
  categoryTitle?: string;
  price: number;
  originalPrice: number;
  duration: string;
  inclusions?: string[];
  oemParts?: string[];
  warranty?: string;
  workshopId: string;
  workshopName: string;
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: "percent" | "flat";
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  badge?: string;
  expiryDate?: string;
}

export interface AppliedCoupon {
  code: string;
  title: string;
  discountAmount: number;
  description: string;
}

export interface BayLogStep {
  id: string;
  title: string;
  time: string;
  description: string;
  status: "done" | "in_progress" | "upcoming";
  photos?: string[];
  photoBadge?: string;
}

export interface WorkEstimateItem {
  id: string;
  title: string;
  subTitle: string;
  approved: boolean;
  approvedVia?: string;
  totalCost: number;
  breakdown: Array<{ label: string; cost: number }>;
  tag?: string;
  stockStatus?: string;
}

export interface LiveBayUpdate {
  id: string;
  title: string;
  time: string;
  description: string;
  tag: string;
  tagType: "warning" | "success" | "info";
  mediaType: "image" | "video";
  mediaUrl: string;
}

export interface ApprovalRequest {
  id: string;
  componentName: string;
  recommendedBy: string;
  partsInfo: string;
  price: number;
  status: "pending" | "approved" | "skipped";
}

export interface NearbyJob {
  id: string;
  vehicleName: string;
  plate: string;
  serviceTitle: string;
  distanceKm: number;
  timeframe: string;
  payout: number;
  imageUrl: string;
}

export interface InspectionCheckItem {
  id: string;
  category: "Engine & Mechanical" | "Brakes & Wheels" | "Battery & Electrical" | "Fluid Levels" | "AC & Cabin";
  title: string;
  status: "pass" | "attention" | "critical" | "pending";
  notes?: string;
}

export interface FeedbackRating {
  stars: number;
  selectedChips: string[];
  comment: string;
  submitted: boolean;
}

export interface ServiceReminder {
  id: string;
  vehiclePlate: string;
  vehicleName: string;
  customerName: string;
  mobile: string;
  type: "periodic_service" | "insurance_renewal" | "pucc_expiry" | "brake_inspection";
  title: string;
  dueDate: string;
  daysRemaining: number;
  status: "scheduled" | "sent" | "converted";
  recommendedPackageId?: string;
  estimatedRevenue: number;
}

export interface InventoryItem {
  id: string;
  partNumber: string;
  name: string;
  category: "Engine Oil & Fluids" | "Braking & Rotors" | "Filters & Spark" | "Electrical & Battery" | "Body & Suspension";
  stockCount: number;
  minStockAlert: number;
  unitCost: number;
  sellingPrice: number;
  supplierName: string;
  barcode: string;
  compatibility: string[];
}

export interface TechnicianPerformance {
  id: string;
  name: string;
  role: string;
  avatar: string;
  jobsCompletedToday: number;
  rating: number;
  efficiencyScore: number;
}

export type AmbulanceType = "ALS_ICU" | "BLS" | "TRAUMA_UNIT";

export interface AmbulanceDispatchState {
  id: string;
  isDispatched: boolean;
  type: AmbulanceType;
  typeName: string;
  numberPlate: string;
  driverName: string;
  paramedicName: string;
  driverPhone: string;
  hospitalPartner: string;
  pickupAddress: string;
  pickupArea: string;
  pickupLat: number;
  pickupLng: number;
  ambulanceLat: number;
  ambulanceLng: number;
  etaMins: number;
  distanceKm: number;
  status: "dispatched" | "en_route" | "arrived" | "completed";
  dispatchedAt: string;
  equipment: string[];
}

export interface OBDCodeRecord {
  code: string;
  category: "Powertrain (P)" | "Chassis (C)" | "Body (B)" | "Network (U)";
  description: string;
  severity: "critical" | "warning" | "advisory";
  symptoms: string[];
  suggestedRepair: string;
  estimatedLaborMins: number;
  oemPartCost: number;
  freezeFrame?: {
    rpm: number;
    speedKm: number;
    coolantTempC: number;
    fuelTrim: string;
    throttlePos: string;
  };
}

export interface TrafficEChallan {
  challanNo: string;
  vehiclePlate: string;
  violationDate: string;
  violationType: string;
  mvActSection: string;
  location: string;
  fineAmount: number;
  status: "pending" | "paid" | "disputed";
  evidenceImageUrl?: string;
  policeDept: string;
  paymentUrl?: string;
}

export interface GeofenceConfig {
  enabled: boolean;
  radiusMeters: number;
  workshopLat: number;
  workshopLng: number;
  workshopName: string;
  workshopAddress: string;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  soundAlert: boolean;
  smsAlert: boolean;
  whatsappAlert: boolean;
}

export type GeofenceEventType = "ENTER" | "EXIT";

export interface GeofenceEvent {
  id: string;
  vehiclePlate: string;
  vehicleName: string;
  eventType: GeofenceEventType;
  timestamp: string;
  distanceMeters: number;
  radiusMeters: number;
  locationArea: string;
  lat: number;
  lng: number;
  speedKm: number;
  message: string;
  actionTriggered?: string;
  driverName?: string;
}

export interface TrackedVehicleState {
  lat: number;
  lng: number;
  speedKm: number;
  heading: number;
  distanceToWorkshopMeters: number;
  isInsideGeofence: boolean;
  lastTransitionTime?: string;
  status: "at_home" | "en_route_to_workshop" | "inside_workshop" | "out_for_test_drive" | "out_for_delivery" | "delivered";
}

export interface ModalStates {
  aiDiagnose: boolean;
  addEstimate: boolean;
  inspectionChecklist: boolean;
  taxInvoice: boolean;
  liveChat: boolean;
  screenDrawer: boolean;
  razorpay: boolean;
  liveMap: boolean;
  whatsapp: boolean;
  vahan: boolean;
  auth: boolean;
  customerSupport: boolean;
  reminders: boolean;
  inventory: boolean;
  analytics: boolean;
  customerApproval: boolean;
  ambulanceDispatch: boolean;
  obdScanner: boolean;
  echallan: boolean;
  whatsappHub: boolean;
  smsGateway: boolean;
  liveBayStream: boolean;
  geofencing: boolean;
  locationPicker: boolean;
}

