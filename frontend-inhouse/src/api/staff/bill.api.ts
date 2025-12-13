// src/api/bill.api.ts
import { client } from "../client";

const RID = import.meta.env.VITE_RID || "restro10";

/* ---------------------------------------------
   Types
--------------------------------------------- */
export type BillStatus =
  | "pending"
  | "preparing"
  | "served"
  | "completed"
  | "draft"
  | "finalized"
  | "paid";

export type PaymentMethod = "CASH" | "CARD" | "UPI" | "WALLET" | string;

export interface BillItem {
  name: string;
  qty: number;
  price: number;
  notes?: string;
}

export interface BillTax {
  name: string;
  rate: number;
  amount: number;
}

export interface BillExtra {
  name?: string;
  label?: string;
  amount: number;
}

export interface ApiBill {
  _id: string;
  id?: string;
  orderId: string;
  tableId?: string;
  tableNumber?: string;
  items: BillItem[];
  extras?: BillExtra[];
  taxes?: BillTax[];
  subtotal: number;
  taxAmount: number;
  discountPercent: number;
  discountAmount: number;
  serviceChargePercent: number;
  serviceChargeAmount: number;
  total: number;
  paymentStatus?: string;
  status?: BillStatus;
  staffAlias?: string;
  appliedServiceChargePercent?: number;
  appliedDiscountPercent?: number;
  createdAt?: string;
  sessionId?: string;
  customerName?: string;
  customerContact?: string;
  customerEmail?: string;
  customerNotes?: string;
  orderNumberForDay?: string;
}

/* ---------------------------------------------
   Auth Header Helper
--------------------------------------------- */
function getAuthHeaders(idempotencyKey?: string) {
  const token = localStorage.getItem("staffToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  return headers;
}

/* ======================================================
   STAFF: FETCH / READ
====================================================== */

/** ✅ GET /api/:rid/orders/bill/:orderId — Get Bill by Order ID */
export async function getBillByOrderId(orderId: string): Promise<ApiBill> {
  if (!orderId) throw new Error("orderId is required");
  return await client.get(
    `/api/${RID}/orders/bill/${encodeURIComponent(orderId)}`,
    {
      headers: getAuthHeaders(),
    }
  );
}

/** ✅ GET /api/:rid/bills/:billId — Fetch Bill by Bill ID */
export async function fetchBillById(billId: string): Promise<ApiBill> {
  if (!billId) throw new Error("billId is required");
  return await client.get(`/api/${RID}/bills/${billId}`, {
    headers: getAuthHeaders(),
  });
}

/** ✅ GET /api/:rid/bills/active — Fetch active bills for staff */
export async function getActiveBills(
  query?: Record<string, any>
): Promise<ApiBill[]> {
  const qs = query ? `?${new URLSearchParams(query).toString()}` : "";
  return await client.get(`/api/${RID}/bills/active${qs}`, {
    headers: getAuthHeaders(),
  });
}

/** ✅ GET /api/:rid/bills/history — Fetch bill history */
export async function getBillsHistory(params?: {
  from?: string;
  to?: string;
  limit?: number;
  page?: number;
  status?: string;
}): Promise<ApiBill[]> {
  const qs = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : "";
  return await client.get(`/api/${RID}/bills/history${qs}`, {
    headers: getAuthHeaders(),
  });
}

/* ======================================================
   STAFF: CREATE / UPDATE
====================================================== */

/** ✅ POST /api/:rid/orders/:orderId/bill — Create Bill from Order
 *  NOTE: The backend will compute canonical totals (taxes, service charge, discount, total).
 *  Frontend may provide helpful inputs (items, extras, applied percents), but the server is authoritative.
 */
export async function createBillFromOrder(
  restaurantId: string,
  orderId: string,
  payload?: any
): Promise<ApiBill> {
  if (!restaurantId) throw new Error("restaurantId is required");
  if (!orderId) throw new Error("orderId is required");

  console.info("[createBillFromOrder] sending payload:", payload);

  const res = await client.post(
    `/api/${restaurantId}/orders/${orderId}/bill`,
    payload || {},
    { headers: getAuthHeaders() }
  );

  return res?.data?.bill || res?.data;
}

/** ✅ PATCH /api/:rid/bills/:id — Update Draft Bill
 *  IMPORTANT: backend validation expects billId in body and will re-calculate totals.
 *  Frontend should avoid trusting server totals returned in stale responses — re-fetch canonical bill after patch.
 */
export async function updateBillDraft(
  billId: string,
  patch: any
): Promise<ApiBill> {
  if (!billId) throw new Error("billId is required");

  // Always include billId in body — backend validation requires it
  const body = { billId, ...patch };

  console.debug("[updateBillDraft] PATCH", `/api/${RID}/bills/${billId}`, {
    body,
  });

  // send patch
  const resp = await client.patch(`/api/${RID}/bills/${billId}`, body, {
    headers: getAuthHeaders(),
  });

  // Try to re-fetch canonical bill from server (ensure frontend reflects server-calculated totals)
  try {
    const canonical = await fetchBillById(billId);
    console.debug("[updateBillDraft] Refetched canonical bill", { billId });
    return canonical;
  } catch (err) {
    console.warn(
      "[updateBillDraft] refetch after patch failed, returning patch response",
      err
    );
    // fallback to whatever patch returned
    return resp;
  }
}

/* ======================================================
   STAFF: FINALIZE / PAYMENT
====================================================== */

/** ✅ POST /api/:rid/bills/:id/finalize — Finalize Bill */
export async function finalizeBill(
  billId: string,
  payload?: any
): Promise<ApiBill> {
  if (!billId) throw new Error("billId is required");
  return await client.post(
    `/api/${RID}/bills/${billId}/finalize`,
    payload || {},
    { headers: getAuthHeaders() }
  );
}

/** ✅ POST /api/:rid/bills/:id/mark-paid — Mark Bill Paid */
export async function markBillPaid(
  billId: string,
  payment: {
    amount: number;
    method: PaymentMethod;
    txId?: string;
    paidBy?: string;
  },
  idempotencyKey?: string
): Promise<ApiBill> {
  if (!billId) throw new Error("billId is required");
  return await client.post(`/api/${RID}/bills/${billId}/mark-paid`, payment, {
    headers: getAuthHeaders(idempotencyKey),
  });
}

/* ======================================================
   STAFF: BILL ITEMS — INCREMENT / DECREMENT
====================================================== */

/** ✅ POST /api/:rid/bills/:id/items/:itemId/increment */
export async function incrementBillItem(
  billId: string,
  itemId: string
): Promise<ApiBill> {
  if (!billId || !itemId) throw new Error("billId and itemId are required");
  return await client.post(
    `/api/${RID}/bills/${billId}/items/${itemId}/increment`,
    {},
    { headers: getAuthHeaders() }
  );
}

/** ✅ POST /api/:rid/bills/:id/items/:itemId/decrement */
export async function decrementBillItem(
  billId: string,
  itemId: string
): Promise<ApiBill> {
  if (!billId || !itemId) throw new Error("billId and itemId are required");
  return await client.post(
    `/api/${RID}/bills/${billId}/items/${itemId}/decrement`,
    {},
    { headers: getAuthHeaders() }
  );
}

/* ======================================================
   STAFF: MENU HELPERS
====================================================== */

/** ✅ GET /api/:rid/admin/menu — basic (legacy) */
export async function getMenu() {
  return await client.get(`/api/${RID}/admin/menu`, {
    headers: getAuthHeaders(),
  });
}

/** ✅ Enhanced — fetch full structured menu for staff use (for React Select) */
export async function fetchFullMenu(rid?: string) {
  const restaurantId = rid || RID;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const endpoint = `${baseUrl}/api/${restaurantId}/admin/menu`;

  console.debug("🟡 [fetchFullMenu] Requesting menu:", endpoint);
  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json().catch(() => ({}));
    console.debug("🟢 [fetchFullMenu] Raw response:", data);

    if (!res.ok) {
      throw new Error(data?.error || `Failed to fetch menu (${res.status})`);
    }

    const items = Array.isArray(data?.menu) ? data.menu : [];
    if (!items.length)
      console.warn("⚠️ [fetchFullMenu] Menu response empty:", data);

    return items.map((m) => ({
      _id: m._id,
      name: m.name,
      price: Number(m.price ?? 0),
      description: m.description,
      image: m.image,
      isActive: m.isActive,
    }));
  } catch (err: any) {
    console.error("💥 [fetchFullMenu] Error:", err);
    throw err;
  }
}

/* ======================================================
   STAFF: ADD ITEM TO BILL (UTILITY)
====================================================== */

/** ✅ Add Item to Bill for Table (client utility, not backend route) */
export async function addItemToBillForTable(
  tableId: string,
  billId: string,
  item: {
    name: string;
    qty: number;
    price: number;
    notes?: string;
    id?: string;
  }
) {
  if (!billId) throw new Error("billId is required");

  const bill = await fetchBillById(billId);
  const items = Array.isArray(bill.items) ? [...bill.items] : [];

  const newItem = {
    ...item,
    id: item.id ?? `ui_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
  };

  items.push(newItem);

  const patch = { items, version: (bill as any).version ?? null };
  return await updateBillDraft(billId, patch);
}

/* ======================================================
   STAFF: BILL STATUS UPDATE
====================================================== */

/** ✅ PATCH /api/:rid/bills/:id/status — Update Bill Status */
export async function updateBillStatus(
  billId: string,
  status: "draft" | "finalized" | "paid" | "cancelled"
): Promise<ApiBill> {
  if (!billId) throw new Error("billId is required");

  const body = { billId, status };

  return await client.patch(`/api/${RID}/bills/${billId}/status`, body, {
    headers: getAuthHeaders(),
  });
}

/* ======================================================
   ✅ END OF FILE
====================================================== */
