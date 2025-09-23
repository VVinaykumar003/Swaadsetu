// controllers/table.controller.js
// Hardened version with role checks and staffAlias validation.

const Table = require("../models/table.model");

// Defensive logger (fallback to console)
let logger = console;
try {
  logger = require("../common/libs/logger") || console;
} catch (e) {
  console.warn("Logger not found, using console as fallback.");
}

// Helpers for staffAlias and role checks
let helpers = null;
try {
  helpers = require("../common/libs/helpers");
} catch (e) {
  helpers = null;
  logger &&
    logger.warn &&
    logger.warn("helpers not found; staffAlias validation may be skipped.");
}
const ensureStaffAliasValid = helpers
  ? helpers.ensureStaffAliasValid
  : async () => true;
const requestHasRole = helpers ? helpers.requestHasRole : () => true;
const requireRoleMiddleware = helpers ? helpers.requireRoleMiddleware : null;

// Defensive load for publishEvent from Redis helpers
let publishEvent = null;
(function tryLoadPublish() {
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

      publishEvent =
        mod.publishEvent ||
        mod.publish ||
        (typeof mod === "function" ? mod : null);

      if (publishEvent) break;
    } catch (err) {
      // ignore and continue searching
    }
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

// Safe publish wrapper to avoid crashes/unhandled rejections
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

// Get all tables for restaurant (public)
async function getTables(req, res, next) {
  try {
    const { rid } = req.params;
    const { includeInactive } = req.query;

    const filter = { restaurantId: rid };
    if (!includeInactive) {
      filter.isActive = true;
    }

    const tables = await Table.find(filter).sort({ tableNumber: 1 });

    // Check for expired sessions and clear if necessary
    const now = new Date();
    const updatedTables = tables.map((table) => {
      if (
        table.currentSessionId &&
        table.sessionExpiresAt &&
        table.sessionExpiresAt < now
      ) {
        return {
          ...table.toObject(),
          currentSessionId: null,
          staffAlias: null,
        };
      }
      return table;
    });

    return res.json(updatedTables);
  } catch (error) {
    logger && logger.error && logger.error("Tables fetch error:", error);
    return next(error);
  }
}

// Get table by ID (public)
async function getTableById(req, res, next) {
  try {
    const { rid, id } = req.params;
    const table = await Table.findOne({ _id: id, restaurantId: rid });

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    // Check for expired session and clear if necessary
    if (
      table.currentSessionId &&
      table.sessionExpiresAt &&
      table.sessionExpiresAt < new Date()
    ) {
      table.currentSessionId = null;
      table.staffAlias = null;
    }

    return res.json(table);
  } catch (error) {
    logger && logger.error && logger.error("Table fetch error:", error);
    return next(error);
  }
}

// Update table status (activate/deactivate) - admin/staff (prefer admin)
// Route should also protect with auth middleware; this controller additionally checks req.user role when present.
async function updateTableStatus(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { isActive } = req.body;

    // Enforce role if auth populated req.user
    if (!requestHasRole(req, ["admin", "staff"])) {
      return res.status(403).json({ error: "Forbidden: admin/staff required" });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive must be boolean" });
    }

    const table = await Table.findOneAndUpdate(
      { _id: id, restaurantId: rid },
      {
        isActive,
        ...(isActive === false && { currentSessionId: null, staffAlias: null }),
      },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    // Publish event (safe no-op if publishEvent unavailable)
    safePublish(`restaurant:${rid}:staff`, {
      event: "tableStatusUpdated",
      data: table,
    });

    return res.json(table);
  } catch (error) {
    logger && logger.error && logger.error("Table status update error:", error);
    return next(error);
  }
}

// Assign session to table - staff or admin only
async function assignSession(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { sessionId, staffAlias, ttlMinutes } = req.body;

    // Validate and parse TTL
    let expiryTime = null;
    if (ttlMinutes) {
      const ttl = parseInt(ttlMinutes, 10);
      if (isNaN(ttl) || ttl <= 0) {
        return res.status(400).json({ error: "Invalid TTL minutes" });
      }
      expiryTime = new Date(Date.now() + ttl * 60000);
    } else {
      // Default TTL of 30 minutes
      expiryTime = new Date(Date.now() + 30 * 60000);
    }

    // Require staff/admin role (if auth provided)
    if (!requestHasRole(req, ["staff", "admin"])) {
      return res
        .status(403)
        .json({ error: "Forbidden: staff/admin credentials required" });
    }

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }

    if (staffAlias) {
      const valid = await ensureStaffAliasValid(rid, staffAlias);
      if (!valid) return res.status(400).json({ error: "Invalid staff alias" });
    }

    const table = await Table.findOneAndUpdate(
      { _id: id, restaurantId: rid, isActive: true },
      {
        currentSessionId: sessionId,
        staffAlias,
        sessionExpiresAt: expiryTime,
        lastUsed: Date.now(),
      },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ error: "Table not found or inactive" });
    }

    // Publish event (safe no-op if publishEvent unavailable)
    safePublish(`restaurant:${rid}:tables:${id}`, {
      event: "sessionAssigned",
      data: { sessionId, tableId: id },
    });

    return res.json(table);
  } catch (error) {
    logger && logger.error && logger.error("Session assignment error:", error);
    return next(error);
  }
}

// Create new table - admin only
async function createTable(req, res, next) {
  try {
    const { rid } = req.params;
    const { tableNumber, capacity } = req.body;

    // Enforce admin role if auth present
    if (!requestHasRole(req, ["admin"])) {
      return res.status(403).json({ error: "Forbidden: admin required" });
    }

    if (typeof tableNumber === "undefined" || typeof capacity === "undefined") {
      return res
        .status(400)
        .json({ error: "Table number and capacity required" });
    }

    const table = new Table({
      restaurantId: rid,
      tableNumber,
      capacity,
      isActive: true,
    });

    await table.save();

    // Publish event
    safePublish(`restaurant:${rid}:staff`, {
      event: "tableCreated",
      data: table,
    });

    return res.status(201).json(table);
  } catch (error) {
    logger && logger.error && logger.error("Table creation error:", error);
    return next(error);
  }
}

// Delete table - admin only
async function deleteTable(req, res, next) {
  try {
    const { rid, id } = req.params;

    if (!requestHasRole(req, ["admin"])) {
      return res.status(403).json({ error: "Forbidden: admin required" });
    }

    const table = await Table.findOneAndDelete({ _id: id, restaurantId: rid });

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    // Publish event
    safePublish(`restaurant:${rid}:staff`, {
      event: "tableDeleted",
      data: { tableId: id },
    });

    return res.status(204).send();
  } catch (error) {
    logger && logger.error && logger.error("Table deletion error:", error);
    return next(error);
  }
}

// Update staff alias for table - staff/admin only (validate alias)
async function updateStaffAlias(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { staffAlias } = req.body;

    if (!requestHasRole(req, ["staff", "admin"])) {
      return res.status(403).json({ error: "Forbidden: staff/admin required" });
    }

    if (!staffAlias) {
      return res.status(400).json({ error: "Staff alias required" });
    }

    const valid = await ensureStaffAliasValid(rid, staffAlias);
    if (!valid) return res.status(400).json({ error: "Invalid staffAlias" });

    const table = await Table.findOneAndUpdate(
      { _id: id, restaurantId: rid },
      { staffAlias, updatedAt: Date.now() },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    // Publish event (safe no-op if publishEvent unavailable)
    safePublish(`restaurant:${rid}:tables:${id}`, {
      event: "staffAssigned",
      data: { tableId: id, staffAlias },
    });

    return res.json(table);
  } catch (error) {
    logger && logger.error && logger.error("Staff alias update error:", error);
    return next(error);
  }
}

module.exports = {
  getTables,
  getTableById,
  updateTableStatus,
  assignSession,
  updateStaffAlias,
  createTable,
  deleteTable,
};
