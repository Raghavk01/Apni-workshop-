import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { db, auth } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export const CustomerSupportModal: React.FC = () => {
  const { isModalOpen, closeModal, vehicle, bookingInfo, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<"ai" | "ticket" | "faq">("ai");
  const [queryInput, setQueryInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: `Hello! I am your 24x7 Apni Workshop AI Service Advisor. How can I help you regarding your ${vehicle.name} (${vehicle.plate}) today?`,
    },
  ]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Ticket state
  const [ticketCategory, setTicketCategory] = useState("Service & Live Bay");
  const [ticketDescription, setTicketDescription] = useState("");
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!isModalOpen.customerSupport) return null;

  const handleSendAiMessage = async (textToSend?: string) => {
    const text = textToSend || queryInput;
    if (!text.trim() || isLoadingAi) return;

    const newMessages = [...chatMessages, { role: "user" as const, text }];
    setChatMessages(newMessages);
    setQueryInput("");
    setIsLoadingAi(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role === "user" ? "user" : "model",
            content: m.text,
          })),
          context: {
            vehicle: `${vehicle.name} ${vehicle.model} (${vehicle.plate})`,
            status: "Service Bay Active / Customer Support Desk",
            bookingId: bookingInfo.bookingId,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setChatMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Our dedicated Service Advisor team is available 24x7 on WhatsApp (+91 99111 69253). We are ready to assist you right away!",
          },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Our support hotline +91 99111 69253 is active. You can also tap WhatsApp below for immediate 1-tap support.",
        },
      ]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDescription.trim()) {
      showToast("Please describe your issue or query.");
      return;
    }

    setIsSubmittingTicket(true);
    const ticketId = "TKT-" + Math.floor(10000 + Math.random() * 90000);

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, "support_tickets", ticketId), {
          ticketId,
          userId: auth.currentUser.uid,
          vehiclePlate: vehicle.plate,
          vehicleName: vehicle.name,
          bookingId: bookingInfo.bookingId,
          category: ticketCategory,
          description: ticketDescription,
          status: "open",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("Firestore support ticket save error:", err);
    }

    setTimeout(() => {
      setIsSubmittingTicket(false);
      setSubmittedTicketId(ticketId);
      showToast(`Support Ticket ${ticketId} created! Advisor will contact you.`);
    }, 600);
  };

  const handleWhatsAppDirect = () => {
    const message = encodeURIComponent(
      `Hi Apni Workshop Support! I need assistance with my car ${vehicle.name} (${vehicle.plate}). Booking ID: ${bookingInfo.bookingId}.`
    );
    window.open(`https://wa.me/919911169253?text=${message}`, "_blank");
  };

  const faqs = [
    {
      q: "How does the Live Bay Tracker camera work?",
      a: "Our certified workshop bays are equipped with HD camera feeds and real-time step logging. As technicians inspect, flush fluids, or fit parts, time-stamped photo & video logs update in your live stream.",
    },
    {
      q: "Are the replacement parts 100% genuine OEM?",
      a: "Yes! Every single part fitted at Apni Workshop partner garages is 100% genuine OEM/OES with official manufacturer packaging, barcode verification, and a 6-month/10,000 KM warranty.",
    },
    {
      q: "How do work approvals work if extra repairs are found?",
      a: "No surprise bills ever! If our head technician notices worn components (e.g. brake pads), an itemized approval card appears in your app. The garage will only proceed when you tap 'Approve'.",
    },
    {
      q: "Is doorstep pickup and delivery free?",
      a: "Yes, doorstep pickup and drop is complimentary across Delhi NCR for all Periodic and Comprehensive service packages.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#e4e3db] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e4e3db] flex items-center justify-between bg-[#fbf9f1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0d631b] text-white flex items-center justify-center shadow-md shadow-[#0d631b]/20">
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-[16px] text-[#1b1c17] leading-tight">
                  Customer Support & Helpdesk
                </h3>
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#91f78e]/30 text-[#005312] text-[9px] font-black uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d631b] animate-pulse"></span>
                  24x7 Live
                </span>
              </div>
              <p className="text-[11px] text-[#707a6c] font-medium">
                Car: <strong className="text-[#1b1c17]">{vehicle.plate}</strong> • Booking: {bookingInfo.bookingId.slice(0, 12)}
              </p>
            </div>
          </div>

          <button
            onClick={() => closeModal("customerSupport")}
            className="w-9 h-9 rounded-full bg-[#f0eee6] hover:bg-[#e4e3db] flex items-center justify-center text-[#40493d] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Quick Contact Action Bar */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-[#f0eee6]/60 border-b border-[#e4e3db]">
          <button
            type="button"
            onClick={handleWhatsAppDirect}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#25d366] text-white font-bold text-[12px] shadow-xs hover:bg-[#20ba59] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>WhatsApp (+91 99111 69253)</span>
          </button>
          <a
            href="tel:+919911169253"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#0d631b] text-white font-bold text-[12px] shadow-xs hover:bg-[#094813] active:scale-95 transition-all text-center"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Call Helpline</span>
          </a>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e4e3db] bg-[#fbf9f1] px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab("ai")}
            className={`pb-2.5 px-3 text-[12px] font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "ai"
                ? "border-[#0d631b] text-[#0d631b]"
                : "border-transparent text-[#707a6c] hover:text-[#1b1c17]"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            <span>AI Advisor</span>
          </button>
          <button
            onClick={() => setActiveTab("ticket")}
            className={`pb-2.5 px-3 text-[12px] font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "ticket"
                ? "border-[#0d631b] text-[#0d631b]"
                : "border-transparent text-[#707a6c] hover:text-[#1b1c17]"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
            <span>Raise Ticket</span>
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`pb-2.5 px-3 text-[12px] font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "faq"
                ? "border-[#0d631b] text-[#0d631b]"
                : "border-transparent text-[#707a6c] hover:text-[#1b1c17]"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">help</span>
            <span>FAQs & Policy</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: AI Advisor & Live Queries */}
          {activeTab === "ai" && (
            <div className="flex flex-col h-full min-h-[280px]">
              {/* Quick suggestions */}
              <div className="mb-3">
                <span className="text-[10px] uppercase font-bold text-[#707a6c] tracking-wider block mb-1.5">
                  Popular Customer Queries:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Why are brake pads recommended?",
                    "What is my service ETA?",
                    "Explain parts warranty",
                    "Can I visit the workshop bay?",
                  ].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendAiMessage(q)}
                      className="px-2.5 py-1 rounded-full bg-[#f0eee6] hover:bg-[#e4e3db] text-[#1b1c17] text-[11px] font-medium transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-[#0d631b] text-white flex items-center justify-center flex-shrink-0 text-[14px]">
                        <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl max-w-[85%] text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#0d631b] text-white rounded-tr-none font-medium"
                          : "bg-[#f0eee6] text-[#1b1c17] rounded-tl-none border border-[#e4e3db]"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoadingAi && (
                  <div className="flex gap-2 items-center text-[#707a6c] text-[12px] italic">
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>AI Advisor Rajesh is typing...</span>
                  </div>
                )}
              </div>

              {/* Input box */}
              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-[#e4e3db]">
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendAiMessage()}
                  placeholder="Type any service query or concern..."
                  className="flex-1 px-3.5 py-2.5 bg-[#fbf9f1] border border-[#e4e3db] focus:border-[#0d631b] rounded-xl text-[13px] text-[#1b1c17] outline-none placeholder:text-[#a0a89d]"
                />
                <button
                  type="button"
                  onClick={() => handleSendAiMessage()}
                  disabled={!queryInput.trim() || isLoadingAi}
                  className="w-10 h-10 rounded-xl bg-[#0d631b] text-white flex items-center justify-center hover:bg-[#094813] transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Raise a Support Ticket */}
          {activeTab === "ticket" && (
            <div>
              {submittedTicketId ? (
                <div className="p-6 bg-[#f0eee6] rounded-2xl border border-[#e4e3db] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#91f78e] text-[#005312] flex items-center justify-center mx-auto shadow-md">
                    <span className="material-symbols-outlined text-[28px]">check_circle</span>
                  </div>
                  <h4 className="text-[16px] font-bold text-[#1b1c17]">Ticket Created Successfully!</h4>
                  <p className="text-[13px] text-[#40493d]">
                    Your reference number is <strong className="font-mono text-[#0d631b]">{submittedTicketId}</strong>.
                  </p>
                  <p className="text-[12px] text-[#707a6c]">
                    Our Senior Service Operations Manager at Sector 62 will call your mobile within 15 minutes.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedTicketId(null);
                      setTicketDescription("");
                    }}
                    className="mt-2 px-4 py-2 bg-[#0d631b] text-white text-[12px] font-bold rounded-xl"
                  >
                    Raise Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#40493d] uppercase tracking-wider mb-1">
                      Query Category
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#fbf9f1] border border-[#e4e3db] rounded-xl text-[13px] font-medium text-[#1b1c17] outline-none"
                    >
                      <option value="Service & Live Bay">Service & Live Bay Observation</option>
                      <option value="Parts & Fair Pricing">Parts & Fair Pricing Question</option>
                      <option value="Pickup & Delivery">Pickup & Delivery Logistics</option>
                      <option value="Billing & Tax Invoice">Billing, UPI & Tax Invoice</option>
                      <option value="General Support">General Automotive Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#40493d] uppercase tracking-wider mb-1">
                      Describe your query / feedback
                    </label>
                    <textarea
                      rows={3}
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      placeholder="e.g. Please check the AC cooling efficiency along with brake pad replacement..."
                      className="w-full p-3 bg-[#fbf9f1] border border-[#e4e3db] focus:border-[#0d631b] rounded-xl text-[13px] text-[#1b1c17] outline-none placeholder:text-[#a0a89d]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingTicket}
                    className="w-full py-3 bg-[#0d631b] text-white font-bold text-[13px] rounded-xl shadow-md hover:bg-[#094813] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingTicket ? (
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    )}
                    <span>Submit Query Ticket</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: FAQs */}
          {activeTab === "faq" && (
            <div className="space-y-2.5">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-[#f0eee6]/70 rounded-2xl border border-[#e4e3db] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full p-3.5 text-left font-bold text-[13px] text-[#1b1c17] flex items-center justify-between"
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined text-[18px] text-[#707a6c]">
                      {expandedFaq === index ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-3.5 pb-3.5 pt-0 text-[12px] text-[#40493d] leading-relaxed border-t border-[#e4e3db]/50 mt-1 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
