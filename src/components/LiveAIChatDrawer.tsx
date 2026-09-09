import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export const LiveAIChatDrawer: React.FC = () => {
  const { isModalOpen, closeModal, vehicle } = useApp();
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: `Namaste! I'm your Apni Workshop & Sharma Auto Care AI Lead. Your ${vehicle.name} (${vehicle.plate}) is currently undergoing bay servicing. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isModalOpen?.liveChat) return null;

  const quickPrompts = [
    "Is ₹3,200 fair for Thar front ceramic brake pads?",
    "When will my car be ready for handover?",
    "Explain what is checked in the 40-point inspection",
    "How does Apni Workshop warranty work?",
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          context: {
            vehicle: `${vehicle.name} ${vehicle.model} (${vehicle.plate})`,
            status: "Bay 03 Mechanical - New Ceramic Brake Pads Installation (Now 10:28 AM)",
            approvedWork: "Front Ceramic Brake Pad Replacement (₹3,200), Periodic Service (₹4,250)",
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              `Yes, ₹3,200 is an authentic fair market rate for Genuine ${vehicle.name.includes("PRIV") || vehicle.name.includes("LTD") ? (vehicle.model?.split(" ")[0] || "OEM") : (vehicle.name.split(" ")[0] || "OEM")} OEM Ceramic Brake Pads including labor and caliper tuning. Your car is currently on track for handover today by 12:30 PM.`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Our workshop head technician Rajesh is actively monitoring your car in Bay 03. All replaced parts come with a 30-day warranty!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end p-3 pb-safe animate-in fade-in duration-200">
      <div className="bg-[#ffffff] rounded-2xl p-4 shadow-2xl flex flex-col h-[80vh] overflow-hidden border border-[#e4e3db]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f0eee6]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#0d631b] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-bold text-[15px] text-[#1b1c17]">Live Workshop AI Assistant</h3>
                <span className="w-2 h-2 rounded-full bg-[#0d631b] animate-pulse"></span>
              </div>
              <p className="text-[11px] text-[#707a6c]">Direct link with Sharma Auto Care • Gemini Powered</p>
            </div>
          </div>
          <button
            onClick={() => closeModal("liveChat")}
            className="w-8 h-8 rounded-full bg-[#f0eee6] flex items-center justify-center text-[#40493d] hover:bg-[#eae8e0]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-[#0d631b] text-white rounded-br-none"
                    : "bg-[#f6f4ec] text-[#1b1c17] rounded-bl-none border border-[#e4e3db]"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#f6f4ec] text-[#40493d] p-3 rounded-2xl text-[12px] flex items-center gap-2 border border-[#e4e3db]">
                <span className="material-symbols-outlined text-[16px] animate-spin text-[#0d631b]">autorenew</span>
                <span>AI Assistant is consulting workshop data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-t border-[#f0eee6]">
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-full bg-[#f6f4ec] hover:bg-[#f0eee6] text-[#0d631b] text-[11px] font-semibold whitespace-nowrap border border-[#e4e3db]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="pt-2 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything about your Thar or bay service..."
            className="flex-1 h-11 px-3 bg-[#f6f4ec] rounded-full text-[13px] text-[#1b1c17] border border-[#e4e3db] outline-none focus:ring-2 focus:ring-[#0d631b]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-full bg-[#0d631b] text-white flex items-center justify-center shadow-md active:scale-95 disabled:opacity-50 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
