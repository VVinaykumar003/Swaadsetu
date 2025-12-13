// src/components/staff/TablesComponent.tsx
import { ChevronRight, Users } from "lucide-react";

/**
 * Minimal local types for the component props.
 * These mirror the shape used by StaffDashboard but kept local
 * to avoid circular imports.
 */
type TableStatus = "available" | "occupied";

export interface BillItem {
  name: string;
  qty: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  serverId?: string;
  tableId?: any; // can be string or object
  table?: any; // some APIs embed table object
  sessionId?: string;
  items: BillItem[];
  tableNumber?: string;
  subtotal: number;
  totalAmount: number;
  amount: number;
  status: string;
  paymentStatus: string;
  customerName?: string;
  staffAlias?: string;
  version: number;
  createdAt: string;
}

export interface Table {
  id: string;
  tableNumber: string;
  status: TableStatus;
  capacity: number;
  waiterAssigned?: string;
  bills: Order[];
  waiterCalled: boolean;
  isActive: boolean;
  currentSessionId?: string;
}

type Props = {
  tables: Table[];
  activeOrders: Order[];
  isLoading: boolean;
  onTableSelect: (table: Table) => void;
};

/**
 * Normalize a candidate table identifier into string for comparison.
 */
function toIdString(x: any): string {
  if (x === undefined || x === null) return "";
  if (typeof x === "string") return x;
  if (typeof x === "number") return String(x);
  if (typeof x === "object") {
    if (x._id) return String(x._id);
    if (x.id) return String(x.id);
    // fallback: JSON stringify (best-effort)
    try {
      return JSON.stringify(x);
    } catch (e) {
      return String(x);
    }
  }
  return String(x);
}

/**
 * Robust matcher: returns true if order appears to belong to table.
 * - checks many common shapes used by different backends/clients.
 */
function matchesOrderToTable(order: Order, table: Table) {
  try {
    const tableIdStr = toIdString(table.id);
    const tableNumberStr = toIdString(table.tableNumber);

    // candidate order table identifiers:
    const candidates = new Set<string>();

    if (order.tableId !== undefined) {
      candidates.add(toIdString(order.tableId));
      // if order.tableId is object with _id
      if (typeof order.tableId === "object") {
        if ((order.tableId as any)._id)
          candidates.add(String((order.tableId as any)._id));
        if ((order.tableId as any).id)
          candidates.add(String((order.tableId as any).id));
        if ((order.tableId as any).tableNumber)
          candidates.add(String((order.tableId as any).tableNumber));
      }
    }

    if (order.table !== undefined) {
      candidates.add(toIdString(order.table));
      if ((order.table as any)._id)
        candidates.add(String((order.table as any)._id));
      if ((order.table as any).id)
        candidates.add(String((order.table as any).id));
      if ((order.table as any).tableNumber)
        candidates.add(String((order.table as any).tableNumber));
    }

    if (order.tableNumber !== undefined)
      candidates.add(toIdString(order.tableNumber));

    // defensive: sometimes tableId is a numeric string that equals tableNumber
    if (order.tableId && /^\d+$/.test(String(order.tableId))) {
      candidates.add(String(order.tableId));
    }

    // Trim and compare
    for (const c of Array.from(candidates)) {
      if (!c) continue;
      if (c === tableIdStr) return true;
      if (c === tableNumberStr) return true;
      // loose numeric equality (e.g. "1" === 1)
      if (String(c) === String(tableIdStr)) return true;
      if (String(c) === String(tableNumberStr)) return true;
    }
  } catch (e) {
    // ignore match errors; return false as fallback
  }
  return false;
}

export default function TablesComponent({
  tables,
  activeOrders,
  isLoading,
  onTableSelect,
}: Props) {
  // Summary debug logs (one-time)
  try {
    // eslint-disable-next-line no-console
    console.debug("[TablesComponent] props summary:", {
      tablesCount: tables?.length ?? 0,
      activeOrdersCount: activeOrders?.length ?? 0,
    });

    // Log first 10 activeOrders for shape inspection
    if (Array.isArray(activeOrders) && activeOrders.length > 0) {
      // eslint-disable-next-line no-console
      console.debug(
        "[TablesComponent] activeOrders sample (first 10):",
        activeOrders.slice(0, 10).map((o) => ({
          id: o.id ?? o.serverId ?? "(no id)",
          tableId: (o as any).tableId,
          table: (o as any).table,
          tableNumber: o.tableNumber,
          status: o.status,
        }))
      );
    } else {
      // eslint-disable-next-line no-console
      console.debug("[TablesComponent] no activeOrders present.");
    }
  } catch (e) {
    /* ignore logging errors */
  }

  return isLoading ? (
    <div className="h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {tables
        .filter((t) => t.isActive)
        .map((table) => {
          // ✅ Ensure each card has a unique key
          const key =
            table._id ||
            table.id ||
            `table-${table.tableNumber}-${Math.random()}`;

          // find matching orders
          const matchingOrders = (activeOrders || []).filter((o) =>
            matchesOrderToTable(o, table)
          );
          const tableOrderCount = matchingOrders.length;

          // determine occupancy
          const occupied =
            Boolean(table.currentSessionId) ||
            tableOrderCount > 0 ||
            (table.status && String(table.status).toLowerCase() === "occupied");

          return (
            <article
              key={key}
              onClick={() => {
                console.log(
                  "🟡 Clicked table:",
                  table.tableNumber,
                  table._id || table.id
                );
                onTableSelect({ ...table }); // 👈 force fresh object reference
              }}
              className={`group cursor-pointer relative rounded-xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 ${
                occupied
                  ? "bg-gradient-to-br from-white to-indigo-50/50 border-indigo-100 hover:border-indigo-200"
                  : "bg-gradient-to-br from-white to-emerald-50/50 border-emerald-100 hover:border-emerald-200"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    Table {table.tableNumber}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Users className="h-4 w-4" />
                    <span>Capacity: {table.capacity}</span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                    occupied
                      ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {occupied
                    ? "Occupied"
                    : table.status.charAt(0).toUpperCase() +
                      table.status.slice(1)}
                </span>
              </div>

              {table.waiterAssigned && table.waiterAssigned !== "-" && (
                <div className="mb-3 pb-3 border-b border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Assigned to</div>
                  <div className="text-sm font-medium text-slate-700">
                    {table.waiterAssigned}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-slate-500">Active Orders:</span>
                  <span className="ml-2 font-semibold text-slate-800">
                    {tableOrderCount}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </article>
          );
        })}
    </div>
  );
}
