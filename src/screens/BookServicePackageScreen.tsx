import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  serviceCategories,
  servicePackages,
  getGarageTaskRating,
} from "../data/mockData";
import { ServiceCategory, ServicePackage, CartItem } from "../types";

// Popular quick add-on services available across partner workshops
interface QuickAddon {
  id: string;
  title: string;
  category: ServiceCategory;
  price: number;
  originalPrice: number;
  duration: string;
  icon: string;
  description: string;
}

const workshopAddons: QuickAddon[] = [
  {
    id: "addon_engine_flush",
    title: "Engine Flush & Decarbonize",
    category: "periodic",
    price: 649,
    originalPrice: 899,
    duration: "+25 mins",
    icon: "sanitizer",
    description: "Dissolves sludge deposits and restores piston ring flexibility before oil change.",
  },
  {
    id: "addon_ac_fogger",
    title: "Anti-Bacterial AC Sanitizer Fog",
    category: "ac",
    price: 499,
    originalPrice: 750,
    duration: "+20 mins",
    icon: "air",
    description: "Kills 99.9% bacteria and mildew odor in cabin blower vents.",
  },
  {
    id: "addon_wiper_pair",
    title: "Bosch Aerotwin Wiper Blades Pair",
    category: "periodic",
    price: 599,
    originalPrice: 850,
    duration: "+10 mins",
    icon: "water_drop",
    description: "Frameless aerodynamic wiper blades for streak-free monsoon vision.",
  },
  {
    id: "addon_wheel_alignment",
    title: "3D Laser Wheel Alignment & Balancing",
    category: "battery",
    price: 850,
    originalPrice: 1200,
    duration: "+35 mins",
    icon: "tire_repair",
    description: "Corrects steering pull, uneven tread wear and high-speed vibrations.",
  },
];

export const BookServicePackageScreen: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedPackageId,
    setSelectedPackageId,
    selectedGarage,
    setCurrentScreen,
    vehicle,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    cartTotal,
    showToast,
    updateBookingInfo,
  } = useApp();

  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Active category metadata
  const currentCategoryMeta =
    serviceCategories.find((c) => c.id === selectedCategory) || serviceCategories[0];

  // Packages for the active category
  const filteredPackages = servicePackages.filter((p) => p.categoryId === selectedCategory);

  // Task-specific rating for the selected workshop
  const taskRating = getGarageTaskRating(selectedGarage, selectedCategory);

  // Calculate workshop-adjusted pricing for a package
  const getGaragePackagePrice = (pkg: ServicePackage) => {
    const base = pkg.priceMin;
    if (selectedGarage.id === "speedy-motors") return Math.round(base * 1.05);
    if (selectedGarage.id === "green-wheels") return Math.round(base * 0.96);
    return base;
  };

  const getGarageOriginalPrice = (pkg: ServicePackage) => {
    return pkg.originalPrice || Math.round(getGaragePackagePrice(pkg) * 1.25);
  };

  // Add a service package to cart
  const handleAddPackageToCart = (pkg: ServicePackage) => {
    const price = getGaragePackagePrice(pkg);
    const originalPrice = getGarageOriginalPrice(pkg);

    const item: CartItem = {
      id: pkg.id,
      packageId: pkg.id,
      title: pkg.title,
      categoryId: pkg.categoryId,
      categoryTitle: currentCategoryMeta.title,
      price,
      originalPrice,
      duration: pkg.duration,
      inclusions: pkg.features,
      oemParts: pkg.oemPartsIncluded,
      warranty: pkg.warranty,
      workshopId: selectedGarage.id,
      workshopName: selectedGarage.name,
    };

    addToCart(item);
    setSelectedPackageId(pkg.id);
  };

  // Add an addon to cart
  const handleAddAddonToCart = (addon: QuickAddon) => {
    const item: CartItem = {
      id: addon.id,
      title: addon.title,
      categoryId: addon.category,
      categoryTitle: "Workshop Add-on",
      price: addon.price,
      originalPrice: addon.originalPrice,
      duration: addon.duration,
      inclusions: [addon.description],
      workshopId: selectedGarage.id,
      workshopName: selectedGarage.name,
    };

    addToCart(item);
  };

  // Proceed to time slot selection
  const handleProceedToTimeSlot = () => {
    if (cart.length === 0) {
      showToast("Please add at least one service to your cart to proceed.");
      return;
    }

    updateBookingInfo({
      totalAmount: cartTotal,
    });
    setCurrentScreen("customer_book_schedule");
  };

  return (
    <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full pb-36">
      {/* 1. Vehicle header strip */}
      <div className="flex items-center justify-between bg-[#f6f4ec] px-3.5 py-2.5 rounded-2xl border border-[#e4e3db]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#cbffc2] flex items-center justify-center text-[#005312] shadow-2xs flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">directions_car</span>
          </div>
          <div>
            <span className="font-bold text-[13px] text-[#1b1c17] block leading-tight">
              {vehicle.name} {vehicle.model}
            </span>
            <span className="text-[10px] text-[#707a6c]">
              Odo: {vehicle.mileageKm?.toLocaleString() || "28,450"} KM • {vehicle.fuelType}
            </span>
          </div>
        </div>
        <span className="bg-[#eae8e0] px-2 py-0.5 rounded font-numeric-plate text-[11px] font-bold text-[#40493d] border border-[#d8d6ce]">
          {vehicle.plate}
        </span>
      </div>

      {/* Cart Active Notification Banner */}
      {cart.length > 0 && (
        <div className="bg-[#e7f7e4] border border-[#0d631b]/30 p-3 rounded-2xl flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#0d631b] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-black text-[#0d631b] truncate">
                {cart.length} {cart.length === 1 ? "Service" : "Services"} in Cart (₹{cartTotal.toLocaleString()})
              </p>
              <p className="text-[10px] text-[#40493d]">Coupons available • Razorpay checkout</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentScreen("customer_cart")}
            className="px-3 py-1.5 rounded-xl bg-[#0d631b] hover:bg-[#094813] text-white text-[11px] font-bold whitespace-nowrap active:scale-95 transition-all shadow-2xs flex items-center gap-1 flex-shrink-0"
          >
            <span>View Cart</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      )}

      {/* 2. PROMINENT SELECTED WORKSHOP CARD */}
      <div className="bg-[#ffffff] rounded-2xl p-4 border-2 border-[#0d631b] shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#f0eee6] flex-shrink-0 border border-[#e4e3db] shadow-2xs">
              <img
                src={selectedGarage.imageUrl}
                alt={selectedGarage.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-black uppercase text-[#005312] bg-[#cbffc2] px-2 py-0.5 rounded-full">
                  Selected Workshop
                </span>
                <span className="text-[10px] text-[#0d631b] font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Verified Outlet
                </span>
              </div>
              <h2 className="font-bold text-[16px] text-[#1b1c17] mt-0.5 leading-tight truncate">
                {selectedGarage.name}
              </h2>
              <p className="text-[11px] text-[#707a6c] flex items-center gap-1 mt-0.5">
                <span>{selectedGarage.locationArea}</span>
                <span>•</span>
                <span>{selectedGarage.distanceKm} km ({selectedGarage.etaMins}m ETA)</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentScreen("customer_book_garages")}
            className="px-3 py-1.5 rounded-xl bg-[#f0eee6] hover:bg-[#e4e3db] text-[#1b1c17] font-bold text-[11px] flex items-center gap-1 flex-shrink-0 transition-colors shadow-2xs"
            title="Choose another workshop"
          >
            <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
            <span>Change</span>
          </button>
        </div>

        {/* Task Rating & Live Bays */}
        <div className="mt-3 pt-2.5 border-t border-[#f0eee6] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 bg-[#fff8e1] text-[#b78103] px-2 py-0.5 rounded-lg border border-[#ffe082] text-[11px] font-extrabold">
              <span className="material-symbols-outlined text-[13px] text-[#d97706]">star</span>
              <span>{taskRating.rating}★ in {currentCategoryMeta.title}</span>
            </span>
            <span className="text-[10px] text-[#707a6c]">
              ({taskRating.reviewCount} tasks verified)
            </span>
          </div>

          <span className="text-[10px] text-[#0d631b] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d631b] animate-ping"></span>
            <span>{selectedGarage.liveBaysAvailable || 3} Live Bays Open</span>
          </span>
        </div>

        {/* Workshop Tooling specialty */}
        <div className="mt-2 bg-[#f6f4ec] rounded-xl px-2.5 py-1.5 text-[11px] text-[#40493d] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-[#0d631b] flex-shrink-0">
            precision_manufacturing
          </span>
          <span className="truncate">
            <strong className="text-[#1b1c17]">Specialty: </strong>
            {taskRating.specialtyHighlight}
          </span>
        </div>
      </div>

      {/* 3. Category Selector Horizontal Scroll */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#707a6c]">
            Select Service Category
          </h3>
          <span className="text-[11px] text-[#0d631b] font-bold">
            {filteredPackages.length} Packages Available
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          {serviceCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-[12px] font-bold whitespace-nowrap transition-all flex-shrink-0 border ${
                  isActive
                    ? "bg-[#0d631b] text-white border-[#0d631b] shadow-sm scale-102"
                    : "bg-[#ffffff] text-[#40493d] border-[#e4e3db] hover:border-[#0d631b] hover:bg-[#f6f4ec]"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Category Overview Card */}
      <div className="bg-[#ffffff] rounded-2xl p-3.5 border border-[#e4e3db] shadow-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${currentCategoryMeta.color.split(" ")[0]}`}></span>
            <h3 className="font-bold text-[15px] text-[#1b1c17] leading-tight">
              {currentCategoryMeta.title} Services
            </h3>
          </div>
          {currentCategoryMeta.badge && (
            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#cbffc2] text-[#005312]">
              {currentCategoryMeta.badge}
            </span>
          )}
        </div>
        <p className="text-[12px] text-[#707a6c] leading-relaxed">
          {currentCategoryMeta.description}
        </p>
      </div>

      {/* 5. SERVICE DETAILS & PRICING WITH WORKING ADD TO CART BUTTON */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-bold text-[#1b1c17]">
            Available Packages for {selectedGarage.name.split(" ")[0]}
          </h3>
          <span className="text-[11px] text-[#707a6c]">Add desired service to cart</span>
        </div>

        {filteredPackages.map((pkg) => {
          const inCart = isInCart(pkg.id);
          const pkgPrice = getGaragePackagePrice(pkg);
          const originalPrice = getGarageOriginalPrice(pkg);
          const savings = originalPrice - pkgPrice;

          return (
            <div
              key={pkg.id}
              className={`bg-[#ffffff] rounded-2xl p-4 transition-all border-2 relative shadow-xs space-y-3 ${
                inCart
                  ? "border-[#0d631b] ring-2 ring-[#a3f69c]/40 bg-gradient-to-r from-white to-[#f0f8ef]/30"
                  : "border-[#e4e3db] hover:border-[#a3f69c]"
              }`}
            >
              {/* Header: Title, Duration & Price for this Workshop */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      inCart ? "bg-[#0d631b] text-white" : "bg-[#f6f4ec] text-[#0d631b]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{pkg.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-[15px] text-[#1b1c17] leading-tight">
                        {pkg.title}
                      </h4>
                      {pkg.badge && (
                        <span
                          className={`text-[8px] font-black px-2 py-0.2 rounded-full uppercase ${
                            pkg.badgeType === "recommended"
                              ? "bg-[#0d631b] text-white"
                              : "bg-[#ffddb8] text-[#794b00]"
                          }`}
                        >
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#707a6c] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      <span>{pkg.duration}</span>
                    </span>
                  </div>
                </div>

                {/* Price Display for this workshop */}
                <div className="text-right flex-shrink-0">
                  <div className="font-numeric-plate font-extrabold text-[17px] text-[#0d631b]">
                    ₹ {pkgPrice.toLocaleString()}
                  </div>
                  {savings > 0 && (
                    <div className="text-[10px] text-[#707a6c] line-through">
                      ₹ {originalPrice.toLocaleString()}
                    </div>
                  )}
                  <span className="text-[9px] text-[#707a6c] uppercase font-bold block">
                    Inclusive GST
                  </span>
                </div>
              </div>

              {/* Inclusions Checklist */}
              <div className="pt-2.5 border-t border-[#f0eee6] space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-[#707a6c] tracking-wider block">
                  Package Inclusions:
                </span>
                {pkg.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-[12px] text-[#40493d]">
                    <span className="material-symbols-outlined text-[#0d631b] text-[16px] flex-shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span className="leading-snug">{f}</span>
                  </div>
                ))}
              </div>

              {/* OEM Parts Row */}
              {pkg.oemPartsIncluded && pkg.oemPartsIncluded.length > 0 && (
                <div className="pt-2 border-t border-[#f0eee6] flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[#707a6c] font-bold uppercase">OEM Parts:</span>
                  {pkg.oemPartsIncluded.map((part, pi) => (
                    <span
                      key={pi}
                      className="text-[10px] font-medium bg-[#f6f4ec] text-[#40493d] px-2 py-0.5 rounded-md border border-[#e4e3db]"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              )}

              {/* Warranty & WORKING ADD TO CART BUTTON */}
              <div className="pt-2.5 border-t border-[#f0eee6] flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[11px] text-[#707a6c] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#0d631b] text-[15px]">verified_user</span>
                  <span>{pkg.warranty || "90-Day Apni Warranty"}</span>
                </span>

                {/* WORKING ADD TO CART / REMOVE BUTTON */}
                {inCart ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-[#cbffc2] text-[#005312] font-extrabold text-[12px] flex items-center gap-1 shadow-2xs">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Added in Cart</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(pkg.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] font-bold text-[11px] flex items-center gap-1 transition-colors active:scale-95"
                      title="Remove from Cart"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                      <span>Remove</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddPackageToCart(pkg)}
                    className="px-4 py-2 rounded-xl bg-[#0d631b] hover:bg-[#005312] text-white font-bold text-[12px] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                    <span>Add to Cart</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. POPULAR WORKSHOP SERVICE ADD-ONS */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[14px] text-[#1b1c17] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#0d631b] text-[18px]">build_circle</span>
            <span>Popular Add-on Services</span>
          </h3>
          <span className="text-[11px] text-[#0d631b] font-bold">1-Tap Add to Cart</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {workshopAddons.map((addon) => {
            const inCart = isInCart(addon.id);
            return (
              <div
                key={addon.id}
                className={`bg-[#ffffff] p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2 shadow-xs ${
                  inCart ? "border-[#0d631b] bg-[#f0f8ef]/40" : "border-[#e4e3db] hover:border-[#a3f69c]"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#f6f4ec] text-[#0d631b] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px]">{addon.icon}</span>
                      </div>
                      <h4 className="font-bold text-[13px] text-[#1b1c17] leading-tight">
                        {addon.title}
                      </h4>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#707a6c] leading-tight">
                    {addon.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#f0eee6] flex items-center justify-between">
                  <div>
                    <span className="font-numeric-plate font-extrabold text-[14px] text-[#0d631b]">
                      ₹ {addon.price}
                    </span>
                    <span className="text-[10px] text-[#707a6c] line-through ml-1.5">
                      ₹ {addon.originalPrice}
                    </span>
                  </div>

                  {inCart ? (
                    <button
                      type="button"
                      onClick={() => removeFromCart(addon.id)}
                      className="px-2 py-1 rounded-lg bg-[#cbffc2] text-[#005312] font-bold text-[10px] flex items-center gap-1 hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[13px]">check</span>
                      <span>In Cart</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddAddonToCart(addon)}
                      className="px-2.5 py-1 rounded-lg bg-[#f0eee6] hover:bg-[#0d631b] hover:text-white text-[#1b1c17] font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Transparent Price Guarantee Accordion */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#e4e3db] overflow-hidden shadow-xs">
        <button
          onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#f6f4ec] transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0d631b] text-[20px]">verified</span>
            <div>
              <h4 className="font-bold text-[13px] text-[#1b1c17]">Fair Workshop Price Promise</h4>
              <span className="text-[11px] text-[#707a6c]">No hidden charges • OEM parts guaranteed</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#707a6c] text-[20px]">
            {showPriceBreakdown ? "expand_less" : "expand_more"}
          </span>
        </button>

        {showPriceBreakdown && (
          <div className="p-3.5 pt-0 border-t border-[#f0eee6] space-y-2 text-[12px] text-[#40493d]">
            <div className="flex items-center justify-between py-1">
              <span>Doorstep Pickup & Drop (Delhi NCR)</span>
              <span className="text-[#0d631b] font-bold">100% FREE</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Live CCTV Bay Streaming & Step Photos</span>
              <span className="text-[#0d631b] font-bold">Included</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>40-Point Full Vehicle Health Audit</span>
              <span className="text-[#0d631b] font-bold">Complimentary</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Applicable GST (18%)</span>
              <span className="font-medium text-[#1b1c17]">Included in Price</span>
            </div>
          </div>
        )}
      </div>

      {/* 8. EXPANDABLE CART DRAWER MODAL (when clicked) */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#ffffff] rounded-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#f0eee6] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0d631b] text-[24px]">shopping_cart</span>
                <div>
                  <h3 className="font-bold text-[16px] text-[#1b1c17]">Your Service Cart</h3>
                  <span className="text-[11px] text-[#707a6c]">
                    Workshop: {selectedGarage.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowCartDrawer(false)}
                className="w-8 h-8 rounded-full bg-[#f6f4ec] flex items-center justify-center text-[#40493d] hover:bg-[#e4e3db]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-[#707a6c] space-y-2">
                  <span className="material-symbols-outlined text-[40px] text-[#d1cfc7]">shopping_cart_off</span>
                  <p className="text-[13px]">Your cart is empty. Add a service above.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#fbf9f1] p-3 rounded-2xl border border-[#e4e3db] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-[13px] text-[#1b1c17] truncate">{item.title}</h4>
                      <span className="text-[10px] text-[#707a6c] block">
                        {item.duration} • {item.warranty || "Apni Warranty"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <span className="font-numeric-plate font-extrabold text-[14px] text-[#0d631b]">
                          ₹ {item.price.toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-lg bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] flex items-center justify-center transition-colors"
                        title="Remove service"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-3 border-t border-[#f0eee6] space-y-3">
                <div className="flex items-center justify-between text-[13px] font-bold text-[#1b1c17]">
                  <span>Total Cart Amount ({cart.length} services)</span>
                  <span className="font-numeric-plate text-[18px] text-[#0d631b]">
                    ₹ {cartTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setShowCartDrawer(false);
                      setCurrentScreen("customer_cart");
                    }}
                    className="w-full h-11 rounded-full bg-[#0d631b] hover:bg-[#094813] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
                  >
                    <span>Go to Cart Page (Apply Coupons & Pay)</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearCart}
                      className="px-3 py-2 rounded-full bg-[#f6f4ec] text-[#ba1a1a] text-[12px] font-bold hover:bg-[#ffdad6] transition-colors"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={() => {
                        setShowCartDrawer(false);
                        handleProceedToTimeSlot();
                      }}
                      className="flex-1 h-10 rounded-full border border-[#e4e3db] text-[#1b1c17] text-[12px] font-bold flex items-center justify-center gap-1 hover:bg-[#f6f4ec]"
                    >
                      <span>Pick Time Slot</span>
                      <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. STICKY BOTTOM CART & TIME SLOT BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-[#ffffff]/95 backdrop-blur-md p-3.5 pb-safe border-t border-[#e4e3db] shadow-lg z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2.5">
          {/* Cart items count & Total */}
          <div
            onClick={() => {
              if (cart.length > 0) {
                setCurrentScreen("customer_cart");
              }
            }}
            className={`cursor-pointer group flex items-center gap-2 ${
              cart.length > 0 ? "hover:opacity-90" : "opacity-60"
            }`}
            title="Open Dedicated Cart Page"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-[#cbffc2] text-[#005312] flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              </div>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#0d631b] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cart.length}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#707a6c] uppercase font-bold tracking-wider block">
                  {cart.length === 0
                    ? "Cart Empty"
                    : `${cart.length} in Cart`}
                </span>
              </div>
              <div className="font-numeric-plate font-extrabold text-[16px] text-[#0d631b] leading-tight">
                {cart.length > 0 ? `₹ ${cartTotal.toLocaleString()}` : "₹ 0"}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              onClick={() => setCurrentScreen("customer_cart")}
              disabled={cart.length === 0}
              className={`h-11 px-3.5 rounded-full font-bold text-[12px] flex items-center justify-center gap-1.5 transition-all ${
                cart.length > 0
                  ? "bg-[#e7f7e4] text-[#005312] hover:bg-[#d5f3d0] active:scale-98 cursor-pointer border border-[#0d631b]/30"
                  : "bg-[#e4e3db] text-[#707a6c] cursor-not-allowed"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">local_offer</span>
              <span>View Cart & Offers</span>
            </button>

            <button
              onClick={handleProceedToTimeSlot}
              disabled={cart.length === 0}
              className={`flex-1 max-w-[170px] h-11 rounded-full font-bold text-[12px] flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                cart.length > 0
                  ? "btn-tactile-green active:scale-98 cursor-pointer"
                  : "bg-[#e4e3db] text-[#707a6c] cursor-not-allowed"
              }`}
            >
              <span>Time Slot</span>
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
