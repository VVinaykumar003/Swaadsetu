import {
  Calendar,
  ChevronRight,
  Clock,
  IndianRupee,
  Receipt,
  RotateCcw,
  Utensils,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ApiBill } from "../../../api/staff/bill.api";
import { fetchBillById } from "../../../api/staff/bill.api";
import BillModalComponent from "./BillModalComponent";

/* ---------------------------------------------
   Props
--------------------------------------------- */
type Props = {
  billHistory?: ApiBill[];
  fetchBillHistory: (params?: { from?: string; to?: string }) => Promise<void>;
  isHistoryLoading: boolean;
  historyError: string | null;
  formatINR: (n?: number | null) => string;
};

/* ---------------------------------------------
   Bill History Component
--------------------------------------------- */
export default function BillHistory({
  billHistory = [],
  fetchBillHistory,
  isHistoryLoading,
  historyError,
  formatINR,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [selectedPreset, setSelectedPreset] = useState<
    "today" | "yesterday" | "7d" | null
  >(null);
  const [selectedBill, setSelectedBill] = useState<ApiBill | null>(null);
  const [isBillLoading, setIsBillLoading] = useState(false);
  const hasFetchedOnce = useRef(false);

  useEffect(() => {
    if (!hasFetchedOnce.current) {
      console.log("🧾 [BillHistory] Auto-fetching initial data...");
      fetchBillHistory({ from: selectedDate, to: selectedDate });
      hasFetchedOnce.current = true;
    }
  }, [fetchBillHistory, selectedDate]);

  /* 🔄 Manual fetch by date */
  const handleFetchDate = async () => {
    console.log("📅 Fetching bills for date:", selectedDate);
    if (!selectedDate || isHistoryLoading) return;
    setSelectedPreset(null);
    try {
      await fetchBillHistory({ from: selectedDate, to: selectedDate });
    } catch (err) {
      console.error("❌ Fetch failed:", err);
    }
  };

  /* ⚡ Quick presets */
  const handlePreset = async (
    daysAgo: number,
    preset: "today" | "yesterday" | "7d"
  ) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const dateStr = d.toISOString().split("T")[0];
    console.log(`⚙️ [BillHistory] Preset: ${preset}, date:`, dateStr);
    setSelectedDate(dateStr);
    setSelectedPreset(preset);
    try {
      await fetchBillHistory(
        preset === "7d"
          ? {
              from: dateStr,
              to: new Date().toISOString().split("T")[0],
            }
          : { from: dateStr, to: dateStr }
      );
    } catch (err) {
      console.error("❌ [BillHistory] Preset fetch failed:", err);
    }
  };

  /* 🧾 Fetch bill detail & open modal */
  const handleViewBill = async (billId: string) => {
    console.log("🧾 [BillHistory] Fetching details for bill:", billId);
    try {
      setIsBillLoading(true);
      const bill = await fetchBillById(billId);
      setSelectedBill(bill);
    } catch (err) {
      console.error("❌ [BillHistory] Failed to fetch bill details:", err);
      alert("Failed to fetch bill details.");
    } finally {
      setIsBillLoading(false);
    }
  };

  const totalBills = billHistory?.length ?? 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-slate-600" />
            Bill History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Select a date or use a preset to view completed bills.
          </p>
        </div>

        {/* Date & Presets */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-300 rounded-md px-2 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
          <button
            onClick={handleFetchDate}
            disabled={isHistoryLoading}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition active:scale-[0.98]"
          >
            {isHistoryLoading ? (
              <>
                <RotateCcw className="h-4 w-4 animate-spin" /> Fetching...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" /> Fetch
              </>
            )}
          </button>

          <div className="hidden sm:flex gap-2 ml-2">
            {[
              { label: "Today", key: "today", daysAgo: 0 },
              { label: "Yesterday", key: "yesterday", daysAgo: 1 },
              { label: "7d", key: "7d", daysAgo: 6 },
            ].map(({ label, key, daysAgo }) => (
              <button
                key={key}
                onClick={() =>
                  handlePreset(daysAgo, key as "today" | "yesterday" | "7d")
                }
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedPreset === key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {historyError && (
        <div className="mb-3 text-sm text-rose-600">❌ {historyError}</div>
      )}

      {/* Loading / Empty / List */}
      {isHistoryLoading ? (
        <div className="py-8 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-t-2 border-indigo-600 rounded-full" />
        </div>
      ) : totalBills === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Receipt className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <div className="text-sm">
            No bills found for this date ({selectedDate}).
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {billHistory.map((bill, index) => (
            <div
              key={`${bill._id || index}_${index}`}
              className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition p-4 sm:p-5 cursor-pointer"
              onClick={() => handleViewBill(bill._id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shadow-sm">
                    <Utensils className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    {/* ✅ Updated info layout */}
                    <div className="font-semibold text-slate-800 text-base">
                      Order #{bill.orderNumberForDay ?? "—"}
                      <span className="text-slate-500 text-sm ml-2">
                        • Table {bill.tableNumber ?? "—"}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      Customer: {bill.customerName || "Guest"}
                    </div>
                    <div className="text-xs text-slate-400">
                      Staff: {bill.staffAlias || "Unknown"} •{" "}
                      {bill.createdAt
                        ? new Date(bill.createdAt).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-md font-medium capitalize ${
                      (bill.paymentStatus || "").toLowerCase() === "paid"
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {bill.paymentStatus || "unpaid"}
                  </span>
                  <span className="font-bold text-emerald-600">
                    {formatINR(bill.totalAmount ?? 0)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-slate-700 text-sm">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-slate-600" />
                  <span>{bill.items?.length ?? 0} items</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-emerald-600" />
                  <span>{formatINR(bill.subtotal ?? 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>
                    {bill.createdAt
                      ? new Date(bill.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBill && (
        <BillModalComponent
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
          formatINR={formatINR}
        />
      )}
    </div>
  );
}
