// src/api/staff.operations.api.ts
import { client } from "../client";
import type { ApiBill } from "./bill.api";

const RID = import.meta.env.VITE_RID || "restro10";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ---------------------------
 * API (server) data shapes
 * --------------------------- */

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "done";

export type PaymentStatus = "unpaid" | "paid";

export interface ApiOrderItem {
  _id?: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  priceAtOrder: number;
  price?: number; // ✅ Optional fallback price
  notes?: string;
  status?: OrderStatus;
}

export interface ApiOrder {
  _id: string;
  restaurantId?: string;
  tableId: string;
  // 💡 ADDED: tableNumber is now denormalized and embedded by the backend
  tableNumber: number;
  sessionId?: string;
  items: ApiOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  isCustomerOrder?: boolean;
  customerName?: string;
  customerContact?: string;
  customerEmail?: string;
  isOrderComplete?: boolean;
  staffAlias?: string;
  overrideToken?: string;
  version: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiTable {
  _id: string;
  restaurantId?: string;
  tableNumber: number;
  capacity: number;
  status: string;
  isActive: boolean;
  currentSessionId?: string;
  sessionExpiresAt?: string;
  staffAlias?: string;
  lastUsed?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiBillItem {
  _id?: string;
  menuItemId?: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface ApiBill {
  _id: string;
  tableId: string;
  sessionId?: string;
  staffAlias?: string;
  items: ApiBillItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Return headers as a plain record<string,string>.
 * If token is missing we return an empty object (no Authorization key).
 * This avoids `Authorization?: undefined` which isn't compatible with Record<string,string>.
 */
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("staffToken");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/* ---------------------------
 * API functions
 * --------------------------- */

export async function getActiveOrders(): Promise<ApiOrder[]> {
  const res = await client<ApiOrder[]>(`/api/${RID}/orders/active`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });
  return res;
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  version: number
): Promise<ApiOrder> {
  const res = await client<ApiOrder>(`/api/${RID}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ status, version }),
  });
  return res;
}

export async function createDraftBill(
  billData: Omit<ApiBill, "_id">
): Promise<ApiBill> {
  const res = await client<ApiBill>(`/api/${RID}/bills`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(billData),
  });
  return res;
}

export async function editDraftBill(
  billId: string,
  updates: Partial<ApiBill>
): Promise<ApiBill> {
  const res = await client<ApiBill>(`/api/${RID}/bills/${billId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(updates),
  });
  return res;
}

export async function finalizeBill(
  billId: string,
  staffAlias: string
): Promise<ApiBill> {
  const res = await client<ApiBill>(`/api/${RID}/bills/${billId}/finalize`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ staffAlias }),
  });
  return res;
}

export async function markBillPaid(
  billId: string,
  staffAlias: string,
  paymentNote?: string
): Promise<ApiBill> {
  const res = await client<ApiBill>(`/api/${RID}/bills/${billId}/mark-paid`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ staffAlias, paymentNote }),
  });
  return res;
}

export async function getTables(): Promise<ApiTable[]> {
  const res = await client<ApiTable[]>(`/api/${RID}/tables`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });
  return res;
}

export async function getTableByNumber(tableNumber: string): Promise<ApiTable> {
  const res = await client<ApiTable>(`/api/${RID}/tables/${tableNumber}`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });
  return res;
}

export async function assignSessionToTable(
  tableId: string,
  sessionId: string,
  staffAlias: string
): Promise<{ success: boolean }> {
  const res = await client<{ success: boolean }>(
    `/api/${RID}/tables/${tableId}/session`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ sessionId, staffAlias }),
    }
  );
  return res;
}

/* ---------------------------
 * getOrderHistory (Fixed)
 *
 * Safely handles both Date and string inputs for startDate/endDate.
 * Prevents .toISOString() errors and maintains full compatibility.
 * --------------------------- */
interface OrderHistoryParams {
  startDate?: string | Date;
  endDate?: string | Date;
  limit?: number;
  page?: number;
}

export async function getOrderHistory(
  maybeRid?: string | OrderHistoryParams,
  maybeParams?: OrderHistoryParams
): Promise<ApiOrder[]> {
  let callRid: string | undefined;
  let params: OrderHistoryParams | undefined;

  // 🧩 Normalize arguments
  if (typeof maybeRid === "string") {
    callRid = maybeRid;
    params = maybeParams;
  } else {
    params = maybeRid;
    callRid = undefined;
  }

  const effectiveRid = callRid ?? RID;

  // ✅ Build query string safely
  const qs = params
    ? "?" +
      Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => {
          // 🔒 Handle Date or string safely
          if (k === "startDate" || k === "endDate") {
            const safeDate =
              typeof v === "string"
                ? v
                : v instanceof Date
                ? v.toISOString().split("T")[0]
                : "";
            return `${encodeURIComponent(k)}=${encodeURIComponent(safeDate)}`;
          }
          return `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`;
        })
        .join("&")
    : "";

  const url = `/api/${effectiveRid}/orders/history${qs}`;

  try {
    const res = await client<ApiOrder[]>(url, {
      method: "GET",
      headers: {
        ...authHeaders(),
      },
    });
    return res;
  } catch (err) {
    console.error("[staff.operations.api] getOrderHistory failed:", err);
    throw err;
  }
}

/* ---------------------------
 * New: deleteOrderById
 *
 * Sends DELETE /api/:rid/orders/:id
 * --------------------------- */
export async function deleteOrderById(orderId: string): Promise<any> {
  if (!orderId) {
    throw new Error("orderId is required");
  }

  const url = `/api/${RID}/orders/${encodeURIComponent(orderId)}`;

  const res = await client<any>(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  return res;
}
/* ---------------------------
 * New: getWaiterNames
 *
 * GET /api/:rid/orders/waiters
 * Returns { waiterNames: string[] }
 * --------------------------- */
export async function getWaiterNames(
  maybeRid?: string
): Promise<{ waiterNames: string[] }> {
  const effectiveRid = maybeRid || RID;

  const url = `/api/${effectiveRid}/orders/waiters`;

  const res = await client<{ waiterNames: string[] }>(url, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });

  return res;
}

/**
 * 🔹 Fetch orders for a specific table (staff-only)
 * Requires Authorization: Bearer <staffToken>
 */
export async function getOrdersByTable(
  rid: string,
  tableId: string,
  token?: string
): Promise<ApiOrder[]> {
  if (!rid || !tableId) throw new Error("Missing restaurantId or tableId");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Use the API client for consistent response handling
  const url = `/api/${rid}/orders/table/${tableId}`;
  const response = await client<
    { data: ApiOrder[]; orders: ApiOrder[] } | ApiOrder[]
  >(url, {
    method: "GET",
    headers,
  });

  // Handle all possible response structures
  if (Array.isArray(response)) {
    return response; // Direct array of orders
  } else if (response && Array.isArray(response.data)) {
    return response.data; // Object with 'data' property (current API structure)
  } else if (response && Array.isArray(response.orders)) {
    return response.orders; // Object with 'orders' property (legacy)
  }

  console.warn("Unexpected response structure in getOrdersByTable", response);
  return [];
}
/* ---------------------------
 * getBillByOrderId (Auth Required)
 *
 * Staff-only version:
 * GET /api/:rid/orders/bill/:orderId
 * Requires Authorization: Bearer <staffToken>
 * --------------------------- */
export async function getBillByOrderId(
  orderId: string,
  restaurantId = RID
): Promise<ApiBill> {
  const token = localStorage.getItem("staffToken");
  if (!token) throw new Error("Staff token missing");
  if (!orderId) throw new Error("orderId is required");

  const res = await fetch(
    `${BASE_URL}/api/${restaurantId}/orders/bill/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("[getBillByOrderId] Failed:", {
      status: res.status,
      error: data?.error || res.statusText,
    });
    throw new Error(data?.error || `Failed to fetch bill (${res.status})`);
  }

  return data;
}
