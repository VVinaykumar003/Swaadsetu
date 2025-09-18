// controllers/order.controller.js
// Hardened version: safe when Redis helpers are missing (no-op fallback).
// Preserves original behavior when checkIdempotency/publishEvent are available.

const Order = require("../models/order.model");

// Defensive logger (fallback to console)
let logger = console;
try {
  logger = require("../common/libs/logger") || console;
} catch (e) {
  // keep console as fallback
  console.warn("Logger not found, using console as fallback.");
}

// Defensive load for Redis helpers (checkIdempotency, publishEvent)
let checkIdempotency = null;
let publishEvent = null;
(function tryLoadRedisHelpers() {
  const candidates = [
    "../db/redis",
    "../db/redis.helpers",
    "../db/redisHelper",
    "../../db/redis",
    "../../db/redis.helpers",
  ];

  for (const p of candidates) {
    try {
      const mod = require(p);
      if (!mod) continue;

      if (!checkIdempotency) {
        checkIdempotency =
          mod.checkIdempotency ||
          mod.check_idempotency ||
          (typeof mod === "function" ? mod : null);
      }

      if (!publishEvent) {
        publishEvent =
          mod.publishEvent ||
          mod.publish ||
          (typeof mod === "function" ? mod : null);
      }

      if (checkIdempotency || publishEvent) break;
    } catch (err) {
      // ignore and continue searching
    }
  }

  if (!checkIdempotency) {
    logger &&
      logger.warn &&
      logger.warn(
        "checkIdempotency not found; idempotency checks will be skipped."
      );
    checkIdempotency = null;
  }
  if (!publishEvent) {
    logger &&
      logger.warn &&
      logger.warn(
        "publishEvent not found; publish notifications will be no-op."
      );
    publishEvent = null;
  }
})();

// Safe wrappers to avoid crashes/unhandled rejections
async function safeCheckIdempotency(key) {
  if (typeof checkIdempotency !== "function") return null;
  try {
    return await checkIdempotency(key);
  } catch (err) {
    logger && logger.error && logger.error("checkIdempotency error:", err);
    return null;
  }
}

function safePublish(channel, message) {
  if (typeof publishEvent !== "function") return;
  try {
    const res = publishEvent(channel, message);
    if (res && typeof res.then === "function") {
      res.catch((err) => {
        logger &&
          logger.error &&
          logger.error("publishEvent promise rejected:", err);
      });
    }
  } catch (err) {
    logger && logger.error && logger.error("publishEvent error:", err);
  }
}

// Create new order
async function createOrder(req, res, next) {
  try {
    const { rid } = req.params;
    const { tableId, sessionId, items, isCustomerOrder, staffAlias } = req.body;

    // Validate required fields
    if (!tableId || !sessionId || !items?.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Handle idempotency if implemented
    const headerKey =
      req.headers["x-idempotency-key"] || req.headers["x-idempotency"];
    const idempotencyKey =
      headerKey && typeof headerKey === "string"
        ? `idempotency:${rid}:${sessionId}:${headerKey}`
        : null;

    if (idempotencyKey) {
      const existing = await safeCheckIdempotency(idempotencyKey);
      if (existing) {
        return res
          .status(409)
          .json({ error: "Duplicate request", order: existing });
      }
    }

    // Calculate total amount (guard numeric fields)
    const totalAmount = (items || []).reduce((sum, item) => {
      const price =
        typeof item.price === "number" ? item.price : Number(item.price) || 0;
      const qty =
        typeof item.quantity === "number"
          ? item.quantity
          : Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);

    // Normalize isCustomerOrder default properly
    const finalIsCustomerOrder =
      typeof isCustomerOrder === "boolean" ? isCustomerOrder : true;

    // Create order
    const order = new Order({
      restaurantId: rid,
      tableId,
      sessionId,
      items,
      totalAmount,
      isCustomerOrder: finalIsCustomerOrder,
      staffAlias,
    });

    await order.save();

    // Publish event (safe no-op if publishEvent unavailable)
    safePublish(`restaurant:${rid}:staff`, {
      event: "orderCreated",
      data: order,
    });

    res.status(201).json(order);
  } catch (error) {
    logger && logger.error && logger.error("Order creation error:", error);
    next(error);
  }
}

// Update order status
async function updateOrderStatus(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { status, staffAlias } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: id, restaurantId: rid },
      { status, updatedAt: Date.now(), staffAlias },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Publish event (safe no-op if publishEvent unavailable)
    safePublish(`restaurant:${rid}:tables:${order.tableId}`, {
      event: "orderUpdated",
      data: order,
    });

    res.json(order);
  } catch (error) {
    logger && logger.error && logger.error("Order status update error:", error);
    next(error);
  }
}

// Get active orders for restaurant
async function getActiveOrders(req, res, next) {
  try {
    const { rid } = req.params;
    const orders = await Order.find({
      restaurantId: rid,
      status: { $in: ["pending", "approved", "preparing", "ready"] },
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    logger && logger.error && logger.error("Active orders fetch error:", error);
    next(error);
  }
}

// Get order history for session
async function getOrderHistory(req, res, next) {
  try {
    const { rid } = req.params;
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }

    const orders = await Order.find({
      restaurantId: rid,
      sessionId,
      status: "served",
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    logger && logger.error && logger.error("Order history fetch error:", error);
    next(error);
  }
}

module.exports = {
  createOrder,
  updateOrderStatus,
  getActiveOrders,
  getOrderHistory,
};
