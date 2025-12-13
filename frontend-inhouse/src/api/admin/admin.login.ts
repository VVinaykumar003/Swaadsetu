// File name: admin.login.ts
import { api } from "../client"; // adjust the path if needed

export async function loginAsAdmin(pin: string, rid: string) {
  try {
    const res = await api<{ token: string }>(`/api/${rid}/admin/login`, {
      method: "POST",
      body: JSON.stringify({ pin }),
      idempotency: true, // optional — consistent with staff login
    });

    if (res.token) {
      localStorage.setItem("adminToken", res.token);
      return true;
    }

    return false;
  } catch (err) {
    alert("Admin Login Failed: " + err);
    return false;
  }
}
