// controllers/order.controller.js
// Order controller - snapshot pricing, compute totals, optimistic locking, idempotency-friendly.
//
// Exports:
//  - createOrder(req,res,next)
//  - updateOrderStatus(req,res,next)
//  - getActiveOrders(req,res,next)
//  - getOrderHistory(req,res,next)
//  - deleteOrderById(req,res,next)
//  - getOrderWaiters(req,res,next)

const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Bill = require("../models/bill.model");

const Table = (() => {
  try {
    return require("../models/table.model");
  } catch (e) {
    return null;
  }
})();
const Menu = (() => {
  try {
    return require("../models/menu.model");
  } catch (e) {
    return null;
  }
})();
const Admin = (() => {
  try {
    return require("../models/admin.model");
  } catch (e) {
    return null;
  }
})();

const { getPricingConfig } = (() => {
  try {
    return require("../common/libs/pricingHelper");
  } catch (e) {
    return {
      getPricingConfig: async (rid) => ({
        taxes: [],
        serviceCharge: 0,
        globalDiscountPercent: 0,
      }),
    };
  }
})();
// Canonical status mapping for order updates (define once, used across funcs)
const STATUS_MAP = {
  pending: "placed",
  placed: "placed",
  accepted: "accepted",
  preparing: "preparing",
  ready: "ready",
  served: "served",
  done: "done",
  cancelled: "cancelled",
};

// Defensive logger
let logger = console;
try {
  logger = require("../common/libs/logger") || console;
} catch (e) {
  // fallback console
}

// Defensive redis helpers (idempotency, publish)
let redisHelpers = null;
let checkIdempotency = null;
let publishEvent = null;
(function tryLoadRedis() {
  const candidates = [
    "../db/redis",
    "../db/redis.helpers",
    "../db/redisHelper",
    "../../db/redis",
  ];
  for (const p of candidates) {
    try {
      const mod = require(p);
      if (!mod) continue;
      redisHelpers = mod;
      checkIdempotency = mod.checkIdempotency || mod.check_idempotency || null;
      publishEvent = mod.publishEvent || mod.publish || null;
      if (checkIdempotency || publishEvent) break;
    } catch (e) {
      /* ignore */
    }
  }
})();

//===========================================================================================================
// Helper Functions
//===========================================================================================================

// Safe idempotency check wrapper
async function safeCheckIdempotency(key) {
  if (typeof checkIdempotency !== "function") return null;
  try {
    return await checkIdempotency(key);
  } catch (err) {
    logger && logger.error && logger.error("checkIdempotency error:", err);
    return null;
  }
}

// Safe publish wrapper
function safePublish(channel, message) {
  if (typeof publishEvent !== "function") return;
  try {
    const out = publishEvent(channel, message);
    if (out && typeof out.then === "function")
      out.catch(
        (e) => logger && logger.error && logger.error("publishEvent err:", e)
      );
  } catch (e) {
    logger && logger.error && logger.error("publishEvent error:", e);
  }
}

// rounding helper
function moneyRound(x) {
  return Number((Math.round(Number(x || 0) * 100) / 100).toFixed(2));
}

// Compute totals from order snapshot (items + snapshot config)
function computeTotalsFromOrderSnapshot({
  items = [],
  appliedTaxes = [],
  appliedDiscountPercent = 0,
  appliedServiceChargePercent = 0,
  extras = [],
} = {}) {
  // Base calculations
  const lineTotal = (items || []).reduce(
    (s, it) => s + Number(it.priceAtOrder || 0) * Number(it.quantity || 1),
    0
  );
  const extrasTotal = (extras || []).reduce(
    (s, e) => s + Number(e.amount || 0),
    0
  );
  const subtotal = moneyRound(lineTotal + extrasTotal);

  // Step 1: Apply discount
  const discountAmount = moneyRound(
    (subtotal * Number(appliedDiscountPercent || 0)) / 100
  );
  const afterDiscount = moneyRound(subtotal - discountAmount);

  // Step 2: Apply service charge
  const serviceChargeAmount = moneyRound(
    (afterDiscount * Number(appliedServiceChargePercent || 0)) / 100
  );
  const afterServiceCharge = moneyRound(afterDiscount + serviceChargeAmount);

  // Step 3: Calculate taxes on (after discount + service charge)
  const taxBreakdown = (appliedTaxes || []).map((t) => {
    const rate = Number(t.percent || 0);
    const amount = moneyRound((afterServiceCharge * rate) / 100);
    return {
      name: t.name || "Tax",
      rate,
      amount,
    };
  });

  const taxAmount = moneyRound(
    taxBreakdown.reduce((sum, tax) => sum + tax.amount, 0)
  );

  // Final total
  const total = moneyRound(afterServiceCharge + taxAmount);

  return {
    subtotal,
    discountAmount,
    serviceChargeAmount,
    taxBreakdown,
    taxAmount,
    total,
    debug: {
      afterDiscount,
      afterServiceCharge,
      baseForTax: afterServiceCharge,
    },
  };
}

//===========================================================================================================
// Exported Controller Functions
//===========================================================================================================
/**
 * Create Order
 * POST /api/:rid/orders
 *
 * Creates an order and snapshots the current active pricing config from Admin into the order.
 * Computes totals and persists them on the order.
 */
async function createOrder(req, res, next) {
  console.log("[createOrder] enter", { params: req.params });
  try {
    const { rid } = req.params;
    const {
      tableId,
      sessionId,
      items,
      extras = [],
      isCustomerOrder,
      staffAlias,
      customerName,
      customerContact,
      customerEmail,
    } = req.body || {};

    if (
      !rid ||
      !tableId ||
      !sessionId ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !customerName
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: tableId, sessionId, items, customerName",
      });
    }

    // ------------------ IDEMPOTENCY HANDLING ------------------
    const hdr =
      req.headers["x-idempotency-key"] || req.headers["x-idempotency"];
    const idempotencyKey = hdr
      ? `idempotency:order:${rid}:${sessionId}:${hdr}`
      : null;
    if (idempotencyKey) {
      const prev = await safeCheckIdempotency(idempotencyKey);
      if (prev)
        return res
          .status(409)
          .json({ error: "Duplicate request", order: prev });
    }

    // ------------------ CHECK EXISTING ORDER FOR TABLE ------------------
    let existingOrder = await Order.findOne({
      restaurantId: rid,
      tableId,
      status: { $in: ["placed", "pending", "open"] },
    });

    // ✅ MERGE if existing active order exists
    if (existingOrder) {
      console.log(
        `[createOrder] merging into existing order ${existingOrder._id}`
      );

      const menuDoc = await Menu.findOne({
        restaurantId: rid,
        isActive: true,
      }).lean();
      if (!menuDoc || !Array.isArray(menuDoc.items)) {
        return res
          .status(400)
          .json({ error: "Active menu not found for restaurant" });
      }

      const normalizeId = (id) =>
        String(id || "")
          .toLowerCase()
          .trim();
      const byId = new Map();
      for (const m of menuDoc.items || []) {
        if (!m) continue;
        const ids = [m._id, m.itemId].filter(Boolean).map(normalizeId);
        ids.forEach((id) => byId.set(id, m));
      }

      // Merge items
      for (const it of items || []) {
        const providedId = it.menuItemId || it.itemId || it.id;
        const normalizedId = normalizeId(providedId);
        const menuItem = byId.get(normalizedId);
        if (!menuItem) continue;

        const existingItem = existingOrder.items.find(
          (i) => i.menuItemId.toString() === String(menuItem._id)
        );
        if (existingItem) {
          existingItem.quantity += Number(it.quantity || 1);
          existingItem.priceAtOrder = Number(
            it.priceAtOrder || existingItem.priceAtOrder || menuItem.price
          );
        } else {
          existingOrder.items.push({
            menuItemId: menuItem._id,
            name: menuItem.name,
            quantity: Number(it.quantity || 1),
            priceAtOrder: Number(it.priceAtOrder || menuItem.price || 0),
            notes: it.notes || "",
            status: "placed",
            modifiers: it.modifiers || [],
            OrderNumberForDay: existingOrder.OrderNumberForDay, // ✅ schema-safe
          });
        }
      }

      // Ensure all items have OrderNumberForDay
      for (const item of existingOrder.items) {
        if (!item.OrderNumberForDay)
          item.OrderNumberForDay = existingOrder.OrderNumberForDay;
      }

      // Update customer info if provided
      if (customerName && !existingOrder.customerName)
        existingOrder.customerName = customerName;
      if (customerContact) existingOrder.customerContact = customerContact;
      if (customerEmail) existingOrder.customerEmail = customerEmail;

      // Recompute totals
      const baseTotal = existingOrder.items.reduce(
        (sum, r) => sum + r.priceAtOrder * (r.quantity || 1),
        0
      );
      const totals = computeTotalsFromOrderSnapshot({
        items: existingOrder.items,
        appliedTaxes: existingOrder.appliedTaxes || [],
        appliedDiscountPercent: existingOrder.appliedDiscountPercent || 0,
        appliedServiceChargePercent:
          existingOrder.appliedServiceChargePercent || 0,
        extras,
      });

      existingOrder.subtotal = totals.subtotal;
      existingOrder.taxAmount = totals.taxAmount;
      existingOrder.serviceChargeAmount = totals.serviceChargeAmount;
      existingOrder.discountAmount = totals.discountAmount;
      existingOrder.totalAmount = totals.total;
      existingOrder.updatedAt = new Date();

      await existingOrder.save();

      // ------------------ ALSO UPDATE EXISTING BILL ------------------
      try {
        const bill = await Bill.findOne({
          restaurantId: rid,
          orderId: existingOrder._id,
          status: { $in: ["draft", "open", "unpaid"] },
        });

        if (bill) {
          console.log("[createOrder] updating existing bill for merged order");

          // Rebuild items for bill
          const billItems = existingOrder.items.map((it) => ({
            itemId: String(it.menuItemId),
            name: it.name,
            qty: it.quantity,
            price: it.priceAtOrder || it.price || 0,
            priceAtOrder: it.priceAtOrder || it.price || 0,
            modifiers: it.modifiers || [],
            notes: it.notes || "",
          }));

          // Recalculate totals
          const billTotals = computeTotalsFromOrderSnapshot({
            items: existingOrder.items,
            appliedTaxes: existingOrder.appliedTaxes || [],
            appliedDiscountPercent: existingOrder.appliedDiscountPercent || 0,
            appliedServiceChargePercent:
              existingOrder.appliedServiceChargePercent || 0,
            extras: existingOrder.extras || [],
          });

          bill.items = billItems;
          bill.subtotal = billTotals.subtotal;
          bill.taxAmount = billTotals.taxAmount;
          bill.discountAmount = billTotals.discountAmount;
          bill.serviceChargeAmount = billTotals.serviceChargeAmount;
          bill.totalAmount = billTotals.total;
          bill.updatedAt = new Date();

          // Add audit trail
          bill.audit.push({
            by: "(System)",
            action: "item_added_to_existing_order",
            at: new Date(),
          });

          await bill.save();

          safePublish(`restaurant:${rid}:bills`, {
            event: "billUpdated",
            data: bill,
          });

          console.log("[createOrder] bill updated successfully");
        } else {
          console.warn("[createOrder] no active bill found to update");
        }
      } catch (e) {
        console.error("[createOrder] failed to update existing bill", e);
      }

      // ------------------ BROADCAST MERGE EVENT ------------------
      safePublish(`restaurant:${rid}:orders`, {
        event: "orderMerged",
        data: existingOrder,
      });

      return res.status(200).json({
        message: "Existing order found and merged successfully.",
        order: existingOrder,
        preBill: {
          subtotal: totals.subtotal,
          taxes: totals.taxBreakdown,
          serviceCharge: totals.serviceChargeAmount,
          discount: totals.discountAmount,
          total: totals.total,
        },
      });
    }

    // ------------------ OTHERWISE CREATE NEW ORDER ------------------
    const menuDoc = await Menu.findOne({
      restaurantId: rid,
      isActive: true,
    }).lean();
    if (!menuDoc || !Array.isArray(menuDoc.items)) {
      return res.status(400).json({ error: "Menu not found for restaurant" });
    }

    const normalizeId = (id) =>
      String(id || "")
        .toLowerCase()
        .trim();
    const byId = new Map();
    for (const m of menuDoc.items || []) {
      if (!m) continue;
      const ids = [m._id, m.itemId].filter(Boolean).map(normalizeId);
      ids.forEach((id) => byId.set(id, m));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastOrderToday = await Order.findOne({
      restaurantId: rid,
      createdAt: { $gte: today },
    })
      .sort({ createdAt: -1 })
      .lean();

    let nextOrderNumber = 1;
    if (lastOrderToday) {
      const prevNumber =
        lastOrderToday.OrderNumberForDay ||
        (lastOrderToday.items?.[0]?.OrderNumberForDay ?? 0);
      nextOrderNumber = prevNumber + 1;
    }

    const resolvedItems = [];
    for (const [idx, it] of (items || []).entries()) {
      const providedId = it.menuItemId || it.itemId || it.id;
      const normalizedId = normalizeId(providedId);
      const menuItem = byId.get(normalizedId);
      if (!menuItem) continue;
      const qty = Math.max(1, Number(it.quantity ?? it.qty ?? 1));
      const authoritativePrice = Number(
        it.priceAtOrder ?? it.price ?? menuItem.price ?? 0
      );
      resolvedItems.push({
        menuItemId: new mongoose.Types.ObjectId(menuItem._id),
        name: menuItem.name || it.name || "Item",
        quantity: qty,
        price: authoritativePrice,
        priceAtOrder: authoritativePrice,
        OrderNumberForDay: nextOrderNumber,
        notes: it.notes || "",
        status: it.status || "placed",
        modifiers: it.modifiers || [],
      });
    }

    const baseTotal = resolvedItems.reduce(
      (sum, r) => sum + r.priceAtOrder * (r.quantity || 1),
      0
    );

    let cfg = null;
    let appliedTaxes = [];
    let appliedDiscountPercent = 0;
    let appliedServiceChargePercent = 0;
    let pricingConfigVersion = null;

    try {
      const adminDoc = await Admin.findOne({ restaurantId: rid });
      if (adminDoc?.getActivePricingConfig)
        cfg = adminDoc.getActivePricingConfig();
      if (!cfg) cfg = await getPricingConfig(rid);
      if (cfg) {
        appliedTaxes = (cfg.taxes || []).map((t) => ({
          name: t.name,
          percent: Number(t.percent || 0),
          code: t.code || "",
        }));
        appliedDiscountPercent = Number(cfg.globalDiscountPercent || 0);
        appliedServiceChargePercent = Number(
          cfg.serviceCharge || cfg.serviceChargePercent || 0
        );
        pricingConfigVersion = cfg.version ? Number(cfg.version) : null;
      }
    } catch (e) {
      logger?.warn?.("[createOrder] failed to fetch Admin pricing config", e);
    }

    const totals = computeTotalsFromOrderSnapshot({
      items: resolvedItems,
      appliedTaxes,
      appliedDiscountPercent,
      appliedServiceChargePercent,
      extras,
    });

    const orderDoc = new Order({
      restaurantId: rid,
      tableId,
      sessionId,
      items: resolvedItems,
      status: "placed",
      paymentStatus: "unpaid",
      isCustomerOrder:
        typeof isCustomerOrder === "boolean" ? isCustomerOrder : true,
      customerName,
      customerContact: customerContact || null,
      customerEmail: customerEmail || null,
      staffAlias: staffAlias || null,
      version: 1,
      OrderNumberForDay: nextOrderNumber,
      pricingConfigVersion,
      pricingConfigId: cfg?._id ? String(cfg._id) : null,
    });

    orderDoc.appliedTaxes = (totals.taxBreakdown || []).map((t) => ({
      name: t.name || "Tax",
      percent: Number(t.rate ?? t.percent ?? 0),
      code: t.code || t.name?.toUpperCase()?.replace(/\s+/g, "_") || "",
      amount: Number(Number(t.amount || 0).toFixed(2)),
    }));

    orderDoc.appliedDiscountPercent = Number(
      totals.discountPercent ?? appliedDiscountPercent
    );
    orderDoc.appliedServiceChargePercent = Number(
      totals.serviceChargePercent ?? appliedServiceChargePercent
    );
    orderDoc.subtotal = Number(
      Number(totals.subtotal || baseTotal || 0).toFixed(2)
    );
    orderDoc.extrasTotal = Number(
      Number(
        totals.extrasTotal ||
          (extras || []).reduce((s, e) => s + Number(e.amount || 0), 0)
      ).toFixed(2)
    );
    orderDoc.taxAmount = Number(Number(totals.taxAmount || 0).toFixed(2));
    orderDoc.serviceChargeAmount = Number(
      Number(totals.serviceChargeAmount || 0).toFixed(2)
    );
    orderDoc.discountAmount = Number(
      Number(totals.discountAmount || 0).toFixed(2)
    );
    orderDoc.totalAmount = Number(Number(totals.total || 0).toFixed(2));

    await orderDoc.save();

    // Update Table
    if (Table) {
      try {
        await Table.findOneAndUpdate(
          { _id: tableId, restaurantId: rid },
          {
            $set: {
              status: "occupied",
              CurrentOrderId: orderDoc._id,
              lastUsed: new Date(),
              updatedAt: new Date(),
            },
          }
        );
      } catch (e) {
        logger?.warn?.("[createOrder] failed to update table status", e);
      }
    }

    // Notify subscribers
    safePublish(`restaurant:${rid}:orders`, {
      event: "orderCreated",
      data: orderDoc,
    });

    return res.status(201).json({
      order: orderDoc,
      preBill: {
        subtotal: totals.subtotal,
        taxes: totals.taxBreakdown,
        serviceCharge: totals.serviceChargeAmount,
        discount: totals.discountAmount,
        total: totals.total,
      },
    });
  } catch (err) {
    logger?.error?.("[createOrder] error:", err);
    return next(err);
  }
}

/**
 * Update order status (optimistic locking support)
 * PATCH /api/:rid/orders/:id/status
 * Body: { status, staffAlias, version }
 */
async function updateOrderStatus(req, res, next) {
  console.log("[updateOrderStatus] enter", {
    params: req.params,
    body: req.body,
  });

  try {
    const { rid, id } = req.params;
    const { status, staffAlias, version } = req.body || {};

    if (!rid || !id || !status)
      return res.status(400).json({ error: "Missing parameters" });

    // Normalize status
    const canonical = STATUS_MAP[String(status).toLowerCase()] || status;

    const update = {
      status: canonical,
      staffAlias: staffAlias || null,
      updatedAt: new Date(),
    };

    // ====== Update with optimistic version lock ======
    let order;
    if (typeof version !== "undefined") {
      order = await Order.findOneAndUpdate(
        { _id: id, restaurantId: rid, version },
        { $set: update, $inc: { version: 1 } },
        { new: true }
      );
      if (!order) {
        const current = await Order.findOne({
          _id: id,
          restaurantId: rid,
        }).lean();
        return res.status(409).json({ error: "Version mismatch", current });
      }
    } else {
      order = await Order.findOneAndUpdate(
        { _id: id, restaurantId: rid },
        { $set: update, $inc: { version: 1 } },
        { new: true }
      );
    }

    // ====== Notify real-time subscribers ======
    safePublish(`restaurant:${rid}:tables:${order.tableId}`, {
      event: "orderUpdated",
      data: order,
    });

    // ====== Auto-reset table if order is done/completed/cancelled ======
    if (["done", "completed", "cancelled"].includes(order.status) && Table) {
      try {
        await Table.findOneAndUpdate(
          { _id: order.tableId, restaurantId: rid },
          {
            $set: {
              status: "available",
              CurrentOrderId: null,
              currentSessionId: null,
              updatedAt: new Date(),
            },
          }
        );
        console.log(
          `[updateOrderStatus] Table ${order.tableId} reset to 'available' ✅`
        );
      } catch (e) {
        logger?.warn?.("[updateOrderStatus] failed to reset table", e);
      }
    }

    return res.json(order);
  } catch (err) {
    logger?.error?.("[updateOrderStatus] error:", err);
    return next(err);
  }
}

/**
 * getActiveOrders - returns active orders, optionally including terminal statuses
 * GET /api/:rid/orders/active
 */
async function getActiveOrders(req, res, next) {
  console.log("[getActiveOrders] enter", {
    params: req.params,
    query: req.query,
  });
  try {
    const rid = req.params?.rid || req.query?.rid;
    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });

    const includeTerminal =
      typeof req.query?.includeTerminal === "string"
        ? req.query.includeTerminal.toLowerCase() !== "false"
        : true;
    const statuses = includeTerminal
      ? ["placed", "accepted", "preparing", "ready", "served"]
      : ["placed", "accepted", "preparing"];

    const orders = await Order.find({
      restaurantId: rid,
      status: { $in: statuses },
    })
      .populate({ path: "tableId", select: "tableNumber" })
      .sort({ createdAt: -1 })
      .lean();

    const denorm = orders.map((o) => {
      const out = { ...o };
      if (out.tableId && typeof out.tableId === "object") {
        out.tableNumber = out.tableId.tableNumber ?? null;
        out.tableId = String(out.tableId._id);
      } else {
        out.tableNumber = out.tableNumber ?? null;
        out.tableId = out.tableId ? String(out.tableId) : null;
      }
      return out;
    });

    return res.json(denorm);
  } catch (err) {
    logger &&
      logger.error &&
      logger.error(
        "[getActiveOrders] error:",
        err && err.stack ? err.stack : err
      );
    return next(err);
  }
}

/**
 * getOrderHistory - GET /api/:rid/orders/history
 * Query params support: sessionId, date, startDate, endDate, limit, page, sort
 */
async function getOrderHistory(req, res, next) {
  console.log("[getOrderHistory] enter", {
    params: req.params,
    query: req.query,
  });
  try {
    const { rid } = req.params;
    const {
      sessionId: querySessionId,
      date,
      startDate,
      endDate,
      limit,
      page,
      sort,
    } = req.query || {};
    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });

    // determine if request from staff (req.user)
    const userRole = req.user && (req.user.role || req.user.roles);
    const isStaff = userRole === "staff" || userRole === "admin";

    if (!isStaff && !querySessionId)
      return res
        .status(400)
        .json({ error: "sessionId query required for non-staff" });

    // date filters
    const dateFilter = {};
    if (date) {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime()))
        return res.status(400).json({ error: "invalid date param" });
      const s = new Date(
        Date.UTC(
          parsed.getUTCFullYear(),
          parsed.getUTCMonth(),
          parsed.getUTCDate(),
          0,
          0,
          0
        )
      );
      const e = new Date(
        Date.UTC(
          parsed.getUTCFullYear(),
          parsed.getUTCMonth(),
          parsed.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );
      dateFilter.createdAt = { $gte: s, $lte: e };
    } else if (startDate || endDate) {
      const s = startDate ? new Date(startDate) : new Date(0);
      const e = endDate ? new Date(endDate) : new Date();
      if ((startDate && isNaN(s.getTime())) || (endDate && isNaN(e.getTime())))
        return res.status(400).json({ error: "invalid startDate or endDate" });
      const ss = new Date(
        Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate(), 0, 0, 0)
      );
      const ee = new Date(
        Date.UTC(
          e.getUTCFullYear(),
          e.getUTCMonth(),
          e.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );
      dateFilter.createdAt = { $gte: ss, $lte: ee };
    }

    const baseQuery = { restaurantId: rid, status: "done", ...dateFilter };
    if (!isStaff) baseQuery.sessionId = querySessionId;
    else if (querySessionId) baseQuery.sessionId = querySessionId;

    const perPage = Math.min(parseInt(limit, 10) || 25, 200);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const sortOption = sort || "-createdAt";

    const [total, orders] = await Promise.all([
      Order.countDocuments(baseQuery),
      Order.find(baseQuery)
        .sort(sortOption)
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
    ]);

    return res.json({
      meta: {
        total,
        page: pageNum,
        perPage,
        pages: Math.ceil(total / perPage),
      },
      data: orders,
    });
  } catch (err) {
    logger &&
      logger.error &&
      logger.error(
        "[getOrderHistory] error:",
        err && err.stack ? err.stack : err
      );
    return next(err);
  }
}

/**
 * deleteOrderById - DELETE /api/:rid/orders/:id
 */
async function deleteOrderById(req, res, next) {
  console.log("[deleteOrderById] enter", { params: req.params });
  try {
    const { rid, id } = req.params;
    if (!rid || !id)
      return res.status(400).json({ error: "Missing parameters" });

    const order = await Order.findOneAndDelete({ _id: id, restaurantId: rid });
    if (!order) return res.status(404).json({ error: "Order not found" });

    safePublish(`restaurant:${rid}:orders`, {
      event: "orderDeleted",
      data: { orderId: id },
    });

    return res.json({ message: "Order deleted", order });
  } catch (err) {
    logger &&
      logger.error &&
      logger.error(
        "[deleteOrderById] error:",
        err && err.stack ? err.stack : err
      );
    return next(err);
  }
}

/**
 * getOrderWaiters - returns normalized waiter names
 * GET /api/:rid/orders/waiters
 * Public endpoint - no auth required since it just returns waiter names
 */
async function getOrderWaiters(req, res, next) {
  logger?.info?.("[getOrderWaiters] enter", { params: req.params });
  try {
    const { rid } = req.params;
    if (!rid) {
      return res.status(400).json({ error: "Missing restaurant id (rid)" });
    }

    // Cache headers for performance
    res.set("Cache-Control", "public, max-age=60"); // Cache for 1 minute

    const admin = await Admin.findOne({ restaurantId: rid })
      .select("waiterNames")
      .lean();

    if (!admin) {
      return res.json({
        waiterNames: [],
        error: "No waiters configured",
      });
    }

    // Normalize waiter names
    const normalized = [];
    const seen = new Set();

    if (Array.isArray(admin.waiterNames)) {
      for (const n of admin.waiterNames) {
        if (!n || typeof n !== "string") continue;
        const trimmed = n.trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        normalized.push(trimmed);
      }
    }

    return res.json({
      waiterNames: normalized,
      count: normalized.length,
    });
  } catch (err) {
    logger?.error?.("[getOrderWaiters] error:", err?.stack || err);
    return next(err);
  }
}

/**
 * Get order details by id (public / customer view)
 * GET /api/:rid/orders/:orderId
 * Returns the same shape you returned on createOrder: { order: ... }
 */
async function getOrderById(req, res, next) {
  console.log("[getOrderById] enter", { params: req.params, query: req.query });

  try {
    const { rid, orderId } = req.params;

    if (!rid || !orderId) {
      return res
        .status(400)
        .json({ error: "Missing parameters (rid, orderId)" });
    }

    // Find order strictly scoped to restaurant
    const order = await Order.findOne({
      _id: orderId,
      restaurantId: rid,
    }).lean();

    if (!order) {
      return res
        .status(404)
        .json({ error: `Order not found for id ${orderId}` });
    }

    // Optional: keep response customer-safe (you already return full doc in createOrder)
    // Here we mirror createOrder and return { order } directly for consistency.
    return res.status(200).json({ order });
  } catch (err) {
    console.error("❌ [getOrderById] error:", err);
    return next(err);
  }
}

/** getOrdersByTable - GET /api/:rid/orders/table/:tableId
 *
 * Fetches all active (non-closed) orders for the given tableId.
 */
async function getOrdersByTable(req, res, next) {
  try {
    const { rid, tableId } = req.params;
    if (!rid || !tableId) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const orders = await Order.find({
      restaurantId: rid,
      tableId: tableId,
      status: { $ne: "done" }, // Exclude closed orders
    })
      .sort("-createdAt")
      .lean();

    return res.json({ data: orders });
  } catch (err) {
    logger?.error?.("[getOrdersByTable] error:", err?.stack || err);
    return next(err);
  }
}

/**
 * getBillByOrderId - GET /api/:rid/bills/order/:orderId
 *
 * Fetches the latest (or only) bill associated with the given orderId.
 * Ensures rid and orderId are valid, handles not founds gracefully.
 */
async function getBillByOrderId(req, res, next) {
  console.log("[getBillByOrderId] enter", { params: req.params });

  try {
    const { rid, orderId } = req.params;
    if (!rid || !orderId) {
      return res
        .status(400)
        .json({ error: "Missing parameters (rid, orderId)" });
    }

    // Defensive require
    let Bill;
    try {
      Bill = require("../models/bill.model");
    } catch (e) {
      console.error("[getBillByOrderId] ⚠️ Bill model not available:", e);
      return res.status(501).json({ error: "Bill model not configured" });
    }

    const bill = await Bill.findOne({
      restaurantId: rid,
      orderId: new mongoose.Types.ObjectId(orderId),
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!bill) {
      return res
        .status(404)
        .json({ error: `No bill found for orderId ${orderId}` });
    }

    // ✅ Normalize collections
    bill.taxes = Array.isArray(bill.taxes) ? bill.taxes : [];
    bill.extras = Array.isArray(bill.extras) ? bill.extras : [];

    // ✅ Handle legacy serviceCharge field
    if (bill.serviceCharge && !bill.serviceChargeAmount) {
      bill.serviceChargeAmount = bill.serviceCharge;
    }

    // ✅ Safe numeric normalization
    bill.subtotal = Number(bill.subtotal || 0);
    bill.discountAmount = Number(bill.discountAmount || 0);
    bill.taxAmount = Number(bill.taxAmount || 0);
    bill.totalAmount = Number(bill.totalAmount || 0);

    // ✅ Bidirectional normalization for discount/service charge percents
    bill.appliedDiscountPercent = Number(
      bill.appliedDiscountPercent ?? bill.discountPercent ?? 0
    );
    bill.discountPercent = Number(
      bill.discountPercent ?? bill.appliedDiscountPercent ?? 0
    );

    bill.appliedServiceChargePercent = Number(
      bill.appliedServiceChargePercent ?? bill.serviceChargePercent ?? 0
    );
    bill.serviceChargePercent = Number(
      bill.serviceChargePercent ?? bill.appliedServiceChargePercent ?? 0
    );

    // ✅ Compute service charge if missing
    const baseSubtotal = Number(bill.subtotal || 0);
    const servicePercent = bill.appliedServiceChargePercent || 0;
    bill.serviceChargeAmount =
      bill.serviceChargeAmount && bill.serviceChargeAmount > 0
        ? Number(bill.serviceChargeAmount)
        : (baseSubtotal * servicePercent) / 100;

    // ✅ Derived totals
    bill.subtotalWithExtras = Number(bill.subtotalWithExtras || bill.subtotal);
    bill.extrasTotal = Array.isArray(bill.extras)
      ? bill.extras.reduce((s, e) => s + (Number(e.amount) || 0), 0)
      : 0;

    // ✅ Normalize taxes
    bill.taxes = bill.taxes.map((t) => ({
      name: t.name || "",
      rate: Number(t.rate ?? t.percent ?? 0),
      amount: Number(t.amount || 0),
      code: t.code || undefined,
    }));

    // ✅ Always re-derive total for consistency
    const recomputedTotal =
      bill.subtotal -
      bill.discountAmount +
      bill.serviceChargeAmount +
      bill.taxAmount +
      bill.extrasTotal;

    if (Math.abs((bill.totalAmount || 0) - recomputedTotal) > 0.01) {
      console.warn(
        "[getBillByOrderId] ⚠️ Correcting total mismatch",
        bill.totalAmount,
        "→",
        recomputedTotal
      );
      bill.totalAmount = recomputedTotal;
    }

    // ✅ Safe copy with Mongo ID preserved
    const safeBill = {
      ...bill,
      id: bill._id,
      _id: bill._id,
      __v: undefined,
    };

    console.log("[getBillByOrderId] ✅ returning normalized bill:", {
      id: safeBill.id,
      subtotal: safeBill.subtotal,
      discountPercent: safeBill.appliedDiscountPercent,
      serviceChargePercent: safeBill.appliedServiceChargePercent,
      totalAmount: safeBill.totalAmount,
    });

    return res.json(safeBill);
  } catch (err) {
    console.error("[getBillByOrderId] ❌ error:", err?.stack || err);
    return next(err);
  }
}
async function getBillByOrderIdPublic(req, res, next) {
  console.log("[getBillByOrderIdPublic] enter", {
    params: req.params,
    query: req.query,
  });

  try {
    const { rid, orderId } = req.params;
    const { sessionId } = req.query;

    if (!rid || !orderId) {
      return res
        .status(400)
        .json({ error: "Missing parameters (rid, orderId)" });
    }

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId in query" });
    }

    // Defensive require
    let Bill, Order;
    try {
      Bill = require("../models/bill.model");
      Order = require("../models/order.model");
    } catch (e) {
      console.error("[getBillByOrderIdPublic] ⚠️ Missing models:", e);
      return res.status(501).json({ error: "Bill model not configured" });
    }

    // ✅ Validate the order & session match
    const order = await Order.findOne({
      _id: new mongoose.Types.ObjectId(orderId),
      restaurantId: rid,
    })
      .select("sessionId tableId totalAmount createdAt updatedAt")
      .lean();

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.sessionId !== sessionId) {
      console.warn("[getBillByOrderIdPublic] session mismatch", {
        orderId,
        sessionId,
      });
      return res
        .status(403)
        .json({ error: "Unauthorized: Invalid session for this order" });
    }

    // ✅ Fetch latest bill for that order
    const bill = await Bill.findOne({
      restaurantId: rid,
      orderId: new mongoose.Types.ObjectId(orderId),
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!bill) {
      return res
        .status(404)
        .json({ error: `No bill found for orderId ${orderId}` });
    }

    // ===== Normalize & sanitize (same logic as admin version) =====
    bill.taxes = Array.isArray(bill.taxes) ? bill.taxes : [];
    bill.extras = Array.isArray(bill.extras) ? bill.extras : [];
    bill.subtotal = Number(bill.subtotal || 0);
    bill.discountAmount = Number(bill.discountAmount || 0);
    bill.taxAmount = Number(bill.taxAmount || 0);
    bill.totalAmount = Number(bill.totalAmount || 0);
    bill.serviceChargeAmount = Number(bill.serviceChargeAmount || 0);

    // Recalculate total consistency
    const extrasTotal = bill.extras.reduce(
      (s, e) => s + (Number(e.amount) || 0),
      0
    );
    const recomputedTotal =
      bill.subtotal -
      bill.discountAmount +
      bill.serviceChargeAmount +
      bill.taxAmount +
      extrasTotal;

    if (Math.abs((bill.totalAmount || 0) - recomputedTotal) > 0.01) {
      console.warn("[getBillByOrderIdPublic] correcting total mismatch");
      bill.totalAmount = recomputedTotal;
    }

    // 🧹 Sanitize before returning
    const safeBill = {
      billId: bill._id,
      orderId: order._id,
      restaurantId: rid,
      tableId: order.tableId,
      subtotal: bill.subtotal,
      discountAmount: bill.discountAmount,
      serviceChargeAmount: bill.serviceChargeAmount,
      taxAmount: bill.taxAmount,
      extras: bill.extras,
      taxes: bill.taxes.map((t) => ({
        name: t.name,
        rate: t.rate ?? t.percent ?? 0,
        amount: t.amount ?? 0,
      })),
      totalAmount: bill.totalAmount,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    };

    console.log("[getBillByOrderIdPublic] ✅ returning safe bill:", {
      orderId,
      sessionId,
      total: safeBill.totalAmount,
    });

    return res.json({ bill: safeBill });
  } catch (err) {
    console.error("[getBillByOrderIdPublic] ❌ error:", err?.stack || err);
    return next(err);
  }
}

/**
 * PATCH /api/:rid/orders/:id
 * Used to sync Order fields when a Bill is finalized or paid
 */
async function updateOrderFromBill(req, res) {
  const { rid, id } = req.params;
  const body = req.body;

  console.group(`🧾 [updateOrderFromBill] PATCH /api/${rid}/orders/${id}`);
  console.log("Incoming update payload:", body);

  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, restaurantId: rid },
      { $set: body },
      { new: true }
    );

    if (!updatedOrder) {
      console.warn(
        `⚠️ No matching order found for restaurantId=${rid}, orderId=${id}`
      );
      console.groupEnd();
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("✅ Order updated successfully:", {
      orderId: updatedOrder._id,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
      isOrderComplete: updatedOrder.isOrderComplete,
    });

    console.groupEnd();
    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error("❌ [updateOrderFromBill] Error updating order:", err);
    console.groupEnd();
    res
      .status(500)
      .json({ message: "Failed to update order", error: err.message });
  }
}

module.exports = {
  createOrder,
  updateOrderStatus,
  getActiveOrders,
  getOrderHistory,
  deleteOrderById,
  getOrderWaiters,
  getOrdersByTable,
  getOrderById,
  getBillByOrderId,
  getBillByOrderIdPublic,
  updateOrderFromBill,
};
