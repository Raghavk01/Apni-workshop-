import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { mockCoupons } from "../data/mockData";

export const CartScreen: React.FC = () => {
  const {
    cart,
    removeFromCart,
    clearCart,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponDiscount,
    finalPayableTotal,
    selectedGarage,
    setCurrentScreen,
    openModal,
    bookingInfo,
    updateBookingInfo,
    createBookingAndDispatch,
    vehicle,
    showToast,
  } = useApp();

  const [couponInput, setCouponInput] = useState<string>("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showAllCoupons, setShowAllCoupons] = useState<boolean>(false);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code.trim()) {
      setCouponError("Please enter a valid coupon code.");
      return;
    }
    const res = applyCoupon(code);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError(null);
      setCouponInput("");
    }
  };

  const handleProceedToSchedule = () => {
    if (cart.length === 0) {
      showToast("Your cart is empty. Please add services first.");
      return;
    }
    updateBookingInfo({
      totalAmount: finalPayableTotal,
    });
    setCurrentScreen("customer_book_schedule");
    showToast("Please choose your preferred slot & schedule to complete checkout.");
  };

  const originalTotal = cart.reduce((sum, item) => sum + (item.originalPrice || item.price * 1.25), 0);
  const totalSavings = Math.round(originalTotal - finalPayableTotal + 199); // includes free doorstep pickup savings

  if (cart.length === 0) {
    return (
      <div className="flex-1 px-4 py-8 max-w-xl mx-auto w-full flex flex-col items-center justify-center text-center pb-24">
        <div className="w-20 h-20 rounded-full bg-[#eae8e0] flex items-center justify-center text-[#707a6c] mb-4">
          <span className="material-symbols-outlined text-[40px]">shopping_cart</span>
        </div>
        <h2 className="text-[20px] font-black text-[#1b1c17]">Your Service Cart is Empty</h2>
        <p className="text-[13px] text-[#40493d] mt-1 max-w-xs">
          Explore comprehensive maintenance packages and add-ons tailored for your {vehicle.name}.
        </p>
        <button
          onClick={() => setCurrentScreen("customer_book_package")}
          className="mt-6 px-6 py-3 rounded-xl bg-[#0d631b] hover:bg-[#094813] text-white font-bold text-[14px] shadow-sm active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">car_repair</span>
          Browse Workshop Services
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-36 bg-[#fbf9f1] px-4 pt-3 max-w-2xl mx-auto w-full">
      {/* Breadcrumb & Navigation Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentScreen("customer_book_package")}
          className="flex items-center gap-1.5 text-[13px] font-bold text-[#0d631b] hover:underline"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Add More Services
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-[#707a6c]">
            {cart.length} {cart.length === 1 ? "Service" : "Services"}
          </span>
          <button
            onClick={clearCart}
            className="text-[11px] text-[#ba1a1a] font-semibold hover:underline px-2 py-0.5 rounded-md hover:bg-[#ba1a1a]/10 transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Selected Workshop Header Card */}
      <div className="bg-white rounded-2xl p-4 border border-[#e4e3db] shadow-2xs mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#0d631b] bg-[#e7f7e4] px-2 py-0.5 rounded-full">
            Selected Workshop Outlet
          </span>
          <button
            onClick={() => setCurrentScreen("customer_book_garages")}
            className="text-[11px] font-bold text-[#0d631b] hover:underline flex items-center gap-0.5"
          >
            Change
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        <div className="flex items-start gap-3">
          <img
            src={selectedGarage.imageUrl}
            alt={selectedGarage.name}
            className="w-14 h-14 rounded-xl object-cover border border-[#e4e3db]"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-black text-[#1b1c17] truncate">{selectedGarage.name}</h3>
            <p className="text-[11px] text-[#40493d] flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[13px] text-[#707a6c]">location_on</span>
              {selectedGarage.locationArea} • {selectedGarage.distanceKm} km away
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px]">
              <span className="flex items-center gap-0.5 font-bold text-[#1b1c17]">
                <span className="text-[#f59e0b] text-[13px]">★</span>
                {selectedGarage.rating} ({selectedGarage.reviewCount}+ ratings)
              </span>
              <span className="text-[#0d631b] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d631b] animate-pulse"></span>
                {selectedGarage.liveBaysAvailable || 3} bays open
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle & Time Slot Schedule Quick Ribbon */}
      <div className="bg-[#f0eee6] rounded-xl p-3 border border-[#e4e3db] mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#0d631b] shadow-2xs flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">directions_car</span>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-[#1b1c17] truncate">{vehicle.name}</p>
            <p className="text-[11px] text-[#707a6c]">
              {bookingInfo.date} • {bookingInfo.timeSlot.split(" ")[0]} ({bookingInfo.mode === "pickup" ? "Doorstep Pickup" : "Drive-in"})
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentScreen("customer_book_schedule")}
          className="text-[11px] font-bold text-[#0d631b] bg-white px-2.5 py-1 rounded-lg border border-[#e4e3db] shadow-2xs hover:bg-[#fbf9f1] active:scale-95 transition-all flex-shrink-0"
        >
          Change Slot
        </button>
      </div>

      {/* Selected Services & Inclusions List */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[14px] font-black text-[#1b1c17] tracking-tight uppercase">
            What You Have Selected ({cart.length})
          </h2>
          <button
            onClick={() => setCurrentScreen("customer_book_package")}
            className="text-[11px] font-bold text-[#0d631b] flex items-center gap-0.5 hover:underline"
          >
            <span className="material-symbols-outlined text-[14px]">add_circle</span>
            Add More
          </button>
        </div>

        <div className="space-y-3">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-[#e4e3db] shadow-2xs relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#707a6c] bg-[#f0eee6] px-2 py-0.5 rounded">
                      {item.categoryTitle || "Workshop Service"}
                    </span>
                    {item.warranty && (
                      <span className="text-[10px] font-bold text-[#0d631b] bg-[#e7f7e4] px-2 py-0.5 rounded">
                        {item.warranty}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[15px] font-black text-[#1b1c17] leading-snug">{item.title}</h3>

                  <div className="flex items-center gap-3 mt-1 text-[12px] text-[#707a6c]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {item.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[#0d631b] font-medium">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      OEM Parts & Synthetic Lubes
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className="text-[17px] font-black text-[#1b1c17]">₹{item.price.toLocaleString()}</span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-[11px] text-[#707a6c] line-through">
                      ₹{item.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="mt-2 text-[11px] font-bold text-[#ba1a1a] hover:bg-[#ba1a1a]/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    title="Remove from Cart"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Remove
                  </button>
                </div>
              </div>

              {/* Service Inclusions checklist */}
              {item.inclusions && item.inclusions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#f0eee6]">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#707a6c] mb-1.5">
                    What's Included:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-[#40493d]">
                    {item.inclusions.slice(0, 4).map((inc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-[#0d631b] text-[14px] flex-shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                  {item.inclusions.length > 4 && (
                    <p className="text-[10px] text-[#0d631b] font-bold mt-1">
                      + {item.inclusions.length - 4} more inspection points
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Apply Coupons & Promo Codes Section */}
      <div className="bg-white rounded-2xl p-4 border border-[#e4e3db] shadow-2xs mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[#e7f7e4] text-[#0d631b] flex items-center justify-center">
            <span className="material-symbols-outlined text-[17px]">local_offer</span>
          </div>
          <div>
            <h3 className="text-[14px] font-black text-[#1b1c17]">Apply Workshop Coupons</h3>
            <p className="text-[11px] text-[#707a6c]">Save up to ₹500 instantly on your booking</p>
          </div>
        </div>

        {/* Input Form */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                setCouponError(null);
              }}
              placeholder="Enter coupon code (e.g. MONSOON500)"
              className="w-full px-3 py-2.5 text-[13px] uppercase font-bold tracking-wider rounded-xl border border-[#e4e3db] bg-[#fbf9f1] focus:outline-none focus:border-[#0d631b] focus:ring-1 focus:ring-[#0d631b] placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
            />
            {couponInput && (
              <button
                onClick={() => setCouponInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#707a6c] hover:text-[#1b1c17]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
          <button
            onClick={() => handleApplyCoupon()}
            className="px-5 py-2.5 rounded-xl bg-[#0d631b] hover:bg-[#094813] text-white font-bold text-[13px] active:scale-95 transition-all shadow-xs"
          >
            Apply
          </button>
        </div>

        {couponError && (
          <p className="text-[11px] text-[#ba1a1a] font-semibold mt-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">error</span>
            {couponError}
          </p>
        )}

        {/* Active Applied Coupon Banner */}
        {appliedCoupon && (
          <div className="mt-3 p-3 rounded-xl bg-[#e7f7e4] border border-[#0d631b]/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0d631b] text-[20px]">check_circle</span>
              <div>
                <p className="text-[12px] font-black text-[#0d631b]">
                  '{appliedCoupon.code}' Applied (-₹{appliedCoupon.discountAmount.toLocaleString()})
                </p>
                <p className="text-[10px] text-[#40493d]">{appliedCoupon.description}</p>
              </div>
            </div>
            <button
              onClick={removeCoupon}
              className="text-[11px] font-bold text-[#ba1a1a] hover:underline ml-2"
            >
              Remove
            </button>
          </div>
        )}

        {/* Recommended Coupons Carousel / List */}
        <div className="mt-3 pt-3 border-t border-[#f0eee6]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#707a6c] tracking-wider">
              Available Offers
            </span>
            <button
              onClick={() => setShowAllCoupons(!showAllCoupons)}
              className="text-[11px] text-[#0d631b] font-bold hover:underline"
            >
              {showAllCoupons ? "Show Less" : "View All"}
            </button>
          </div>

          <div className="space-y-2">
            {(showAllCoupons ? mockCoupons : mockCoupons.slice(0, 2)).map((coupon) => {
              const isApplied = appliedCoupon?.code === coupon.code;
              return (
                <div
                  key={coupon.code}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                    isApplied
                      ? "bg-[#e7f7e4]/60 border-[#0d631b]/40"
                      : "bg-[#fbf9f1] border-[#e4e3db] hover:border-[#0d631b]/50"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-[12px] text-[#1b1c17] tracking-wider bg-white px-1.5 py-0.5 rounded border border-[#e4e3db]">
                        {coupon.code}
                      </span>
                      {coupon.badge && (
                        <span className="text-[9px] font-extrabold uppercase bg-[#0d631b] text-white px-1.5 py-0.5 rounded-full">
                          {coupon.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#40493d] font-medium mt-1 truncate">
                      {coupon.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleApplyCoupon(coupon.code)}
                    disabled={isApplied}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${
                      isApplied
                        ? "bg-[#0d631b] text-white cursor-default"
                        : "bg-white text-[#0d631b] border border-[#0d631b] hover:bg-[#0d631b] hover:text-white active:scale-95"
                    }`}
                  >
                    {isApplied ? "APPLIED" : "APPLY"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transparent Bill Breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-[#e4e3db] shadow-2xs mb-4">
        <h3 className="text-[14px] font-black text-[#1b1c17] mb-3 uppercase tracking-tight">
          Bill Details
        </h3>

        <div className="space-y-2 text-[13px]">
          <div className="flex items-center justify-between text-[#40493d]">
            <span>Item Total ({cart.length} items)</span>
            <span className="font-semibold text-[#1b1c17]">₹{cartTotal.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-[#40493d]">
            <span className="flex items-center gap-1">
              Doorstep Valet Pickup & Drop
              <span className="text-[10px] bg-[#e7f7e4] text-[#0d631b] font-bold px-1.5 py-0.2 rounded">
                FREE
              </span>
            </span>
            <div className="text-right">
              <span className="text-[11px] line-through text-[#707a6c] mr-1.5">₹199</span>
              <span className="font-bold text-[#0d631b]">₹0</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[#40493d]">
            <span>40-Point OBD-II Diagnostic Scan</span>
            <span className="font-bold text-[#0d631b]">FREE</span>
          </div>

          {appliedCoupon && (
            <div className="flex items-center justify-between text-[#0d631b] font-bold">
              <span>Coupon Discount ({appliedCoupon.code})</span>
              <span>-₹{appliedCoupon.discountAmount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[#707a6c] text-[11px] pt-1">
            <span>GST & Service Taxes (18% inclusive)</span>
            <span>Included</span>
          </div>

          <div className="pt-3 border-t border-[#e4e3db] flex items-center justify-between">
            <div>
              <span className="text-[15px] font-black text-[#1b1c17]">To Pay</span>
              <p className="text-[10px] text-[#707a6c]">Inclusive of all taxes & OEM warranty</p>
            </div>
            <span className="text-[20px] font-black text-[#0d631b]">
              ₹{finalPayableTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {totalSavings > 0 && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#e7f7e4] text-[#0d631b] text-[11px] font-bold flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">savings</span>
            You are saving ₹{totalSavings.toLocaleString()} on this booking!
          </div>
        )}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-3 rounded-2xl bg-[#f0eee6] border border-[#e4e3db] flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#0d631b] shadow-2xs flex-shrink-0">
          <span className="material-symbols-outlined text-[20px]">verified_user</span>
        </div>
        <div className="text-[11px] text-[#40493d]">
          <span className="font-bold text-[#1b1c17] block">Apni Workshop Guarantee</span>
          100% Genuine OEM parts, 1000 km warranty & live bay CCTV stream access during inspection.
        </div>
      </div>

      {/* Sticky Bottom Action Bar with Checkout & Scheduling */}
      <div className="fixed bottom-16 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#e4e3db] p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-start">
            <span className="text-[11px] text-[#707a6c]">Total Estimate</span>
            <span className="text-[20px] font-black text-[#1b1c17] leading-none">
              ₹{finalPayableTotal.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:flex-1">
            {/* Proceed to Schedule Slot */}
            <button
              onClick={handleProceedToSchedule}
              className="flex-1 py-3 px-4 rounded-xl bg-[#0d631b] hover:bg-[#084212] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>Proceed to Schedule & Slot Selection</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Guarantee Info */}
        <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-[#707a6c]">
          <span className="material-symbols-outlined text-[12px] text-[#0d631b]">verified_user</span>
          <span>Pick date, time slot & handover mode next before securing payment.</span>
        </div>
      </div>
    </div>
  );
};
