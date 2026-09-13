import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { servicePackages } from "../../data/mockData";
import {
  Store,
  ShoppingCart,
  Plus,
  X,
  Calendar,
  Clock,
  Truck,
  Car,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Tag,
  Sun,
  Sunrise,
  Sunset,
  Sparkles,
  MapPin,
  RefreshCw,
  Lock,
  ArrowLeft,
} from "lucide-react";

export const ScheduleCheckoutScreen: React.FC = () => {
  const {
    selectedGarage,
    selectedPackageId,
    setCurrentScreen,
    cart,
    removeFromCart,
    cartTotal,
    appliedCoupon,
    couponDiscount,
    finalPayableTotal,
    updateBookingInfo,
    vehicle,
    showToast,
    openModal,
  } = useApp();

  const selectedPkg =
    servicePackages.find((p) => p.id === selectedPackageId) || servicePackages[1];

  const payableAmount = cart.length > 0 ? finalPayableTotal : selectedGarage.price;

  const [dateOption, setDateOption] = useState("Today");
  const [timeSlot, setTimeSlot] = useState("Morning (9 AM - 12 PM)");
  const [serviceMode, setServiceMode] = useState<"pickup" | "workshop">("pickup");
  const [address, setAddress] = useState("Flat 402, Tower B, Sector 15A, Noida, UP");
  const [processing, setProcessing] = useState(false);

  const dates = [
    { label: "Today", sub: "19 Mar", badge: "Fast Track" },
    { label: "Tomorrow", sub: "20 Mar", badge: "Recommended" },
    { label: "Sat, 21 Mar", sub: "Weekend", badge: "Popular" },
  ];

  const slots = [
    { title: "Morning", time: "9:00 AM - 12:00 PM", icon: Sunrise, bays: "3 Bays Open" },
    { title: "Afternoon", time: "12:00 PM - 3:00 PM", icon: Sun, bays: "2 Bays Open" },
    { title: "Evening", time: "3:00 PM - 6:00 PM", icon: Sunset, bays: "Fastest Turnaround" },
  ];

  const handleProceedPayment = () => {
    if (cart.length === 0) {
      showToast("No services in cart. Please select a service first.");
      setCurrentScreen("customer_book_package");
      return;
    }

    setProcessing(true);
    updateBookingInfo({
      date: dateOption,
      timeSlot,
      mode: serviceMode,
      address,
      totalAmount: payableAmount,
    });

    setTimeout(() => {
      setProcessing(false);
      showToast(`Slot confirmed for ${dateOption}, ${timeSlot}. Opening Payment Checkout...`);
      openModal("razorpay");
    }, 400);
  };

  return (
    <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full pb-40">
      {/* Top Header / Back Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentScreen("customer_book_package")}
          className="flex items-center gap-1.5 text-[12px] font-bold text-[#0d631b] hover:underline cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Services</span>
        </button>
        <span className="text-[11px] font-semibold text-[#707a6c]">Step 3 of 4: Schedule & Slots</span>
      </div>

      {/* 1. Workshop Summary Card */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-[#005312] bg-[#cbffc2] px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Store size={12} />
            Assigned Workshop Outlet
          </span>
          <button
            onClick={() => setCurrentScreen("customer_book_garages")}
            className="text-[11px] font-bold text-[#0d631b] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Change Workshop</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#f0eee6] border border-[#e4e3db] shrink-0">
              <img
                src={selectedGarage.imageUrl}
                alt={selectedGarage.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-[#1b1c17] leading-tight">
                {selectedGarage.name}
              </h3>
              <p className="text-[11px] text-[#707a6c] flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-[#0d631b]" />
                {selectedGarage.locationArea} • {selectedGarage.distanceKm} km
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#707a6c] block uppercase font-bold">Payable</span>
            <span className="font-numeric-plate font-extrabold text-[17px] text-[#0d631b]">
              ₹{payableAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Cart Items Summary (Added Services & Pricing) */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShoppingCart size={18} className="text-[#0d631b]" />
            <h4 className="font-bold text-[14px] text-[#1b1c17]">
              Selected Services in Cart ({cart.length})
            </h4>
          </div>
          <button
            onClick={() => setCurrentScreen("customer_book_package")}
            className="text-[11px] font-bold text-[#0d631b] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus size={13} />
            <span>Add More</span>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="p-3 bg-[#f6f4ec] rounded-xl text-center text-[12px] text-[#707a6c]">
            No services in cart. Tap "+ Add More" to select services from {selectedGarage.name}.
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-[#fbf9f1] border border-[#e4e3db] flex items-center justify-between gap-2 text-[12px]"
              >
                <div className="min-w-0">
                  <span className="font-bold text-[#1b1c17] block leading-snug truncate">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-[#707a6c] block">
                    {item.duration} • {item.warranty || "Apni Warranty"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-numeric-plate font-bold text-[#0d631b]">
                    ₹{item.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-6 h-6 rounded-md bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center hover:bg-[#ffb4ab] cursor-pointer"
                    title="Remove item"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Date Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[12px] font-bold text-[#40493d] uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={14} className="text-[#0d631b]" />
            1. Select Service Date for Workshop
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {dates.map((d) => {
            const isSelected = dateOption === d.label;
            return (
              <button
                key={d.label}
                type="button"
                onClick={() => setDateOption(d.label)}
                className={`p-3 rounded-2xl text-center border-2 transition-all relative cursor-pointer ${
                  isSelected
                    ? "bg-[#cbffc2]/40 border-[#0d631b] text-[#005312] shadow-xs"
                    : "bg-[#ffffff] border-[#e4e3db] text-[#1b1c17] hover:border-[#a3f69c]"
                }`}
              >
                {d.badge && (
                  <span className="text-[8px] font-black uppercase text-[#005312] bg-[#cbffc2] px-1.5 py-0.2 rounded-full absolute top-1.5 right-1.5">
                    {d.badge}
                  </span>
                )}
                <span className="font-bold text-[13px] block leading-tight mt-1">{d.label}</span>
                <span className="text-[10px] text-[#707a6c] block mt-0.5">{d.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Time Slot Selection for Workshop */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[12px] font-bold text-[#40493d] uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={14} className="text-[#0d631b]" />
            2. Preferred Workshop Time Slot
          </label>
          <span className="text-[10px] font-bold text-[#0d631b] bg-[#cbffc2] px-2 py-0.5 rounded-full">
            Live Bays Tracked
          </span>
        </div>
        <div className="space-y-2">
          {slots.map((s) => {
            const isSelected = timeSlot === `${s.title} (${s.time})`;
            const IconComponent = s.icon;
            return (
              <div
                key={s.title}
                onClick={() => setTimeSlot(`${s.title} (${s.time})`)}
                className={`p-3 bg-[#ffffff] rounded-2xl cursor-pointer flex items-center justify-between border-2 transition-all ${
                  isSelected
                    ? "border-[#0d631b] ring-2 ring-[#a3f69c]/50 shadow-xs"
                    : "border-[#e4e3db] hover:border-[#a3f69c]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected ? "bg-[#0d631b] text-white" : "bg-[#f6f4ec] text-[#40493d]"
                    }`}
                  >
                    <IconComponent size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[13px] text-[#1b1c17] block">{s.title}</span>
                      <span className="text-[9px] font-bold text-[#0d631b] bg-[#cbffc2] px-1.5 py-0.2 rounded-full">
                        {s.bays}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#707a6c]">{s.time}</span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-[#0d631b] bg-[#0d631b]" : "border-[#d1cfc7] bg-white"
                  }`}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Service Mode (Pickup vs Visit) */}
      <div className="space-y-2">
        <label className="text-[12px] font-bold text-[#40493d] uppercase tracking-wider block">
          3. Service Handover Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setServiceMode("pickup")}
            className={`p-3 rounded-2xl flex flex-col items-center text-center gap-1.5 border-2 transition-all cursor-pointer ${
              serviceMode === "pickup"
                ? "bg-[#cbffc2]/40 border-[#0d631b] text-[#005312] shadow-xs"
                : "bg-[#ffffff] border-[#e4e3db] text-[#40493d]"
            }`}
          >
            <Truck size={22} className="text-[#0d631b]" />
            <span className="font-bold text-[12px] text-[#1b1c17]">Doorstep Pickup</span>
            <span className="text-[10px] text-[#0d631b] font-bold">100% Free Service</span>
          </button>

          <button
            type="button"
            onClick={() => setServiceMode("workshop")}
            className={`p-3 rounded-2xl flex flex-col items-center text-center gap-1.5 border-2 transition-all cursor-pointer ${
              serviceMode === "workshop"
                ? "bg-[#cbffc2]/40 border-[#0d631b] text-[#005312] shadow-xs"
                : "bg-[#ffffff] border-[#e4e3db] text-[#40493d]"
            }`}
          >
            <Car size={22} className="text-[#40493d]" />
            <span className="font-bold text-[12px] text-[#1b1c17]">Drive to Workshop</span>
            <span className="text-[10px] text-[#707a6c]">Self Drop-off</span>
          </button>
        </div>

        {serviceMode === "pickup" && (
          <div className="bg-[#ffffff] rounded-2xl p-3 border border-[#e4e3db] space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#40493d] flex items-center gap-1">
                <MapPin size={12} className="text-[#0d631b]" />
                Pickup Address
              </span>
              <span className="text-[#0d631b] font-semibold">Home / Office</span>
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#f6f4ec] p-2 rounded-xl text-[12px] text-[#1b1c17] outline-none border border-[#e4e3db] focus:border-[#0d631b]"
            />
          </div>
        )}
      </div>

      {/* 6. Itemized Bill Breakdown */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e4e3db] space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[13px] text-[#1b1c17]">Price Breakdown</h4>
          <span className="text-[10px] font-bold text-[#0d631b] bg-[#cbffc2] px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck size={12} />
            Fair Price Guarantee
          </span>
        </div>

        <div className="space-y-1.5 text-[12px] text-[#40493d]">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="truncate pr-2">{item.title}</span>
                <span className="font-semibold text-[#1b1c17]">
                  ₹{item.price.toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="flex justify-between">
              <span className="truncate pr-2">{selectedPkg.title}</span>
              <span className="font-semibold text-[#1b1c17]">
                ₹{selectedGarage.price.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between text-[#0d631b]">
            <span>Doorstep Pickup & Live Video Bay</span>
            <span className="font-bold">FREE</span>
          </div>

          <div className="flex justify-between text-[#0d631b]">
            <span>40-Point Inspection & GST (18%)</span>
            <span className="font-bold">Included</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-[#0d631b] font-bold">
              <span>Coupon Discount ({appliedCoupon.code})</span>
              <span>-₹{appliedCoupon.discountAmount.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* View/Edit Cart and Apply Coupons link */}
        <div className="pt-2 border-t border-[#f0eee6] flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen("customer_cart")}
            className="text-[11px] font-bold text-[#0d631b] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Tag size={13} />
            {appliedCoupon ? `Applied: ${appliedCoupon.code} (Change/Remove)` : "Apply Coupons & Offers"}
          </button>
        </div>

        <div className="pt-2 border-t border-[#f0eee6] flex justify-between items-baseline font-bold text-[#1b1c17]">
          <span className="text-[14px]">Total Payable</span>
          <span className="font-numeric-plate text-[19px] text-[#0d631b]">
            ₹{payableAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Inline Confirm & Next Card */}
      <div className="bg-[#f0f8ef] rounded-2xl p-4 border-2 border-[#0d631b]/30 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0d631b] text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h5 className="font-extrabold text-[13px] text-[#005312]">Ready to Secure Your Bay?</h5>
              <p className="text-[11px] text-[#40493d]">
                Selected: {dateOption}, {timeSlot.split(" ")[0]}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleProceedPayment}
          disabled={processing || cart.length === 0}
          className="w-full h-12 rounded-xl btn-tactile-green font-bold text-[14px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
        >
          {processing ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>Confirming Selection...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>Confirm & Next: Go to Payment (₹{payableAmount.toLocaleString()})</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* 7. Sticky Bottom Action Bar with Confirm & Next */}
      <div className="fixed bottom-0 inset-x-0 bg-[#ffffff]/95 backdrop-blur-md p-4 pb-safe border-t border-[#e4e3db] shadow-xl z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#707a6c] uppercase font-bold tracking-wider block">
              Payable Amount
            </span>
            <div className="font-numeric-plate font-extrabold text-[18px] text-[#0d631b]">
              ₹{payableAmount.toLocaleString()}
            </div>
          </div>

          <button
            type="button"
            disabled={processing || cart.length === 0}
            onClick={handleProceedPayment}
            className="flex-1 h-12 rounded-full btn-tactile-green font-bold text-[13px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
          >
            {processing ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Confirming Slot...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Confirm & Next</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

