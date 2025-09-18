// controllers/table.controller.js
// Hardened version: safe when Redis helpers are missing (publishEvent no-op).
// Preserves original behavior when publishEvent is available.

const Table = require("../models/table.model");

// Defensive logger (fallback to console)
let logger = console;
try {
  logger = require("../common/libs/logger") || console;
} catch (e) {
  console.warn("Logger not found, using console as fallback.");
}

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

      // common shapes: { publishEvent }, { publish }, or module is the function itself
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

// Get all tables for restaurant
async function getTables(req, res, next) {
  try {
    const { rid } = req.params;
    const { includeInactive } = req.query;

    const filter = { restaurantId: rid };
    if (!includeInactive) {
      filter.isActive = true;
    }

    const tables = await Table.find(filter).sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    logger && logger.error && logger.error("Tables fetch error:", error);
    next(error);
  }
}

// Get table by ID
async function getTableById(req, res, next) {
  try {
    const { rid, id } = req.params;
    const table = await Table.findOne({ _id: id, restaurantId: rid });

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    res.json(table);
  } catch (error) {
    logger && logger.error && logger.error("Table fetch error:", error);
    next(error);
  }
}

// Update table status (activate/deactivate)
async function updateTableStatus(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { isActive } = req.body;

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

    res.json(table);
  } catch (error) {
    logger && logger.error && logger.error("Table status update error:", error);
    next(error);
  }
}

// Assign session to table
async function assignSession(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { sessionId, staffAlias } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }

    const table = await Table.findOneAndUpdate(
      { _id: id, restaurantId: rid, isActive: true },
      {
        currentSessionId: sessionId,
        staffAlias,
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

    res.json(table);
  } catch (error) {
    logger && logger.error && logger.error("Session assignment error:", error);
    next(error);
  }
}

// Create new table
async function createTable(req, res, next) {
  try {
    const { rid } = req.params;
    const { tableNumber, capacity } = req.body;

    if (!tableNumber || !capacity) {
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

    res.status(201).json(table);
  } catch (error) {
    logger && logger.error && logger.error("Table creation error:", error);
    next(error);
  }
}

// Delete table
async function deleteTable(req, res, next) {
  try {
    const { rid, id } = req.params;

    const table = await Table.findOneAndDelete({ _id: id, restaurantId: rid });

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    // Publish event
    safePublish(`restaurant:${rid}:staff`, {
      event: "tableDeleted",
      data: { tableId: id },
    });

    res.status(204).send();
  } catch (error) {
    logger && logger.error && logger.error("Table deletion error:", error);
    next(error);
  }
}

// Update staff alias for table
async function updateStaffAlias(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { staffAlias } = req.body;

    if (!staffAlias) {
      return res.status(400).json({ error: "Staff alias required" });
    }

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

    res.json(table);
  } catch (error) {
    logger && logger.error && logger.error("Staff alias update error:", error);
    next(error);
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
