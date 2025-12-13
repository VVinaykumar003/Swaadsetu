import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  IndianRupee,
  Loader2,
  Receipt,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getBillByOrderId,
  getOrdersByTable,
} from "../../../api/staff/staff.operations.api";

interface TableDetailViewProps {
  table: any;
  activeOrders: any[];
  onBack: () => void;
  handleBillView: (orderId: string, preFetchedBill?: any) => void;
  staffToken: string;
  restaurantId: string;
}

export default function TableDetailView({
  table,
  activeOrders,
  onBack,
  handleBillView,
  staffToken,
  restaurantId,
}: TableDetailViewProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billLoadingId, setBillLoadingId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const tableId =
    table?._id || table?.id || table?.tableNumber?.toString() || "";

  // 🧾 Fetch all orders for this table
  const fetchOrders = async () => {
    if (!tableId) return;
    setLoading(true);
    setError(null);
    try {
      const fetched = await getOrdersByTable(restaurantId, tableId, staffToken);
      setOrders(fetched);
    } catch (err) {
      console.error("❌ Failed to fetch orders for table:", tableId, err);
      setError("Failed to load table orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [tableId]);

  // 🧠 Auto-mark table available if all orders paid
  useEffect(() => {
    if (!loading && table.status === "occupied") {
      const unpaid = orders.filter(
        (o) => (o.paymentStatus || "").toLowerCase() !== "paid"
      );
      if (unpaid.length === 0) {
        const apiBase = import.meta.env.VITE_API_BASE_URL;
        console.log("[TableDetail] Updating table status:", {
          tableId,
          status: "available",
          token: `Bearer ${staffToken?.slice(0, 10)}...`, // Debug token presence
        });

        fetch(`${apiBase}/api/${restaurantId}/tables/${tableId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${staffToken}`,
          },
          body: JSON.stringify({
            status: "available",
            tableId, // Include tableId in body
          }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to update table status: ${res.status}`);
            }
            return res.json();
          })
          .then(() => {
            console.log("✅ Table auto-marked as available");
          })
          .catch((err) => {
            console.error("❌ Failed to update table status:", err);
          });
      }
    }
  }, [loading, orders, tableId, restaurantId, staffToken]);

  // 💰 View Bill (Generate if not exists)
  const handleGenerateAndOpenBill = async (order: any) => {
    const orderId = order?._id || order?.id || order?.serverId;
    if (!orderId) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL;
    const rid = restaurantId || import.meta.env.VITE_RID || "restro10";

    try {
      setBillLoadingId(orderId);
      let billData = null;

      try {
        billData = await getBillByOrderId(orderId, rid);
      } catch (err: any) {
        if (err.message?.includes("No bill found")) {
          const res = await fetch(
            `${apiBase}/api/${rid}/orders/${orderId}/bill`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${staffToken}`,
              },
              body: JSON.stringify({
                staffAlias: order.staffAlias || "Waiter",
                extras: [],
              }),
            }
          );
          billData = await res.json();
        } else throw err;
      }

      handleBillView(orderId, billData);
    } catch (err) {
      console.error("💥 Failed to generate/fetch bill:", err);
      alert(err.message || "Unable to fetch or create bill. Please try again.");
    } finally {
      setBillLoadingId(null);
    }
  };

  // 🎨 Status badge helper
  const getStatusBadge = (status: string) => {
    const lower = (status || "").toLowerCase();
    const base =
      "px-2 py-1 rounded-md text-xs font-semibold border flex items-center gap-1.5";
    switch (lower) {
      case "paid":
        return (
          <span
            className={`${base} bg-emerald-100 text-emerald-700 border-emerald-200`}
          >
            <CheckCircle2 className="h-3 w-3" /> Paid
          </span>
        );
      case "ready":
        return (
          <span className={`${base} bg-blue-100 text-blue-700 border-blue-200`}>
            Ready
          </span>
        );
      case "preparing":
        return (
          <span
            className={`${base} bg-amber-100 text-amber-700 border-amber-200`}
          >
            Preparing
          </span>
        );
      case "served":
        return (
          <span
            className={`${base} bg-indigo-100 text-indigo-700 border-indigo-200`}
          >
            Served
          </span>
        );
      default:
        return (
          <span
            className={`${base} bg-slate-100 text-slate-700 border-slate-200`}
          >
            {status || "Unknown"}
          </span>
        );
    }
  };

  const unpaidOrders = orders.filter(
    (o) => (o.paymentStatus || "").toLowerCase() !== "paid"
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      {/* Table Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Table {table.tableNumber}
          </h2>
          <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
            <Users className="h-4 w-4" /> Capacity: {table.capacity}
          </p>
          {table.waiterAssigned && (
            <p className="text-sm text-slate-600 mt-1">
              Waiter:{" "}
              <span className="font-medium">{table.waiterAssigned}</span>
            </p>
          )}
        </div>
        <div
          className={`px-4 py-2 rounded-lg text-sm font-semibold border w-fit transition ${
            table.status === "occupied"
              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {table.status === "occupied" ? "Occupied" : "Available"}
        </div>
      </div>

      {/* Orders Section */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-indigo-600" /> Active Orders
        </h3>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Loader2 className="animate-spin h-4 w-4" /> Loading orders...
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        ) : unpaidOrders.length === 0 ? (
          <div className="p-4 border border-slate-200 rounded-lg text-slate-500 text-sm flex items-center gap-2 bg-slate-50">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            No active unpaid orders for this table.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpaidOrders.map((o) => {
              const orderId = o._id || o.id;
              const isExpanded = expandedOrderId === orderId;

              return (
                <div
                  key={orderId}
                  className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer"
                  onClick={() =>
                    window.innerWidth < 640
                      ? setExpandedOrderId(isExpanded ? null : orderId)
                      : null
                  }
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-1.5">
                        #{o.orderNumberForDay ?? String(orderId).slice(-5)}
                      </h4>
                      {o.customerName && (
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <User className="h-4 w-4" /> {o.customerName}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(o.status)}
                      <ChevronDown
                        className={`h-4 w-4 text-slate-500 sm:hidden transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Section (Mobile Only) */}
                  {isExpanded && (
                    <div className="mt-3 border-t border-slate-100 pt-2 text-sm text-slate-600 space-y-1 sm:hidden">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="capitalize">{o.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <IndianRupee className="h-4 w-4 text-emerald-600" />
                          {o.totalAmount?.toFixed(2) ?? "0.00"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateAndOpenBill(o);
                        }}
                        disabled={billLoadingId === orderId}
                        className="mt-3 w-full px-4 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {billLoadingId === orderId ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                            Generating...
                          </>
                        ) : (
                          <>
                            View Order{" "}
                            <ChevronLeft className="rotate-180 h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Always-visible Footer for PC/Tablet */}
                  <div className="hidden sm:flex justify-between items-center mt-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="h-4 w-4 text-emerald-600" />
                      <span className="text-base font-semibold text-slate-800">
                        {o.totalAmount?.toFixed(2) ?? "0.00"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleGenerateAndOpenBill(o)}
                      disabled={billLoadingId === orderId}
                      className="px-3.5 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition flex items-center gap-1 cursor-pointer"
                    >
                      {billLoadingId === orderId ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ...
                        </>
                      ) : (
                        <>
                          View Order{" "}
                          <ChevronLeft className="rotate-180 h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Combined Amount */}
      {unpaidOrders.length > 1 && (
        <div className="mt-8 border-t border-slate-200 pt-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-slate-600" />
            Combined Pending Amount
          </h4>
          <div className="text-lg sm:text-xl font-bold text-emerald-700">
            ₹
            {unpaidOrders
              .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
              .toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}
