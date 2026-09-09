import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Vehicle } from "../types";

export const WelcomeScreen: React.FC = () => {
  const { loginCustomer, setUserRole, setCurrentScreen, showToast } = useApp();

  const [step, setStep] = useState<"details" | "otp">("details");
  const [plate, setPlate] = useState("DL 4C BE 1081");
  const [name, setName] = useState("Raghav Kapoor");
  const [mobile, setMobile] = useState("9876543210");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isLookingUpVahan, setIsLookingUpVahan] = useState(false);
  const [vahanFullData, setVahanFullData] = useState<Vehicle | null>(null);
  const [vahanPreview, setVahanPreview] = useState<{
    name: string;
    model: string;
    fuelType: string;
    rto: string;
    imageUrl?: string;
    verified: boolean;
  } | null>({
    name: "Kia Motors India",
    model: "Seltos G1.5 HTK Plus",
    fuelType: "PETROL (BS-VI)",
    rto: "DL04 (North East Delhi, Delhi)",
    imageUrl:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Kia_Seltos_SP2_PE_Snow_White_Pearl_%2817%29_%28cropped%29.jpg/960px-Kia_Seltos_SP2_PE_Snow_White_Pearl_%2817%29_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    verified: true,
  });

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [smsSimulated, setSmsSimulated] = useState(false);

  // Countdown for OTP
  useEffect(() => {
    let interval: any;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Vahan RC Auto-lookup when plate changes
  const handleLookupPlate = async (plateToQuery: string) => {
    const clean = plateToQuery.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (clean.length < 5) return;
    setIsLookingUpVahan(true);
    try {
      const res = await fetch("/api/vahan/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate: clean }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setVahanFullData(json.data);
        setVahanPreview({
          name: json.data.name || "Verified Vehicle",
          model: json.data.model || "Passenger Car",
          fuelType: json.data.fuelType || "PETROL (BS-VI)",
          rto: json.data.rto || "Regional Transport Office",
          imageUrl: json.data.imageUrl,
          verified: true,
        });
        showToast(`Vehicle verified: ${json.data.makeModel || json.data.name}`);
      }
    } catch (e) {
      console.warn("Vahan lookup error:", e);
    } finally {
      setIsLookingUpVahan(false);
    }
  };

  const handleSendOtp = async (channel: "whatsapp" | "sms" = "whatsapp") => {
    if (!plate.trim()) {
      showToast("Please enter your vehicle registration number.");
      return;
    }
    if (!name.trim()) {
      showToast("Please enter your full name.");
      return;
    }
    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length < 10) {
      showToast("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setOtp(["", "", "", "", "", ""]);
    setStep("otp");
    setTimer(30);
    setCanResend(false);
    setIsSendingOtp(true);

    try {
      await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: cleanMobile, name, plate, otpCode: randomOtp }),
      });
      setSmsSimulated(true);

      if (channel === "whatsapp") {
        const msg = encodeURIComponent(
          `🚗 *Apni Workshop Security Verification*\n\nNamaste ${name},\nYour Live Security Verification OTP is: *${randomOtp}*\n\nVehicle: ${plate}\nValid for 10 minutes.`
        );
        const waUrl = `https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${msg}`;
        const link = document.createElement("a");
        link.href = waUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Opening WhatsApp for +91 ${cleanMobile} with OTP`);
      } else {
        showToast(`Live OTP dispatched for +91 ${cleanMobile}`);
      }
    } catch {
      setSmsSimulated(true);
      showToast(`Live OTP generated: ${randomOtp}`);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSendWhatsAppOtp = async () => {
    const cleanMobile = mobile.replace(/\D/g, "");
    if (!generatedOtp) return;
    setIsSendingOtp(true);
    try {
      await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: cleanMobile, name, plate, otpCode: generatedOtp }),
      });
      const msg = encodeURIComponent(
        `🚗 *Apni Workshop Security Verification*\n\nNamaste ${name},\nYour Live Security Verification OTP is: *${generatedOtp}*\n\nVehicle: ${plate}\nValid for 10 minutes.`
      );
      const waUrl = `https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${msg}`;
      const link = document.createElement("a");
      link.href = waUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Opening WhatsApp for +91 ${cleanMobile}`);
    } catch {
      showToast(`OTP ready: ${generatedOtp}`);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    const cleanMobile = mobile.replace(/\D/g, "");
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtp(["", "", "", "", "", ""]);
    setTimer(30);
    setCanResend(false);
    setIsSendingOtp(true);

    try {
      await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: cleanMobile, name, plate, otpCode: newOtp }),
      });
      setSmsSimulated(true);
      showToast(`New Live OTP sent in background to +91 ${cleanMobile}`);
    } catch {
      setSmsSimulated(true);
      showToast(`New OTP generated for +91 ${cleanMobile}`);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = () => {
    const entered = otp.join("");
    if (entered.length < 6) {
      showToast("Please enter the complete 6-digit OTP.");
      return;
    }
    if (entered !== generatedOtp) {
      showToast(`❌ Incorrect OTP code. Please enter the 6-digit code sent to +91 ${mobile}.`);
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const partialCar: Partial<Vehicle> = vahanFullData
        ? vahanFullData
        : {
            name: vahanPreview?.name || "Kia Motors",
            model: vahanPreview?.model || "Seltos G1.5 HTK Plus",
            fuelType: vahanPreview?.fuelType || "PETROL (BS-VI)",
            rto: vahanPreview?.rto || "DL04 Delhi",
            imageUrl: vahanPreview?.imageUrl,
          };
      loginCustomer(name, mobile, plate, partialCar);
      showToast(`Welcome ${name}! Vehicle ${plate} connected with live bay stream.`);
    }, 600);
  };

  const handleQuickPlateSelect = (presetPlate: string) => {
    setPlate(presetPlate);
    handleLookupPlate(presetPlate);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fbf9f1] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Decorative background radial gradients */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#91f78e]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#0d631b]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-[#e4e3db] shadow-xl p-6 sm:p-8 relative z-10 transition-all">
        {/* Brand Banner */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0d631b] text-white flex items-center justify-center shadow-md shadow-[#0d631b]/20">
              <span className="material-symbols-outlined text-[28px]">garage_home</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-[20px] font-black tracking-tight text-[#1b1c17] leading-none">
                  Apni Workshop
                </h1>
                <span className="px-1.5 py-0.5 rounded-full bg-[#91f78e]/30 text-[#005312] text-[9px] font-black uppercase tracking-wider">
                  Live Bay
                </span>
              </div>
              <p className="text-[12px] text-[#707a6c] font-medium mt-0.5">
                India's 1st Transparent Live Bay Network
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-[#0d631b] bg-[#f0eee6] px-2 py-0.5 rounded-full border border-[#e4e3db]">
              MoRTH Vahan 4.0
            </span>
          </div>
        </div>

        {step === "details" ? (
          <div>
            <div className="mb-5">
              <h2 className="text-[18px] font-bold text-[#1b1c17]">
                Welcome! Enter your details
              </h2>
              <p className="text-[13px] text-[#40493d] mt-1 leading-relaxed">
                Connect your vehicle with real-time Vahan telematics and live workshop bay tracking.
              </p>
              {/* Quality & Live Bay Assurance banner */}
              <div className="mt-3 bg-[#f0f8ef] rounded-xl p-2.5 border border-[#c8e6c9] flex items-center justify-between text-[11px] text-[#2e4c27]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#0d631b] text-[16px]">verified</span>
                  <span><strong>100% Transparent Live Bay</strong> servicing across Delhi NCR</span>
                </div>
                <span className="text-[10px] font-bold text-[#0d631b] bg-[#cbffc2] px-1.5 py-0.5 rounded">
                  OEM Certified
                </span>
              </div>
            </div>

            {/* Input Form */}
            <div className="space-y-4">
              {/* Number Plate Field */}
              <div>
                <label className="block text-[12px] font-bold text-[#40493d] mb-1.5 uppercase tracking-wider">
                  Vehicle Registration Number (Plate)
                </label>
                <div className="relative flex items-center">
                  {/* IND Flag Strip */}
                  <div className="absolute left-2.5 flex items-center gap-1 bg-[#003399] text-white text-[10px] font-black px-1.5 py-1 rounded-sm shadow-xs select-none">
                    <span>IND</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff9933]"></span>
                  </div>
                  <input
                    type="text"
                    value={plate}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setPlate(val);
                      if (val.replace(/[^A-Z0-9]/g, "").length >= 9) {
                        handleLookupPlate(val);
                      }
                    }}
                    placeholder="UP 16 DJ 8008"
                    className="w-full pl-16 pr-24 py-3 bg-[#fbf9f1] border-2 border-[#e4e3db] focus:border-[#0d631b] rounded-xl text-[16px] font-black tracking-widest text-[#1b1c17] outline-none transition-all placeholder:text-[#a0a89d]"
                  />
                  <button
                    type="button"
                    onClick={() => handleLookupPlate(plate)}
                    disabled={isLookingUpVahan}
                    className="absolute right-2 px-2.5 py-1 rounded-lg bg-[#0d631b] text-white text-[11px] font-bold hover:bg-[#094813] transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                  >
                    {isLookingUpVahan ? (
                      <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px]">search</span>
                    )}
                    <span>Verify</span>
                  </button>
                </div>

                {/* Quick select plate presets */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-[#707a6c] font-medium text-[10px]">Quick Try:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickPlateSelect("DL 4C BE 1081")}
                    className="px-2 py-0.5 rounded-md bg-[#e2f3e1] hover:bg-[#c8e6c9] text-[#0d631b] font-bold transition-colors whitespace-nowrap"
                  >
                    DL 4C BE 1081 (Kia Seltos)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPlateSelect("UP 16 DJ 8008")}
                    className="px-2 py-0.5 rounded-md bg-[#f0eee6] hover:bg-[#e4e3db] text-[#1b1c17] font-bold transition-colors whitespace-nowrap"
                  >
                    UP 16 DJ 8008 (Creta)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPlateSelect("HR 26 DK 8812")}
                    className="px-2 py-0.5 rounded-md bg-[#f0eee6] hover:bg-[#e4e3db] text-[#1b1c17] font-bold transition-colors whitespace-nowrap"
                  >
                    HR 26 DK 8812 (Thar)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPlateSelect("KA 01 MJ 4920")}
                    className="px-2 py-0.5 rounded-md bg-[#f0eee6] hover:bg-[#e4e3db] text-[#1b1c17] font-bold transition-colors whitespace-nowrap"
                  >
                    KA 01 MJ 4920 (Nexon)
                  </button>
                </div>

                {/* Vahan live verification chip */}
                {vahanPreview && (
                  <div className="mt-2.5 p-2.5 bg-[#f0eee6]/80 rounded-xl border border-[#e4e3db] flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2.5">
                      {vahanPreview.imageUrl ? (
                        <img
                          src={vahanPreview.imageUrl}
                          alt={vahanPreview.name}
                          className="w-12 h-10 object-cover rounded-lg border border-[#e4e3db] shadow-xs"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[#0d631b] text-[18px]">verified</span>
                      )}
                      <div>
                        <div className="font-bold text-[#1b1c17] flex items-center gap-1">
                          <span>{vahanPreview.name}</span>
                          <span className="text-[10px] text-[#707a6c] font-normal">{vahanPreview.model}</span>
                        </div>
                        <div className="text-[10px] text-[#707a6c]">{vahanPreview.fuelType} • {vahanPreview.rto}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-[#005312] bg-[#a3f69c]/50 px-1.5 py-0.5 rounded shrink-0">
                      RC Grounded
                    </span>
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[12px] font-bold text-[#40493d] mb-1.5 uppercase tracking-wider">
                  Owner / Customer Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707a6c] text-[20px]">
                    person
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full pl-11 pr-4 py-3 bg-[#fbf9f1] border border-[#e4e3db] focus:border-[#0d631b] rounded-xl text-[14px] font-semibold text-[#1b1c17] outline-none transition-all placeholder:text-[#a0a89d]"
                  />
                </div>
              </div>

              {/* Mobile Number with +91 */}
              <div>
                <label className="block text-[12px] font-bold text-[#40493d] mb-1.5 uppercase tracking-wider">
                  Mobile Number (For Live Bay SMS & OTP)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-[#1b1c17] font-bold text-[14px] select-none border-r border-[#e4e3db] pr-2.5">
                    <span className="text-[16px]">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    placeholder="98765 43210"
                    className="w-full pl-24 pr-4 py-3 bg-[#fbf9f1] border border-[#e4e3db] focus:border-[#0d631b] rounded-xl text-[15px] font-bold tracking-wider text-[#1b1c17] outline-none transition-all placeholder:text-[#a0a89d]"
                  />
                </div>
                <p className="text-[11px] text-[#707a6c] mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-[#0d631b]">lock</span>
                  You will receive a 6-digit OTP to authenticate securely.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => handleSendOtp("whatsapp")}
                  disabled={isSendingOtp}
                  className="py-3 px-4 rounded-xl bg-[#25d366] text-white font-bold text-[13px] hover:bg-[#20ba59] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>Get OTP on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendOtp("sms")}
                  disabled={isSendingOtp}
                  className="py-3 px-4 rounded-xl bg-[#0d631b] text-white font-bold text-[13px] hover:bg-[#094813] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">sms</span>
                  <span>Get OTP via SMS</span>
                </button>
              </div>
            </div>

            {/* Switch to Workshop partner login */}
            <div className="mt-6 pt-5 border-t border-[#e4e3db] text-center">
              <p className="text-[12px] text-[#707a6c] mb-2 font-medium">
                Are you an authorized workshop or mechanic technician?
              </p>
              <button
                type="button"
                onClick={() => {
                  setUserRole("workshop");
                  setCurrentScreen("workshop_dashboard");
                  showToast("Switched to Workshop Partner role.");
                }}
                className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0d631b] hover:underline bg-[#f0eee6] px-3.5 py-1.5 rounded-full border border-[#e4e3db]"
              >
                <span className="material-symbols-outlined text-[16px]">storefront</span>
                <span>Enter as Workshop Partner (Sharma Auto Care)</span>
              </button>
            </div>
          </div>
        ) : (
          /* OTP Screen */
          <div>
            {/* Simulated SMS Notification Popup */}
            {smsSimulated && (
              <div className="mb-4 p-3 bg-[#1b1c17] text-white rounded-2xl shadow-xl border border-[#40493d] flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0d631b] flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[16px]">sms</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#91f78e]">SMS from APNI-OTP</div>
                    <div className="text-[12px] font-medium text-[#e4e3db]">
                      Your OTP is <strong className="text-white font-black text-[14px] tracking-widest">{generatedOtp}</strong>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtp(generatedOtp.split(""));
                    showToast("OTP Auto-filled!");
                  }}
                  className="px-2.5 py-1 bg-[#91f78e] text-[#005312] text-[11px] font-black rounded-lg hover:bg-[#a3f69c] transition-colors"
                >
                  Auto Fill
                </button>
              </div>
            )}

            <div className="mb-5">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="inline-flex items-center gap-1 text-[12px] font-bold text-[#707a6c] hover:text-[#1b1c17] mb-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Edit Mobile / Details</span>
              </button>
              <h2 className="text-[18px] font-bold text-[#1b1c17]">
                Enter 6-Digit OTP
              </h2>
              <p className="text-[13px] text-[#40493d] mt-1">
                We sent a verification code to <strong className="text-[#1b1c17]">+91 {mobile}</strong> for car <span className="font-bold text-[#0d631b]">{plate}</span>.
              </p>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex items-center justify-between gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const newOtp = [...otp];
                    newOtp[index] = val;
                    setOtp(newOtp);

                    if (val && index < 5) {
                      const nextInput = document.getElementById(`otp-input-${index + 1}`);
                      nextInput?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[index] && index > 0) {
                      const prevInput = document.getElementById(`otp-input-${index - 1}`);
                      prevInput?.focus();
                    }
                  }}
                  className="w-12 h-14 text-center bg-[#fbf9f1] border-2 border-[#e4e3db] focus:border-[#0d631b] rounded-xl text-[20px] font-black text-[#1b1c17] outline-none transition-all focus:shadow-md"
                />
              ))}
            </div>

            {/* Resend Timer & WhatsApp Dispatch */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#707a6c]">
                  {timer > 0 ? (
                    <>Resend code in <strong className="text-[#1b1c17]">{timer}s</strong></>
                  ) : (
                    "Didn't receive SMS?"
                  )}
                </span>
                <button
                  type="button"
                  disabled={!canResend}
                  onClick={handleResendOtp}
                  className={`font-bold transition-colors ${
                    canResend ? "text-[#0d631b] hover:underline cursor-pointer" : "text-[#a0a89d] cursor-not-allowed"
                  }`}
                >
                  Resend SMS OTP
                </button>
              </div>

              <a
                href={`https://api.whatsapp.com/send?phone=91${mobile.replace(/\D/g, "")}&text=${encodeURIComponent(
                  `🚗 *Apni Workshop Security Verification*\n\nNamaste ${name},\nYour Live Security Verification OTP is: *${generatedOtp}*\n\nVehicle: ${plate}\nValid for 10 minutes.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#25d366] text-white font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-[#20ba59] active:scale-95 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Open OTP in WhatsApp (+91 {mobile})</span>
              </a>

              <p className="text-[11px] text-[#707a6c] text-center leading-relaxed">
                Cellular SMS delivery requires telecom DLT gateway keys. For immediate testing, open WhatsApp above or tap "Auto Fill".
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying}
              className="w-full py-3.5 px-6 rounded-xl bg-[#0d631b] text-white font-bold text-[15px] shadow-lg shadow-[#0d631b]/20 hover:bg-[#094813] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isVerifying ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  <span>Verifying Vahan Profile...</span>
                </>
              ) : (
                <>
                  <span>Verify & Enter Apni Workshop</span>
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Feature guarantee pill */}
        <div className="mt-6 pt-4 border-t border-[#e4e3db] flex items-center justify-around text-center text-[10px] text-[#707a6c] font-semibold">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[#0d631b] text-[14px]">videocam</span>
            <span>Live Bay Camera</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[#0d631b] text-[14px]">verified_user</span>
            <span>100% Genuine OEM</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[#0d631b] text-[14px]">price_check</span>
            <span>Transparent Bill</span>
          </div>
        </div>
      </div>
    </div>
  );
};
