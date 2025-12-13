import { AlertCircle, Bell, History, Receipt, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BillingView from "./components/BillingView";
import Header from "./components/Header";
import OrdersComponent from "./components/OrdersComponent";
import TableDetail from "./components/TableDetail";
import TablesComponent from "./components/TablesComponent";

import { formatINR } from "./utils/formatters";
import { mergeOrdersIntoTables } from "./utils/mergeHelpers";

import BillHistory from "./components/BillHistory";
import { useBilling } from "./hooks/useBilling";
import { useHistory } from "./hooks/useHistory";
import { useOrders } from "./hooks/useOrders";
import { usePendingTracker } from "./hooks/usePendingTracker";
import { useTables } from "./hooks/useTables";
import { useWaiters } from "./hooks/useWaiters";

import type { Order, Table } from "./types";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const rid = (import.meta.env.VITE_RID as string) || "restro10";

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showBillDetail, setShowBillDetail] = useState<Order | null>(null);
  const [view, setView] = useState<"dashboard" | "table" | "billing">(
    "dashboard"
  );
  const [activeTab, setActiveTab] = useState<
    "tables" | "orders" | "notifications" | "history"
  >("tables");
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Tables, Orders, and Billing Hooks
  const { tables, setTables, fetchTables, isLoading, assignSession } =
    useTables(rid);
  const {
    activeOrders,
    orderHistory,
    fetchActiveOrders,
    fetchOrderHistory,
    isHistoryLoading,
    historyError,
    setActiveOrders,
  } = useOrders(rid, fetchTables, setTables);
  const { waiterNames, waitersLoading, waitersError, fetchWaiters } =
    useWaiters(rid);
  const { isPending } = usePendingTracker();
  const {
    onRefresh,
    onFinalize,
    onMarkPaid,
    onAddItem,
    onRemoveItem,
    onPatchItem,
    onUpdateStatus,
    onUpdateOrderStatus,
  } = useBilling(
    showBillDetail,
    setShowBillDetail,
    activeOrders,
    setActiveOrders
  );

  // ✅ Bill History Hook Integration
  const {
    billHistory,
    fetchBillHistory,
    isHistoryLoading: isBillHistoryLoading,
    historyError: billHistoryError,
  } = useHistory(rid);

  /* -------------------------
     Lifecycle
  ------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("staffToken");
    if (!token) navigate("/staff-login");

    fetchActiveOrders();
    fetchWaiters();

    const interval = setInterval(() => {
      if (view === "dashboard") fetchActiveOrders();
    }, 15000);

    return () => clearInterval(interval);
  }, [navigate, view]);

  useEffect(() => {
    setTables((prev) => mergeOrdersIntoTables(prev, activeOrders));
  }, [activeOrders, setTables]);

  // 🧾 Fetch Bill History when switching to History tab
  useEffect(() => {
    if (activeTab === "history") {
      console.log("🧾 Fetching bill history on tab switch...");
      fetchBillHistory({ limit: 50 });
    }
  }, [activeTab, fetchBillHistory]);
  // 🔹 Listen for redirect-to-tables event (from PaymentModal)
  useEffect(() => {
    const handleGotoTables = () => {
      setView("dashboard");
      setActiveTab("tables");
      setShowBillDetail(null);
      setSelectedTable(null);
      fetchActiveOrders();
    };

    window.addEventListener("staff:gotoTablesTab", handleGotoTables);
    return () =>
      window.removeEventListener("staff:gotoTablesTab", handleGotoTables);
  }, [fetchActiveOrders]);

  /* -------------------------
     Event Handlers
  ------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("staffToken");
    navigate("/staff-login");
  };

  const handleTableSelect = (table: Table) => {
    const found =
      tables.find(
        (t) => String(t._id || t.id) === String(table._id || table.id)
      ) || table;
    setSelectedTable({ ...found });
    setView("table");
  };

  const handleBillView = (orderId: string) => {
    const order =
      activeOrders.find((o) => o.id === orderId || o.serverId === orderId) ||
      orderHistory.find((o) => o.id === orderId || o.serverId === orderId);

    if (order) {
      setShowBillDetail(order);
      setView("billing");
    } else {
      setError(`Order ${orderId} not found`);
    }
  };

  const handleConfirmClose = async () => {
    if (!showBillDetail) return;
    setShowConfirmModal(false);
    setView(selectedTable ? "table" : "dashboard");
  };

  const handleBackToDashboard = () => {
    setView("dashboard");
    setSelectedTable(null);
    setShowBillDetail(null);
    fetchActiveOrders();
  };

  const filteredOrders = activeOrders.filter((order) => {
    const q = searchQuery.toLowerCase();
    return (
      (order.tableNumber ?? "").toLowerCase().includes(q) ||
      (order.customerName ?? "").toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q)
    );
  });

  /* -------------------------
     Render
  ------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNotifications={() => setActiveTab("notifications")}
        onLogout={handleLogout}
        waiterCallCount={tables.filter((t) => t.waiterCalled).length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 🔴 Error Banner */}
        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="font-bold text-xl leading-none cursor-pointer hover:text-rose-900 transition"
            >
              ×
            </button>
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {view === "dashboard" && (
          <section>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {[
                {
                  key: "tables",
                  icon: <Utensils />,
                  label: `Tables (${tables.length})`,
                },
                {
                  key: "orders",
                  icon: <Receipt />,
                  label: `Orders (${activeOrders.length})`,
                },
                {
                  key: "notifications",
                  icon: <Bell />,
                  label: `Calls (${
                    tables.filter((t) => t.waiterCalled).length
                  })`,
                },
                {
                  key: "history",
                  icon: <History />,
                  label: `History (${billHistory.length})`,
                },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center cursor-pointer ${
                    activeTab === key
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                  }`}
                >
                  <span className="h-4 w-4 inline-block mr-2">{icon}</span>
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin h-10 w-10 border-t-2 border-indigo-600 rounded-full" />
              </div>
            ) : (
              <>
                {activeTab === "tables" && (
                  <TablesComponent
                    tables={tables}
                    activeOrders={activeOrders}
                    isLoading={isLoading}
                    onTableSelect={handleTableSelect}
                  />
                )}

                {activeTab === "orders" && (
                  <OrdersComponent
                    filteredOrders={filteredOrders}
                    handleUpdateOrderStatus={onUpdateOrderStatus}
                    handleBillView={handleBillView}
                    isPending={isPending}
                    formatINR={formatINR}
                  />
                )}

                {activeTab === "notifications" && (
                  <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">
                      Table Calls
                    </h2>
                    {tables.filter((t) => t.waiterCalled).length === 0 ? (
                      <p className="text-center text-slate-500 py-8">
                        No active calls right now.
                      </p>
                    ) : (
                      tables
                        .filter((t) => t.waiterCalled)
                        .map((t) => (
                          <div
                            key={t.id}
                            className="p-4 bg-rose-50 border border-rose-200 rounded-lg mb-3 flex justify-between items-center hover:bg-rose-100 transition cursor-pointer"
                          >
                            <div>
                              <strong>Table {t.tableNumber}</strong> requested
                              assistance.
                            </div>
                            <button
                              onClick={() => handleTableSelect(t)}
                              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
                            >
                              Respond
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                )}

                {activeTab === "history" && (
                  <BillHistory
                    billHistory={billHistory}
                    fetchBillHistory={fetchBillHistory}
                    isHistoryLoading={isBillHistoryLoading}
                    historyError={billHistoryError}
                    formatINR={formatINR}
                  />
                )}
              </>
            )}
          </section>
        )}

        {/* TABLE VIEW */}
        {view === "table" && selectedTable && (
          <TableDetail
            key={
              selectedTable._id || selectedTable.id || selectedTable.tableNumber
            }
            table={selectedTable}
            activeOrders={activeOrders}
            onBack={handleBackToDashboard}
            handleBillView={handleBillView}
            staffToken={localStorage.getItem("staffToken") || ""}
            restaurantId={rid}
          />
        )}

        {/* BILLING VIEW */}
        {view === "billing" && showBillDetail && (
          <BillingView
            showBillDetail={showBillDetail}
            goBack={() =>
              selectedTable ? setView("table") : handleBackToDashboard()
            }
            formatINR={formatINR}
            onRefresh={onRefresh}
            onFinalize={onFinalize}
            onMarkPaid={onMarkPaid}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
            onPatchItem={onPatchItem}
            onUpdateStatus={onUpdateStatus}
            handleUpdateOrderStatus={onUpdateOrderStatus}
            isPending={isPending}
            setShowConfirmModal={setShowConfirmModal}
            showConfirmModal={showConfirmModal}
            handleConfirmClose={handleConfirmClose}
            staffToken={localStorage.getItem("staffToken") || ""}
          />
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200 select-none">
        © {new Date().getFullYear()} SwaadSetu — Premium Staff Dashboard
      </footer>
    </div>
  );
}
