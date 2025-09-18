// controllers/bill.controller.js
const Bill = require("../models/bill.model");

// Defensive logger (fallback to console)
let logger = console;
try {
  logger = require("../common/libs/logger") || console;
} catch (e) {
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

      // checkIdempotency may be exported as named or default or direct function
      if (!checkIdempotency) {
        checkIdempotency =
          mod.checkIdempotency ||
          mod.check_idempotency ||
          (typeof mod === "function" ? mod : null);
      }

      // publishEvent may be exported as publishEvent, publish, or the module itself might be the function
      if (!publishEvent) {
        publishEvent =
          mod.publishEvent ||
          mod.publish ||
          (typeof mod === "function" ? mod : null);
      }

      // If we've found at least one helpful function, stop searching
      if (checkIdempotency || publishEvent) break;
    } catch (err) {
      // ignore missing module, try next candidate
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

// Safe wrappers
async function safeCheckIdempotency(key) {
  if (typeof checkIdempotency !== "function") return null;
  try {
    return await checkIdempotency(key);
  } catch (err) {
    logger && logger.error && logger.error("checkIdempotency error:", err);
    // On error, return null so the request proceeds (do not block user)
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

// Create new bill
async function createBill(req, res, next) {
  try {
    const { rid } = req.params;
    const {
      tableId,
      sessionId,
      items,
      tax = 0,
      serviceCharge = 0,
      staffAlias,
      overrideToken,
    } = req.body;

    // Validate required fields
    if (!tableId || !sessionId || !items?.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Handle idempotency if implemented
    const headerKey =
      req.headers["x-idempotency-key"] || req.headers["x-idempotency"];
    const idempotencyKey =
      headerKey && typeof headerKey === "string"
        ? `idempotency:bill:${rid}:${sessionId}:${headerKey}`
        : null;

    if (idempotencyKey) {
      const existing = await safeCheckIdempotency(idempotencyKey);
      if (existing) {
        return res
          .status(409)
          .json({ error: "Duplicate request", bill: existing });
      }
    }

    // Calculate amounts (guard numeric fields)
    const subtotal = (items || []).reduce((sum, item) => {
      const price =
        typeof item.price === "number" ? item.price : Number(item.price) || 0;
      const qty =
        typeof item.quantity === "number"
          ? item.quantity
          : Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);

    const totalAmount =
      subtotal + (Number(tax) || 0) + (Number(serviceCharge) || 0);

    // Create bill
    const bill = new Bill({
      restaurantId: rid,
      tableId,
      sessionId,
      items,
      subtotal,
      tax,
      serviceCharge,
      totalAmount,
      staffAlias,
      overrideToken,
    });

    await bill.save();

    // Publish event (safe no-op if publishEvent unavailable)
    safePublish(`restaurant:${rid}:tables:${tableId}`, {
      event: "billGenerated",
      data: bill,
    });

    res.status(201).json(bill);
  } catch (error) {
    logger && logger.error && logger.error("Bill creation error:", error);
    next(error);
  }
}

// Update bill payment status
async function updatePaymentStatus(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { paymentStatus, staffAlias, overrideToken } = req.body;

    if (!["paid", "unpaid"].includes(paymentStatus)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    const bill = await Bill.findOneAndUpdate(
      { _id: id, restaurantId: rid },
      {
        paymentStatus,
        staffAlias,
        overrideToken,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    // Publish event
    safePublish(`restaurant:${rid}:tables:${bill.tableId}`, {
      event: "billUpdated",
      data: bill,
    });

    res.json(bill);
  } catch (error) {
    logger && logger.error && logger.error("Bill payment update error:", error);
    next(error);
  }
}

// Get active bills (unpaid) for restaurant
async function getActiveBills(req, res, next) {
  try {
    const { rid } = req.params;
    const bills = await Bill.find({
      restaurantId: rid,
      paymentStatus: "unpaid",
    }).sort({ createdAt: -1 });

    res.json(bills);
  } catch (error) {
    logger && logger.error && logger.error("Active bills fetch error:", error);
    next(error);
  }
}

// Get bill history for session or date range
async function getBillsHistory(req, res, next) {
  try {
    const { rid } = req.params;
    const { sessionId, startDate, endDate } = req.query;

    const filter = { restaurantId: rid };

    if (sessionId) {
      filter.sessionId = sessionId;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const bills = await Bill.find(filter).sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    logger && logger.error && logger.error("Bill history fetch error:", error);
    next(error);
  }
}

module.exports = {
  createBill,
  updatePaymentStatus,
  getActiveBills,
  getBillsHistory,
};
