import { api } from "./client";

/**
 * Fetch all tables for a restaurant
 */
export async function fetchTable(rid: string) {
  const token = localStorage.getItem("adminToken");

  const res = await api(`/api/${rid}/tables`, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return res;
}

/**
 * Create a new table (Admin-only, aligned with backend API)
 */
export async function createTable(
  rid: string,
  table: { tableNumber: number; capacity: number; isActive?: boolean }
) {
  const token = localStorage.getItem("adminToken");

  const payload = {
    tableNumber: table.tableNumber,
    capacity: table.capacity,
    isActive: table.isActive ?? true,
  };

  const res = await api(`/api/${rid}/tables`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(payload),
  });

  return res;
}

/**
 * ✅ Delete a table by ID (Admin-only)
 */
export async function deleteTable(rid: string, tableId: string) {
  const token = localStorage.getItem("adminToken");
  if (!tableId) throw new Error("Table ID is required for deletion.");
  const res = await api(`/api/${rid}/tables/${tableId}`, {
    method: "DELETE",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return res;
}
