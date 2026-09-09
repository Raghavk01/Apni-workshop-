import React from "react";
import { TechnicianPerformance } from "../types";

interface WorkshopAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

const TECHNICIANS: TechnicianPerformance[] = [
  {
    id: "tech-1",
    name: "Suresh Kumar",
    role: "Head Master Diagnostic Tech",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    jobsCompletedToday: 6,
    rating: 4.9,
    efficiencyScore: 96,
  },
  {
    id: "tech-2",
    name: "Ramesh Verma",
    role: "Senior AC & Electrical Specialist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    jobsCompletedToday: 5,
    rating: 4.8,
    efficiencyScore: 92,
  },
  {
    id: "tech-3",
    name: "Vikrant Singh",
    role: "Suspension & Wheel Alignment Tech",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    jobsCompletedToday: 4,
    rating: 4.7,
    efficiencyScore: 89,
  },
];

export const WorkshopAnalyticsModal: React.FC<WorkshopAnalyticsModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  if (!isOpen) return null;

  const handleExportAccountingCSV = () => {
    const csvHeader = "Invoice_No,Date,Customer_Name,Vehicle_Plate,Job_Type,Labor_Charges,Parts_Amount,CGST_9,SGST_9,Total_Amount,Payment_Mode\n";
    const csvRows = [
      "INV-2026-8901,09-Sep-2026,Vikram Malhotra,DL4CBE1081,30k Service & Brake Replacement,2800,4250,634.5,634.5,8319,UPI_Razorpay",
      "INV-2026-8902,09-Sep-2026,Anand Verma,HR26DQ5521,AC Condenser & Gas Topup,1800,3200,450,450,5900,PhonePe_QR",
      "INV-2026-8903,08-Sep-2026,Pooja Sharma,UP16CB8820,Ceramic Coating & Foam Wash,3500,1200,423,423,5546,Card_Machine",
    ].join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ApniWorkshop_Accounting_Export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("Downloaded Tally & Zoho Books Compatible Accounting CSV!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Workshop Owner Revenue Analytics & Accounting
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Tally / Zoho Compatible
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sharma Auto Care • Executive Franchise Performance Dashboard
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
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Revenue KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Today's Revenue</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ₹38,450
              </p>
              <p className="text-[10px] text-emerald-500 font-bold mt-0.5">↑ 18% vs yesterday</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Monthly Revenue</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                ₹8,42,000
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Target: ₹10.0 Lakhs</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Avg Ticket Size</p>
              <p className="text-xl font-black text-primary mt-1">₹6,850</p>
              <p className="text-[10px] text-primary font-bold mt-0.5">High Margin Jobs</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Bay Utilization</p>
              <p className="text-xl font-black text-amber-500 mt-1">88% Capacity</p>
              <p className="text-[10px] text-slate-400 mt-0.5">4 of 5 Bays Active</p>
            </div>
          </div>

          {/* Technician Efficiency Leaderboard */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Technician Efficiency Leaderboard
            </h4>

            <div className="space-y-2">
              {TECHNICIANS.map((tech) => (
                <div
                  key={tech.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {tech.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{tech.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {tech.jobsCompletedToday} Jobs
                      </p>
                      <p className="text-[10px] text-slate-400">Completed Today</p>
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                        {tech.efficiencyScore}%
                      </span>
                      <p className="text-[10px] text-slate-400">Efficiency</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accounting Export Banner */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">
                file_download
              </span>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  Accounting & GST Export
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Export itemized sales, labor charges, CGST, and SGST records formatted for Tally ERP and Zoho Books.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportAccountingCSV}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-2 shadow-sm shrink-0 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Export Accounting CSV</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-colors"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
};
