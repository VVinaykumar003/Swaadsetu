// controllers/call.controller.js
// Traditional HTTP-based call system — auto-fetches active order info, no Redis, no sockets.

const Call = require("../models/call.model");
const mongoose = require("mongoose");

// ---------------------- LOGGER (DEFENSIVE) ----------------------
let logger = console;
try {
  logger = require("../common/libs/logger") || console;
} catch (e) {
  console.warn("Logger not found, using console fallback.");
}

// ---------------------- HELPERS (DEFENSIVE) ----------------------
let helpers = null;
try {
  helpers = require("../common/libs/helpers");
} catch (e) {
  helpers = null;
  logger.warn &&
    logger.warn("helpers not found; staffAlias validation skipped.");
}

const ensureStaffAliasValid =
  helpers?.ensureStaffAliasValid || (async () => true);

// ---------------------- IDEMPOTENCY CACHE ----------------------
const localIdempotencyCache = new Map();
function storeLocalIdempotency(key, value, ttlSec = 3600) {
  localIdempotencyCache.set(key, {
    value,
    expires: Date.now() + ttlSec * 1000,
  });
  setTimeout(() => localIdempotencyCache.delete(key), ttlSec * 1000);
}
function checkLocalIdempotency(key) {
  const entry = localIdempotencyCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    localIdempotencyCache.delete(key);
    return null;
  }
  return entry.value;
}

// ===============================================================
// ✅ CREATE CALL  (PUBLIC / CUSTOMER SIDE)
// ===============================================================
async function createCall(req, res, next) {
  try {
    const { rid } = req.params;
    let { tableId, tableNumber, type, notes, staffAlias } = req.body;

    if (!type) {
      return res.status(400).json({ error: "Missing required field: type" });
    }

    // ✅ Resolve tableNumber → tableId if needed
    if (!tableId && tableNumber) {
      try {
        const Table = require("../models/table.model");
        const query = mongoose.Types.ObjectId.isValid(tableNumber)
          ? { _id: tableNumber }
          : { tableNumber };
        const tableDoc = await Table.findOne({ restaurantId: rid, ...query });
        if (!tableDoc)
          return res.status(404).json({ error: "Table not found" });
        tableId = tableDoc._id.toString();
      } catch (err) {
        logger.warn("Could not resolve tableNumber to tableId:", err);
      }
    }

    if (!tableId) {
      return res
        .status(400)
        .json({ error: "Missing required field: tableId or tableNumber" });
    }

    // Optional: validate staffAlias if sent
    if (staffAlias) {
      const valid = await ensureStaffAliasValid(rid, staffAlias);
      if (!valid) return res.status(400).json({ error: "Invalid staffAlias" });
    }

    // Step 1️⃣ Fetch active order info
    let orderInfo = {};
    try {
      const Order = require("../models/order.model");
      const activeOrder = await Order.findOne({
        restaurantId: rid,
        tableId,
        status: { $in: ["active", "placed"] },
      });

      if (activeOrder) {
        orderInfo = {
          orderId: activeOrder._id.toString(),
          sessionId: activeOrder.sessionId,
          customerName: activeOrder.customerName,
          customerContact: activeOrder.customerContact,
        };
      }
    } catch (e) {
      logger.warn("Order model unavailable or no active order found.");
    }

    // Step 2️⃣ Fallback if no active order
    const sessionId =
      orderInfo.sessionId ||
      `call-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Step 3️⃣ Create and save call
    const call = new Call({
      restaurantId: rid,
      tableId,
      sessionId,
      orderId: orderInfo.orderId,
      type,
      notes,
      customerName: orderInfo.customerName,
      customerContact: orderInfo.customerContact,
      staffAlias,
    });

    await call.save();
    return res.status(201).json(call);
  } catch (error) {
    logger.error && logger.error("Call creation error:", error);
    return next(error);
  }
}

// ===============================================================
// ✅ RESOLVE CALL (STAFF / ADMIN)
// ===============================================================
async function resolveCall(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { staffAlias } = req.body;

    // 🔒 Authorization check
    const userRole = req.user?.role;
    if (!["staff", "admin"].includes(userRole)) {
      return res
        .status(403)
        .json({ error: "Forbidden: staff/admin required to resolve call" });
    }

    if (!staffAlias) {
      return res.status(400).json({ error: "Staff alias required" });
    }

    const valid = await ensureStaffAliasValid(rid, staffAlias);
    if (!valid) return res.status(400).json({ error: "Invalid staffAlias" });

    const call = await Call.findOneAndUpdate(
      { _id: id, restaurantId: rid, status: "active" },
      {
        status: "resolved",
        staffAlias,
        resolvedAt: Date.now(),
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!call) {
      return res
        .status(404)
        .json({ error: "Call not found or already resolved" });
    }

    return res.json(call);
  } catch (error) {
    logger.error && logger.error("Call resolution error:", error);
    return next(error);
  }
}

// ===============================================================
// ✅ GET ACTIVE CALLS (STAFF / ADMIN)
// ===============================================================
async function getActiveCalls(req, res, next) {
  try {
    const { rid } = req.params;
    const userRole = req.user?.role;

    if (!["staff", "admin"].includes(userRole)) {
      return res
        .status(403)
        .json({ error: "Forbidden: staff/admin required to view calls" });
    }

    const calls = await Call.find({ restaurantId: rid, status: "active" }).sort(
      { createdAt: -1 }
    );
    return res.json(calls);
  } catch (error) {
    logger.error && logger.error("Active calls fetch error:", error);
    return next(error);
  }
}

// ===============================================================
// ✅ GET RESOLVED CALLS (STAFF / ADMIN)
// ===============================================================
async function getResolvedCalls(req, res, next) {
  try {
    const { rid } = req.params;
    const userRole = req.user?.role;

    if (!["staff", "admin"].includes(userRole)) {
      return res
        .status(403)
        .json({ error: "Forbidden: staff/admin required to view history" });
    }

    const calls = await Call.find({
      restaurantId: rid,
      status: "resolved",
    }).sort({ resolvedAt: -1 });
    return res.json(calls);
  } catch (error) {
    logger.error && logger.error("Resolved calls fetch error:", error);
    return next(error);
  }
}

// ===============================================================
module.exports = {
  createCall,
  resolveCall,
  getActiveCalls,
  getResolvedCalls,
};
