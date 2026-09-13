import React, { useState } from "react";
import { ServiceReminder } from "../../types";

interface ServiceRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

const INITIAL_REMINDERS: ServiceReminder[] = [
  {
    id: "rem-1",
    vehiclePlate: "DL 4C BE 1081",
    vehicleName: "Kia Seltos G1.5 HTK+",
    customerName: "Vikram Malhotra",
    mobile: "9911169253",
    type: "periodic_service",
    title: "30,000 KM Synthetic Oil & Filter Service",
    dueDate: "14 Sep 2026",
    daysRemaining: 5,
    status: "scheduled",
    estimatedRevenue: 4250,
  },
  {
    id: "rem-2",
    vehiclePlate: "HR 26 DQ 5521",
    vehicleName: "Mahindra Thar 4x4",
    customerName: "Anand Verma",
    mobile: "9818812345",
    type: "insurance_renewal",
    title: "ICICI Lombard Comprehensive Insurance Renewal",
    dueDate: "20 Sep 2026",
    daysRemaining: 11,
    status: "scheduled",
    estimatedRevenue: 18500,
  },
  {
    id: "rem-3",
    vehiclePlate: "UP 16 CB 8820",
    vehicleName: "Hyundai Creta 1.5 SX",
    customerName: "Pooja Sharma",
    mobile: "9871100992",
    type: "pucc_expiry",
    title: "National PUCC Emission Certificate Renewal",
    dueDate: "25 Sep 2026",
    daysRemaining: 16,
    status: "scheduled",
    estimatedRevenue: 350,
  },
  {
    id: "rem-4",
    vehiclePlate: "DL 10 CE 4019",
    vehicleName: "Tata Nexon EV Max",
    customerName: "Rahul Mehta",
    mobile: "9958044112",
    type: "brake_inspection",
    title: "Front Brake Lining & Battery Cell Health Inspection",
    dueDate: "28 Sep 2026",
    daysRemaining: 19,
    status: "scheduled",
    estimatedRevenue: 2800,
  },
];

export const ServiceRemindersModal: React.FC<ServiceRemindersModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const [reminders, setReminders] = useState<ServiceReminder[]>(INITIAL_REMINDERS);

  if (!isOpen) return null;

  const totalPipelineRevenue = reminders.reduce((sum, r) => sum + r.estimatedRevenue, 0);

  const handleSendReminder = (reminder: ServiceReminder) => {
    const text = encodeURIComponent(
      `🚗 *Apni Workshop Vehicle Service Alert*\n\nNamaste ${reminder.customerName},\nYour vehicle *${reminder.vehicleName} (${reminder.vehiclePlate})* is due for *${reminder.title}* on *${reminder.dueDate}*.\n\nBook your slot today with free doorstep pickup & 10% off: https://apniworkshop.com/book/${reminder.vehiclePlate}`
    );
    window.open(`https://wa.me/91${reminder.mobile}?text=${text}`, "_blank");

    setReminders((prev) =>
      prev.map((r) => (r.id === reminder.id ? { ...r, status: "sent" } : r))
    );
    showToast(`Sent WhatsApp Service Reminder to ${reminder.customerName}!`);
  };

  const handleBulkSendAll = () => {
    reminders.forEach((r) => {
      if (r.status === "scheduled") {
        handleSendReminder(r);
      }
    });
    showToast("Bulk WhatsApp Retention Campaign Launched!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              <span className="material-symbols-outlined">schedule_send</span>
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                AI Customer Retention & Reminders Engine
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Auto WhatsApp
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automated Service, Insurance Expiry & PUCC Alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Analytics Pipeline Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Active Retention Pipeline
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {reminders.length} Vehicles
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Estimated Service Revenue
              </p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                ₹{totalPipelineRevenue.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Conversion Rate
              </p>
              <p className="text-xl font-black text-primary mt-0.5">38% Benchmark</p>
            </div>
          </div>

          {/* List of Reminders */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">
                Upcoming Service & Renewal Schedule
              </h4>
              <button
                onClick={handleBulkSendAll}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                Bulk Send All Reminders
              </button>
            </div>

            {reminders.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold mt-0.5 shrink-0">
                    <span className="material-symbols-outlined text-lg">
                      {r.type === "periodic_service"
                        ? "car_repair"
                        : r.type === "insurance_renewal"
                        ? "verified_user"
                        : "co2"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {r.vehicleName}
                      </span>
                      <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono px-1.5 py-0.5 rounded">
                        {r.vehiclePlate}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                      {r.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Customer: <span className="font-semibold text-slate-700 dark:text-slate-300">{r.customerName}</span> (+91 {r.mobile}) • Due in <span className="font-bold text-amber-500">{r.daysRemaining} days</span> ({r.dueDate})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    ₹{r.estimatedRevenue.toLocaleString("en-IN")}
                  </span>
                  <button
                    onClick={() => handleSendReminder(r)}
                    disabled={r.status === "sent"}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      r.status === "sent"
                        ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-[#25d366] hover:bg-[#20ba59] text-white shadow-xs active:scale-95"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {r.status === "sent" ? "check_circle" : "send"}
                    </span>
                    <span>{r.status === "sent" ? "Reminder Sent" : "Send WhatsApp"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-colors"
          >
            Close Retention Engine
          </button>
        </div>
      </div>
    </div>
  );
};
