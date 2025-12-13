// src/api/staff/order.api.ts
import { api } from "../client";

/**
 * Synchronize order document fields to match its corresponding Bill.
 * Called after a Bill is finalized or paid.
 */
export async function updateOrderFromBill(
  orderId: string,
  bill: any,
  type: "finalize" | "payment" = "finalize"
) {
  console.group(
    `🔄 [updateOrderFromBill] Syncing Order <${orderId}> with Bill <${bill?._id}>`
  );

  if (!orderId || !bill) {
    console.error("❌ Missing orderId or bill data for sync.");
    console.groupEnd();
    throw new Error("orderId and bill required");
  }

  // ✅ restaurantId is required for the URL
  const restaurantId = bill.restaurantId;
  if (!restaurantId) {
    console.error("❌ Bill is missing restaurantId — cannot sync order.");
    console.groupEnd();
    throw new Error("Bill must include restaurantId");
  }

  // 🧠 Prepare payload aligned with Order schema
  const payload: Record<string, any> = {
    subtotal: bill.subtotal,
    discountAmount: bill.discountAmount,
    serviceChargeAmount: bill.serviceChargeAmount,
    taxAmount: bill.taxAmount,
    totalAmount: bill.totalAmount,
    appliedDiscountPercent: bill.discountPercent,
    appliedTaxes: (bill.taxes || []).map((t: any) => ({
      name: t.name,
      percent: t.rate,
      amount: t.amount,
      code: t.name?.toUpperCase().replace(/\s+/g, "_") || "TAX",
    })),
    updatedAt: new Date().toISOString(),
  };

  // Don't change order status on finalize - keep it active until manually closed or paid
  // if (type === "finalize") payload.status = "billed";
  if (type === "payment") {
    payload.paymentStatus = "paid";
    payload.isOrderComplete = true;
    payload.status = "billed"; // Only move to history when paid
  }

  console.info("📦 Sync payload prepared:", payload);

  try {
    // ✅ Corrected API path
    const res = await api(`/api/${restaurantId}/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.info("✅ [updateOrderFromBill] Order successfully synced:", res);
    console.groupEnd();
    return res;
  } catch (err) {
    console.error("❌ [updateOrderFromBill] Failed to sync order:", err);
    console.groupEnd();
    throw err;
  }
}
