import { api } from "./client";

export type OrderItem = {
  menuItemId: { $oid: string };
  name: string;
  quantity: number;
  price: number;
  priceAtOrder: number;
  notes: string;
  status: "placed" | "preparing" | "ready" | "served" | "cancelled";
  _id: { $oid: string };
  createdAt: { $date: string };
  updatedAt: { $date: string };
};

export type Order = {
  _id: { $oid: string };
  restaurantId: string; 
  tableId: string;
  sessionId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "placed" | "preparing" | "ready" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "partial";
  isCustomerOrder: boolean;
  customerName: string;
  customerEmail: string;
  staffAlias: string | null;
  overrideToken: string | null;
  version: number;
  createdAt: { $date: string };
  updatedAt: { $date: string };
  __v: number;
};

export async function createOrder(rid: string, payload: object) {

  return api(`/api/${rid}/orders`, {
    method: "POST",
    body: JSON.stringify(payload),
    idempotency: true,
  });
}

export async function getOrder(rid: string): Promise<Order[]> {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Unauthorized");

  return api<Order[]>(`/api/${rid}/orders/active`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
  });
}


export async function getOrderById(rid: string, sessionId: string, _id: string): Promise<Order> {
  return api<Order>(`/api/${rid}/orders/${_id}/order?sessionId=${sessionId}`, {
    method: "GET",
  });
}
