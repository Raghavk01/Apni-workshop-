import React, { useState } from "react";
import confetti from "canvas-confetti";
import { useApp } from "../context/AppContext";
import { openRazorpayStandardCheckout } from "../services/razorpay";
import {
  CheckCircle2,
  Home,
  Activity,
  ShieldCheck,
  Copy,
  Lock,
  X,
  FileText,
  Store,
  Car,
  Clock,
  Sparkles,
  RefreshCw,
  CreditCard,
  Smartphone,
  Building,
  HandCoins,
  ArrowRight,
  Receipt,
  QrCode,
  AlertCircle,
} from "lucide-react";

export const RazorpayUPIModal: React.FC = () => {
  const {
    isModalOpen,
    closeModal,
    bookingInfo,
    setPaymentCompleted,
    createBookingAndDispatch,
    setCurrentScreen,
    showToast,
    appliedCoupon,
    vehicle,
    selectedGarage,
  } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "card" | "netbanking" | "emi" | "cod">("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>("gpay");
  const [upiIdInput, setUpiIdInput] = useState<string>("vikram@okhdfcbank");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{
    orderId?: string;
    paymentId?: string;
    signature?: string;
  } | null>(null);

  if (!isModalOpen.razorpay) return null;

  const totalPayable = bookingInfo.totalAmount || 2699;

  // Complete Standard Web Checkout with Razorpay
  const handleStandardCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    await openRazorpayStandardCheckout({
      amount: totalPayable,
      bookingId: bookingInfo.bookingId || `APN-${Date.now().toString().slice(-6)}`,
      customerName: "Vikram Malhotra",
      customerEmail: "vikram.malhotra@example.com",
      customerPhone: "+919876543210",
      description: `Apni Workshop Service Booking - Ref #${bookingInfo.bookingId}`,
      onSuccess: ({ orderId, paymentId, signature }) => {
        setIsProcessing(false);
        setPaymentSuccess(true);
        setPaymentCompleted(true);
        setPaymentDetails({
          orderId: orderId || `order_APN${Math.floor(100000 + Math.random() * 900000)}`,
          paymentId: paymentId || `pay_rzp_${Date.now().toString().slice(-8)}`,
          signature,
        });
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
        });
        showToast(`✅ Payment of ₹${totalPayable.toLocaleString()} verified by Razorpay!`);
        createBookingAndDispatch();
      },
      onError: (err) => {
        setIsProcessing(false);
        setErrorMessage(err);
        showToast(`❌ ${err}`);
      },
      onDismiss: () => {
        setIsProcessing(false);
        showToast("Payment checkout closed by user.");
      },
    });
  };

  const handlePayNow = () => {
    if (selectedMethod === "cod") {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(true);
        setPaymentCompleted(true);
        setPaymentDetails({
          orderId: `order_APN${Math.floor(100000 + Math.random() * 900000)}`,
          paymentId: `pay_COD_BAY03_${Date.now().toString().slice(-6)}`,
        });
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
        showToast(`Pay at Bay / COD confirmed for ₹${totalPayable.toLocaleString()}!`);
        createBookingAndDispatch();
      }, 700);
      return;
    }

    // Launch official Razorpay standard checkout
    handleStandardCheckout();
  };

  const handleGoHome = () => {
    setPaymentSuccess(false);
    closeModal("razorpay");
    setCurrentScreen("customer_home");
    showToast("Returned to Home. Your service booking is actively running in background!");
  };

  const handleGoTrackerAndApprovalHub = () => {
    setPaymentSuccess(false);
    closeModal("razorpay");
    setCurrentScreen("customer_tracker_journey");
    showToast("Connected to Live Bay 03 CCTV & WhatsApp Approval Hub!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[#e4e3db] flex flex-col max-h-[94vh]">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] text-white p-4 flex items-center justify-between border-b border-[#1b3a60]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3395ff] flex items-center justify-center font-black text-white text-[16px] shadow-sm">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-[14px]">Razorpay Trusted Checkout</h3>
                <span className="bg-[#3395ff]/30 text-[#8cc6ff] text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                  Secured
                </span>
              </div>
              <p className="text-[11px] text-white/70">Paying to: Apni Workshop Mobility Pvt Ltd</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (paymentSuccess) {
                handleGoHome();
              } else {
                closeModal("razorpay");
              }
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount Due Bar */}
        <div className="bg-[#f6f4ec] px-4 py-3 flex items-center justify-between border-b border-[#e4e3db]">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#707a6c] uppercase font-bold tracking-wider">
                {paymentSuccess ? "Amount Paid" : "Amount Due"}
              </span>
              {appliedCoupon && (
                <span className="text-[9px] font-bold bg-[#cbffc2] text-[#005312] px-1.5 py-0.2 rounded-full">
                  {appliedCoupon.code} (-₹{appliedCoupon.discountAmount})
                </span>
              )}
            </div>
            <span className="block text-[11px] text-[#40493d]">Booking Ref: {bookingInfo.bookingId}</span>
          </div>
          <span className="font-numeric-plate font-extrabold text-[22px] text-[#0d631b]">
            ₹{totalPayable.toLocaleString()}
          </span>
        </div>

        {paymentSuccess ? (
          /* PAYMENT SUCCESSFUL SCREEN WITH 2 WORKING ACTION OPTIONS */
          <div className="p-5 space-y-4 overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#cbffc2] text-[#005312] flex items-center justify-center mx-auto shadow-sm ring-4 ring-[#0d631b]/20">
                <CheckCircle2 size={38} className="text-[#005312]" />
              </div>
              <h4 className="font-extrabold text-[19px] text-[#1b1c17] leading-tight">
                Payment Verified & Booking Locked!
              </h4>
              <p className="text-[12px] text-[#40493d]">
                Bay 03 reserved at <strong>{selectedGarage.name}</strong> for your <strong>{vehicle.name}</strong>.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#f6f4ec] p-3.5 rounded-2xl border border-[#e4e3db] space-y-2 font-mono text-[11px]">
              <div className="flex justify-between text-[#707a6c]">
                <span>Payment ID:</span>
                <span className="text-[#1b1c17] font-bold">{paymentDetails?.paymentId || "pay_rzp_890123"}</span>
              </div>
              <div className="flex justify-between text-[#707a6c]">
                <span>Order ID:</span>
                <span className="text-[#1b1c17] font-bold">{paymentDetails?.orderId || "order_APN849201"}</span>
              </div>
              <div className="flex justify-between text-[#707a6c]">
                <span>Slot / Schedule:</span>
                <span className="text-[#0d631b] font-bold font-sans">
                  {bookingInfo.date || "Today"} • {bookingInfo.timeSlot?.split(" ")[0] || "Morning"}
                </span>
              </div>
              <div className="flex justify-between text-[#707a6c]">
                <span>Security Status:</span>
                <span className="text-[#0d631b] font-bold font-sans flex items-center gap-1">
                  <ShieldCheck size={13} />
                  Escrow Protected
                </span>
              </div>
            </div>

            {/* TWO EXPLICIT REQUIRED ACTION OPTIONS */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[11px] font-bold text-[#707a6c] uppercase tracking-wider block text-center">
                Where would you like to go next?
              </span>

              {/* Option 1: Go to Live Bay Tracker and Approval Hub */}
              <button
                type="button"
                onClick={handleGoTrackerAndApprovalHub}
                className="w-full py-3.5 px-4 rounded-2xl btn-tactile-green font-bold text-[13px] flex items-center justify-between shadow-md active:scale-98 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Activity size={18} />
                  </div>
                  <div>
                    <span className="block leading-tight font-extrabold text-[13px]">
                      Go to Live Bay Tracker & Approval Hub
                    </span>
                    <span className="text-[10px] text-[#cbffc2] block opacity-90">
                      Watch Bay 03 CCTV, OBD-II & 1-Tap Approvals
                    </span>
                  </div>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Option 2: Go to Home */}
              <button
                type="button"
                onClick={handleGoHome}
                className="w-full py-3 px-4 rounded-2xl bg-[#ffffff] hover:bg-[#f6f4ec] text-[#1b1c17] font-bold text-[13px] flex items-center justify-between border-2 border-[#e4e3db] hover:border-[#0d631b] active:scale-98 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-xl bg-[#f0eee6] flex items-center justify-center text-[#40493d]">
                    <Home size={18} />
                  </div>
                  <div>
                    <span className="block leading-tight font-bold text-[13px]">
                      Go to Home
                    </span>
                    <span className="text-[10px] text-[#707a6c] block">
                      Explore services & garage network
                    </span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#707a6c] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          /* PAYMENT METHOD SELECTION & GATEWAY INTERACTION */
          <div className="p-4 space-y-4 overflow-y-auto">
            {errorMessage && (
              <div className="p-3 bg-[#ffdad6] text-[#93000a] rounded-xl border border-[#ffb4ab] text-[12px] flex items-start gap-2">
                <AlertCircle size={18} className="shrink-0 text-[#ba1a1a]" />
                <div className="flex-1 font-semibold">{errorMessage}</div>
              </div>
            )}

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-5 gap-1 bg-[#f0eee6] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedMethod("upi")}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                  selectedMethod === "upi" ? "bg-white text-[#0c2340] shadow-xs" : "text-[#707a6c]"
                }`}
              >
                <Smartphone size={15} className="mb-0.5" />
                <span>UPI</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("card")}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                  selectedMethod === "card" ? "bg-white text-[#0c2340] shadow-xs" : "text-[#707a6c]"
                }`}
              >
                <CreditCard size={15} className="mb-0.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("netbanking")}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                  selectedMethod === "netbanking" ? "bg-white text-[#0c2340] shadow-xs" : "text-[#707a6c]"
                }`}
              >
                <Building size={15} className="mb-0.5" />
                <span>NetBank</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("emi")}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                  selectedMethod === "emi" ? "bg-white text-[#0c2340] shadow-xs" : "text-[#707a6c]"
                }`}
              >
                <Sparkles size={15} className="mb-0.5" />
                <span>EMI</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("cod")}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                  selectedMethod === "cod" ? "bg-white text-[#0c2340] shadow-xs" : "text-[#707a6c]"
                }`}
              >
                <Store size={15} className="mb-0.5" />
                <span>Pay at Bay</span>
              </button>
            </div>

            {selectedMethod === "upi" && (
              <div className="space-y-3">
                {/* Live Dynamic UPI QR Code Container */}
                <div className="p-3.5 bg-[#f6f4ec] rounded-2xl border border-[#e4e3db] flex flex-col items-center justify-center text-center space-y-2.5">
                  <div className="flex items-center justify-between w-full px-1">
                    <span className="text-[10px] font-bold text-[#707a6c] uppercase tracking-wider flex items-center gap-1">
                      <QrCode size={13} />
                      Live NPCI UPI QR Code
                    </span>
                    <span className="text-[10px] font-bold text-[#0d631b] bg-[#cbffc2] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#005312] animate-pulse"></span>
                      Ready to Scan
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-[#e4e3db] relative group">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `upi://pay?pa=${upiIdInput.includes("@") ? upiIdInput : "apniworkshop@upi"}&pn=Apni%20Workshop%20Mobility&am=${totalPayable}&tn=Booking%20${bookingInfo.bookingId}&cu=INR`
                      )}`}
                      alt="Live Razorpay UPI QR Code"
                      className="w-40 h-40 object-contain"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#0d631b] font-bold">
                    <span>Pay to VPA:</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-[#e4e3db] text-[#111a13]">
                      {upiIdInput.includes("@") ? upiIdInput : "apniworkshop@upi"}
                    </span>
                  </div>

                  {/* Quick Action Buttons for QR */}
                  <div className="flex items-center gap-2 w-full pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const upiUri = `upi://pay?pa=${upiIdInput.includes("@") ? upiIdInput : "apniworkshop@upi"}&pn=Apni%20Workshop&am=${totalPayable}&tn=Booking%20${bookingInfo.bookingId}&cu=INR`;
                        navigator.clipboard?.writeText(upiUri);
                        showToast("📋 UPI payment intent link copied to clipboard!");
                      }}
                      className="flex-1 py-1.5 px-2 bg-white hover:bg-[#f0eee6] border border-[#e4e3db] text-[#1b1c17] rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Copy size={13} className="text-[#707a6c]" />
                      <span>Copy UPI Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        showToast("🔍 Verifying UPI transaction status on NPCI network...");
                        handlePayNow();
                      }}
                      className="flex-1 py-1.5 px-2 bg-[#0d631b] hover:bg-[#005312] text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      <span>I Have Paid</span>
                    </button>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-[#1b1c17] block">Or Launch Native App on Phone:</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "gpay", name: "Google Pay", color: "bg-[#4285F4]" },
                    { id: "phonepe", name: "PhonePe", color: "bg-[#5f259f]" },
                    { id: "paytm", name: "Paytm UPI", color: "bg-[#00baf2]" },
                    { id: "cred", name: "CRED UPI", color: "bg-[#000000]" },
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => {
                        setSelectedUpiApp(app.id);
                        const deepLink = `upi://pay?pa=${upiIdInput.includes("@") ? upiIdInput : "apniworkshop@upi"}&pn=Apni%20Workshop&am=${totalPayable}&tn=Booking%20${bookingInfo.bookingId}&cu=INR`;
                        try {
                          window.location.href = deepLink;
                        } catch {
                          // Fallback
                        }
                        showToast(`Launching ${app.name} to complete payment...`);
                        handlePayNow();
                      }}
                      className="p-2.5 rounded-xl border border-[#e4e3db] bg-white hover:bg-[#f6f4ec] active:scale-95 flex items-center gap-2.5 transition-all text-left shadow-2xs cursor-pointer"
                    >
                      <div className={`w-7 h-7 rounded-lg ${app.color} text-white font-black text-[10px] flex items-center justify-center shrink-0`}>
                        {app.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-[#1b1c17]">{app.name}</span>
                        <span className="text-[9px] text-[#0d631b] font-bold">1-Tap Express Pay</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-semibold text-[#707a6c]">
                    Customize Merchant / Recipient UPI VPA
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="e.g. yourbusiness@okaxis or yourname@upi"
                      className="flex-1 p-2.5 bg-[#f6f4ec] rounded-xl text-[12px] font-mono border border-[#e4e3db] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        showToast(`✅ QR Code updated to receive payments at ${upiIdInput}`);
                      }}
                      className="px-3 py-2.5 rounded-xl bg-[#0c2340] text-white font-bold text-[11px] hover:bg-[#13335c] transition-colors cursor-pointer"
                    >
                      Update QR
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === "card" && (
              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Card Number (XXXX XXXX XXXX XXXX)"
                  defaultValue="4532 8901 2345 6789"
                  className="w-full p-2.5 bg-[#f6f4ec] rounded-xl text-[12px] font-mono border border-[#e4e3db] outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    defaultValue="08/29"
                    className="p-2.5 bg-[#f6f4ec] rounded-xl text-[12px] font-mono border border-[#e4e3db] outline-none"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    defaultValue="891"
                    maxLength={3}
                    className="p-2.5 bg-[#f6f4ec] rounded-xl text-[12px] font-mono border border-[#e4e3db] outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  defaultValue="VIKRAM MALHOTRA"
                  className="w-full p-2.5 bg-[#f6f4ec] rounded-xl text-[12px] uppercase border border-[#e4e3db] outline-none"
                />
              </div>
            )}

            {selectedMethod === "netbanking" && (
              <div className="grid grid-cols-2 gap-2">
                {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank"].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => {
                      showToast(`Selected ${bank} for NetBanking checkout.`);
                      handlePayNow();
                    }}
                    className="p-3 rounded-xl border border-[#e4e3db] bg-white text-[12px] font-semibold text-left hover:border-[#3395ff] cursor-pointer"
                  >
                    {bank}
                  </button>
                ))}
              </div>
            )}

            {selectedMethod === "emi" && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#1b1c17] block">No-Cost EMI & Pay Later Partners:</span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast("Bajaj Finserv No-Cost EMI Selected (₹" + Math.round(totalPayable / 3) + "/mo for 3 Months)");
                      handlePayNow();
                    }}
                    className="p-3 rounded-xl border border-[#3395ff] bg-[#f0f7ff] text-left flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="text-[12px] font-extrabold text-[#0c2340]">Bajaj Finserv Insta EMI Card</div>
                      <div className="text-[10px] text-[#707a6c]">0% Interest • ₹{Math.round(totalPayable / 3).toLocaleString()}/mo for 3 Months</div>
                    </div>
                    <span className="bg-[#3395ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">Instant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showToast("ZestMoney Pay Later Selected");
                      handlePayNow();
                    }}
                    className="p-2.5 rounded-xl border border-[#e4e3db] bg-white text-left hover:border-[#3395ff] flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="text-[12px] font-bold text-[#1b1c17]">ZestMoney / Simpl Pay Later</div>
                      <div className="text-[10px] text-[#707a6c]">Buy Now, Pay in 15 days at 0 extra fee</div>
                    </div>
                    <span className="text-[11px] font-bold text-[#0c2340]">0% Fee</span>
                  </button>
                </div>
              </div>
            )}

            {selectedMethod === "cod" && (
              <div className="bg-[#fcfaf2] p-3.5 rounded-xl border border-[#e8e2c8] space-y-2 text-[#484224]">
                <div className="flex items-center gap-2 text-[#0c2340] font-bold text-[12px]">
                  <HandCoins size={20} className="text-[#0d631b]" />
                  <span>Pay Cash / UPI at Doorstep or Workshop</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#707a6c]">
                  Pay <strong>₹{totalPayable.toLocaleString()}</strong> in cash or via QR code directly to our driver/technician after your vehicle test-drive & post-service inspection.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0d631b]">
                  <CheckCircle2 size={14} />
                  <span>Zero Advance Needed • 100% Satisfaction Guaranteed</span>
                </div>
              </div>
            )}

            {/* Escrow Shield Info */}
            <div className="bg-[#f0f7ff] p-3 rounded-xl border border-[#cbe2ff] flex items-start gap-2.5 text-[11px] text-[#004880]">
              <ShieldCheck size={18} className="text-[#0066b3] shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-[#003366]">Apni Escrow Protection</strong>
                Your payment is securely held until you inspect and approve the completed service at your doorstep.
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="w-full h-12 rounded-xl bg-[#0c2340] hover:bg-[#13335c] text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all disabled:opacity-75 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Connecting to Gateway...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Pay ₹{totalPayable.toLocaleString()} via Razorpay</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

