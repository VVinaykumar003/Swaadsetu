import api from "../../api/client";
// In addWaiter API
export const addWaiter = async (waiter: { name: string; shift: string }, rid: string) => {
  console.log(waiter,rid);
  const token = localStorage.getItem("adminToken");
  const response = await api(`/api/${rid}/admin/waiters`, {
    method: "POST",
    body: JSON.stringify({
      name :waiter.name,
      shift: waiter.shift,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

   console.log("API raw response:", response);

  // If response is fetch Response:
  // if (response.json) {
  //   const data = await response.json();
  //   console.log("Parsed response data:", data);
  //   return data;
  // }

  // Otherwise, return response as-is
  return response ;
};

export const getWaiters = async (rid: string) => {
  const token = localStorage.getItem("adminToken");
  const response = await api(`/api/${rid}/admin/waiters`, { 
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return response;
};
export const updateWaiters = async (
  waiter: { name: string; shift: string },
  rid: string
) => {
  const token = localStorage.getItem("adminToken");
  const response = await api(`/api/${rid}/admin/waiters`, {
    method: "PATCH",
    body: JSON.stringify({
      name: waiter.name,
      shift: waiter.shift,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return response;
};

export const deleteWaiter = async (name: string, rid: string) => {
  const token = localStorage.getItem("adminToken");
  const response = await api(`/api/${rid}/admin/waiters`, {
    method: "DELETE",
    body: JSON.stringify({ name }),
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return response;
};


