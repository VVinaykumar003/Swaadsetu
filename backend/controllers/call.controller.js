// controllers/call.controller.js
// Hardened version: safe when Redis helpers are missing (no-op fallback).
// Keeps original behavior when checkIdempotency/publishEvent are available.

const Call = require("../models/call.model");

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

// Create new call
async function createCall(req, res, next) {
  try {
    const { rid } = req.params;
    const { tableId, sessionId, type, staffAlias } = req.body;

    // Validate required fields
    if (!tableId || !sessionId || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Handle idempotency if implemented
    const headerKey =
      req.headers["x-idempotency-key"] || req.headers["x-idempotency"];
    const idempotencyKey =
      headerKey && typeof headerKey === "string"
        ? `idempotency:call:${rid}:${sessionId}:${headerKey}`
        : null;

    if (idempotencyKey) {
      const existing = await safeCheckIdempotency(idempotencyKey);
      if (existing) {
        return res
          .status(409)
          .json({ error: "Duplicate request", call: existing });
      }
    }

    // Create call
    const call = new Call({
      restaurantId: rid,
      tableId,
      sessionId,
      type,
      staffAlias,
    });

    await call.save();

    // Publish event (safe no-op if publish unavailable)
    safePublish(`restaurant:${rid}:staff`, {
      event: "callCreated",
      data: call,
    });

    res.status(201).json(call);
  } catch (error) {
    logger && logger.error && logger.error("Call creation error:", error);
    next(error);
  }
}

// Resolve call
async function resolveCall(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { staffAlias } = req.body;

    if (!staffAlias) {
      return res.status(400).json({ error: "Staff alias required" });
    }

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

    // Publish event (safe no-op if publish unavailable)
    safePublish(`restaurant:${rid}:tables:${call.tableId}`, {
      event: "callResolved",
      data: call,
    });

    res.json(call);
  } catch (error) {
    logger && logger.error && logger.error("Call resolution error:", error);
    next(error);
  }
}

// Get active calls for restaurant
async function getActiveCalls(req, res, next) {
  try {
    const { rid } = req.params;
    const calls = await Call.find({
      restaurantId: rid,
      status: "active",
    }).sort({ createdAt: -1 });

    res.json(calls);
  } catch (error) {
    logger && logger.error && logger.error("Active calls fetch error:", error);
    next(error);
  }
}

module.exports = {
  createCall,
  resolveCall,
  getActiveCalls,
};
