import { useEffect, useState } from "react";
import { deleteTable, fetchTable } from "../../../../api/admin/table.api";
import MenuLayout from "../../MenuLayout";
import AddTableModal from "../modals/AddTableModal";
import FooterNav from "./Footer";
import TableHeroSection from "./TableHero";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";
import SuccessModal from "../modals/SuccessModal";

export default function TableManagementPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalType, setModalType] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
   const [successOpen, setSuccessOpen] = useState(false);

  // For delete modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null);

  const rid = import.meta.env.VITE_RID;

  async function loadTables(showRefresh = false) {
    try {
      if (showRefresh) setRefreshing(true);
      setLoading(true);
      const data = await fetchTable(rid);
      setTables(data || []);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to fetch tables");
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  }

  useEffect(() => {
    loadTables();
    const interval = setInterval(() => loadTables(true), 15000);
    return () => clearInterval(interval);
  }, [rid]);

  // Delete table handler invoked on modal confirm
  async function handleDelete(tableId: string | null, tableNumber: number | null) {
    if (!tableId || !tableNumber) return;

    try {
      await deleteTable(rid, tableId);
      setTables((prev) => prev.filter((t) => t._id !== tableId));
      setSuccessOpen(true);
    } catch (err: any) {
      console.error("❌ Delete failed:", err);
      alert(err.message || "Failed to delete table.");
    } finally {
      setModalOpen(false);
      setSelectedTableId(null);
      setSelectedTableNumber(null);
    }
  }

  return (
    <MenuLayout>
      <div className="w-full flex flex-col items-center py-8 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
        <div className="w-full max-w-6xl space-y-10 text-black animate-fadeIn">
          <TableHeroSection />

          {/* Confirm Delete Modal */}
          <ConfirmDeleteModal
            isOpen={modalOpen}
            itemName={selectedTableNumber !== null ? `Table ${selectedTableNumber}` : ""}
            onCancel={() => setModalOpen(false)}
            onConfirm={() => handleDelete(selectedTableId, selectedTableNumber)}
          />

             <SuccessModal
        isOpen={successOpen}
        message="Deleted successfully!"
        onClose={() => setSuccessOpen(false)}
        autoCloseDurationMs={1000} // auto close after 3 seconds
      />

          <section className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6 relative">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                🪑 Table Management
                {refreshing && <span className="text-xs text-gray-500 animate-pulse">(Refreshing…)</span>}
              </h3>

              <div className="flex gap-2">
                <button
                  className="px-4 py-1.5 rounded-md bg-yellow-400 hover:bg-yellow-500 text-black font-medium shadow transition"
                  onClick={() => setModalType("table")}
                >
                  ➕ Add New Table
                </button>
                <button
                  className="px-4 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium shadow transition"
                  onClick={() => loadTables(true)}
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            <hr className="mb-4" />

            {loading ? (
              <p className="text-center text-gray-500 py-5">Loading Tables...</p>
            ) : error ? (
              <p className="text-center text-red-500 py-5">{error}</p>
            ) : tables.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {tables.map((table) => (
                  <div
                    key={table._id}
                    className={`relative p-4 rounded-xl border text-center transition-all transform hover:scale-[1.03] hover:shadow-xl ${
                      table.status === "occupied"
                        ? "bg-red-50 border-red-300"
                        : table.status === "reserved"
                        ? "bg-yellow-50 border-yellow-300"
                        : "bg-green-50 border-green-300"
                    }`}
                  >
                    <div className="text-lg font-semibold text-gray-800 mb-1">🪑 Table {table.tableNumber}</div>
                    <div className="text-sm text-gray-500">Capacity: {table.capacity}</div>

                    <div
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        table.status === "available"
                          ? "bg-green-100 text-green-700"
                          : table.status === "occupied"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {table.status || "available"}
                    </div>

                    {table.currentSessionId && (
                      <div className="text-[11px] text-gray-400 mt-1 italic">Session: {table.currentSessionId}</div>
                    )}

                    <div className="flex justify-center gap-2 mt-3">
                      <button
                        onClick={() => {
                          setSelectedTableId(table._id);
                          setSelectedTableNumber(table.tableNumber);
                          setModalOpen(true);
                        }}
                        className="btn btn-error px-3 py-1 text-xs font-semibold rounded-md shadow transition"
                      >
                        🗑 Delete
                      </button>
                    </div>

                    <div
                      className={`absolute top-1 right-1 h-2 w-2 rounded-full animate-pulse transition-all ${
                        table.status === "available" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4">No tables available.</p>
            )}
          </section>
        </div>

        <AddTableModal
          isOpen={modalType === "table"}
          onClose={() => setModalType(null)}
          rid={rid}
          onTableCreated={() => loadTables()}
        />

        <FooterNav activeTab="tables" />
      </div>
    </MenuLayout>
  );
}
