// src/api/menu.api.ts
import { api } from "./client";

interface MenuItem {
  itemId?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  image?: string;
  isActive?: boolean;
  isVegetarian?: boolean;
  preparationTime?: number;
  category?: string;
  metadata?: Record<string, any>;
}

interface CategoryPayload {
  name?: string;
  itemIds?: string[];
  comboMeta?: {
    originalPrice?: number;
    discountedPrice?: number;
    description?: string;
    image?: string;
  };
}

// -------------------------------------------------------------
// 🧠 Utility: Token Helper
// -------------------------------------------------------------
function authHeaders() {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

// -------------------------------------------------------------
// 📋 MENU (GET / POST full menu)
// -------------------------------------------------------------

export async function fetchMenu(rid: string) {
  return api(`/api/${rid}/admin/menu`, { method: "GET" });
}

export async function createMenu(rid: string, data: any) {
  return api(`/api/${rid}/admin/menu`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export async function updateMenu(rid: string, menuData: any) {
  const token = localStorage.getItem('adminToken');
  if(!token) {
    console.log("token expected")
  }
  return api(`/api/${rid}/admin/menu`, {
    method: "POST", // backend uses POST for upsert
      headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
    body: JSON.stringify(menuData),
  });
}

// -------------------------------------------------------------
// 🍽️ MENU ITEMS
// -------------------------------------------------------------

// Add single menu item
export async function addMenuItem(rid: string, item: MenuItem) {
  return api(`/api/${rid}/admin/menu/items`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ item }), // backend expects { item: {...} }
  });
}

// Update existing item
export async function updateMenuItem(
  rid: string,
  itemId: string,
  payload: Partial<MenuItem>
) {
  return api(`/api/${rid}/admin/menu/items/${itemId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

// Delete (soft/hard)
export async function deleteMenuItem(rid: string, itemId: string, soft = true) {
  return api(`/api/${rid}/admin/menu/items/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ soft }),
  });
}

// Restore a soft-deleted item
export async function restoreMenuItem(rid: string, itemId: string) {
  return api(`/api/${rid}/admin/menu/items/${itemId}/restore`, {
    method: "PATCH",
    headers: authHeaders(),
  });
}

// -------------------------------------------------------------
// 🗂️ CATEGORIES
// -------------------------------------------------------------

// -------------------------------------------------------------
// 🗂️ CATEGORIES
// -------------------------------------------------------------

// Fetch all categories
export async function fetchCategories(rid: string) {
  return api(`/api/${rid}/admin/menu/categories`, {
    method: "GET",
    headers: authHeaders(),
  });
}

// Add new category
export async function addCategory(rid: string, category: CategoryPayload) {
  return api(`/api/${rid}/admin/menu/categories`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ category }),
  });
}

// Update existing category
export async function updateCategory(
  rid: string,
  categoryId: string,
  payload: CategoryPayload
) {
  return api(`/api/${rid}/admin/menu/categories/${categoryId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

// Delete category (soft delete optional)
export async function deleteCategory(
  rid: string,
  categoryId: string,
  soft = true
) {
  return api(`/api/${rid}/admin/menu/categories/${categoryId}`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ soft }),
  });
}
