import React, { useState } from "react";
import { InventoryItem } from "../types";

interface InventoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "inv-1",
    partNumber: "TVS-BP-4912",
    name: "Front Ceramic Brake Pads Set",
    category: "Braking & Rotors",
    stockCount: 14,
    minStockAlert: 5,
    unitCost: 1850,
    sellingPrice: 2450,
    supplierName: "TVS Girling Spares Pvt Ltd",
    barcode: "8901234509123",
    compatibility: ["Kia Seltos", "Hyundai Creta", "Hyundai Venue"],
  },
  {
    id: "inv-2",
    partNumber: "MOB-1-5W30",
    name: "Mobil 1 Fully Synthetic Engine Oil 4L",
    category: "Engine Oil & Fluids",
    stockCount: 3, // LOW STOCK
    minStockAlert: 8,
    unitCost: 2400,
    sellingPrice: 3250,
    supplierName: "Mobil Oil Distributors Delhi",
    barcode: "8901234509124",
    compatibility: ["Kia Seltos", "Mahindra Thar", "Hyundai Creta", "Tata Nexon"],
  },
  {
    id: "inv-3",
    partNumber: "BOSCH-AF-102",
    name: "Bosch High Flow Air Filter Element",
    category: "Filters & Spark",
    stockCount: 22,
    minStockAlert: 10,
    unitCost: 350,
    sellingPrice: 650,
    supplierName: "Bosch Auto Parts India",
    barcode: "8901234509125",
    compatibility: ["Kia Seltos", "Hyundai Creta"],
  },
  {
    id: "inv-4",
    partNumber: "NGK-IR-772",
    name: "NGK Laser Iridium Spark Plug 4-Pack",
    category: "Filters & Spark",
    stockCount: 8,
    minStockAlert: 6,
    unitCost: 1100,
    sellingPrice: 1800,
    supplierName: "NGK Spark Plugs NCR",
    barcode: "8901234509126",
    compatibility: ["Maruti Swift", "Maruti Baleno", "Honda City"],
  },
  {
    id: "inv-5",
    partNumber: "AMARON-DIN74",
    name: "Amaron Hilife Pro DIN74 Automotive Battery",
    category: "Electrical & Battery",
    stockCount: 2, // LOW STOCK
    minStockAlert: 4,
    unitCost: 5200,
    sellingPrice: 6800,
    supplierName: "Amaron Batteries North Delhi",
    barcode: "8901234509127",
    compatibility: ["Mahindra XUV700", "Tata Harrier", "Toyota Fortuner"],
  },
];

export const InventoryManagerModal: React.FC<InventoryManagerModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const handleSimulateBarcodeScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const matched = items[0]; // match Front Ceramic Brake Pads
      setScannedCode(matched.barcode);
      // Increment stock
      setItems((prev) =>
        prev.map((item) =>
          item.id === matched.id ? { ...item, stockCount: item.stockCount + 1 } : item
        )
      );
      showToast(`Scanned Barcode #${matched.barcode}! Added 1 unit of ${matched.name}`);
    }, 1200);
  };

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Smart OEM Spare Parts & Inventory Control
                <span className="bg-primary/20 text-primary text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border border-primary/30">
                  Barcode Scanner
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sharma Auto Care • Stock Management & OEM Procurement
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
          {/* Top Bar: Search & Scanner */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search part name, OEM part number, or vehicle model..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={handleSimulateBarcodeScan}
              disabled={isScanning}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-base">
                {isScanning ? "sync" : "qr_code_scanner"}
              </span>
              <span>{isScanning ? "Scanning Barcode..." : "Scan Part Box Barcode"}</span>
            </button>
          </div>

          {/* Scanned Feedback Notification */}
          {scannedCode && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                Last Scanned Barcode: <strong className="font-mono">{scannedCode}</strong> (Stock Updated)
              </span>
              <button
                onClick={() => setScannedCode("")}
                className="text-[10px] uppercase font-bold text-emerald-500 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Inventory Table */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Spare Parts Catalog ({filteredItems.length} Items)
            </h4>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
              {filteredItems.map((item) => {
                const isLowStock = item.stockCount <= item.minStockAlert;
                return (
                  <div
                    key={item.id}
                    className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {item.partNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.category} • Supplier: {item.supplierName}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] font-semibold text-slate-400">Fits:</span>
                        {item.compatibility.map((c, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.2 rounded"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left sm:text-right">
                        <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                          ₹{item.sellingPrice.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-slate-400">Cost: ₹{item.unitCost}</p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block ${
                            isLowStock
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {item.stockCount} in stock
                        </span>
                        {isLowStock && (
                          <p className="text-[9px] font-bold text-rose-500 mt-0.5">
                            LOW STOCK ALERT
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-colors"
          >
            Close Inventory Manager
          </button>
        </div>
      </div>
    </div>
  );
};
