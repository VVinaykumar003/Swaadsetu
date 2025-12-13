import { client } from "../client";
import { api } from "../client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const RID = import.meta.env.VITE_RID || "restro10";

export interface AdminLoginResponse {
  token: string;
  admin: {
    id: string;
    name: string;
    role: "admin" | "staff";
  };
}

export const loginAsAdmin = async (
  pin: string 
): Promise<AdminLoginResponse> => {
  const response = await client.post(`${BASE_URL}/api/${RID}/admin/login`, {
    pin,
  });
  return response.data;
};

export const getMenuItems = async () => {
  const response = await client.get(`${BASE_URL}/api/${RID}/admin/menu`);
  return response.data;
};

export const addMenuItem = async (menuItem: any) => {
  const response = await client.post(
    `${BASE_URL}/api/${RID}/admin/menu`,
    menuItem
  );
  return response.data;
};

export const updateMenuItem = async (id: string, menuItem: any) => {
  const response = await client.put(
    `${BASE_URL}/api/${RID}/admin/menu/${id}`,
    menuItem
  );
  return response.data;
};

export const deleteMenuItem = async (id: string) => {
  const response = await client.delete(
    `${BASE_URL}/api/${RID}/admin/menu/${id}`
  );
  return response.data;
};

export const getStaffMembers = async () => {
  const response = await client.get(`${BASE_URL}/api/${RID}/admin/staff`);
  return response.data;
};

export const addStaffMember = async (staff: any) => {
  const response = await client.post(
    `${BASE_URL}/api/${RID}/admin/staff`,
    staff
  );
  return response.data;
};

export const updateStaffMember = async (id: string, staff: any) => {
  const response = await client.put(
    `${BASE_URL}/api/${RID}/admin/staff/${id}`,
    staff
  );
  return response.data;
};

export const deleteStaffMember = async (id: string) => {
  const response = await client.delete(
    `${BASE_URL}/api/${RID}/admin/staff/${id}`
  );
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await client.get(`${BASE_URL}/api/${RID}/admin/stats`);
  return response.data;
};

export const getOrderHistory = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  const response = await client.get(`${BASE_URL}/api/${RID}/admin/orders`, {
    params,
  });
  return response.data;
};

export const addWaiter = async (waiter: any) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
  const response = await client.post(
    `${BASE_URL}/api/${RID}/admin/waiters`,
    waiter
    
  );
  return response.data;
}

export const getRecentBills = async (RID:string) => {
  try {
    const token = localStorage.getItem("adminToken");
    
    // if (!token) {
    //   throw new Error("No authentication token found");
    // }
    // // Set authorization header
    // client.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    if (!token) {
   throw new Error("No authentication token found");
  }
    // GET request, not POST
    const response = await api(
      `${BASE_URL}/api/${RID}/bills/active`,
     {headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    }},
    );
   
    return response;
  } catch (error) {
    console.error("Error fetching recent bills:", error);
    throw error;
  }
};
