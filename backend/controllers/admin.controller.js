// controllers/admin.controller.js
// Hardened admin controller: safer, clearer responses, non-destructive updates,
// defensive logging/publish helpers, and more efficient analytics via aggregation.

const Admin = require("../models/admin.model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../common/libs/jwt");
const Order = require("../models/order.model");
const Bill = require("../models/bill.model");
const crypto = require("crypto");

// Defensive logger (fallback to console)
let logger = console;
try {
  logger = require("../common/libs/logger") || console;
} catch (e) {
  // fallback already assigned
  console.warn("Logger not found, using console as fallback.");
}

// Defensive load for publishEvent from Redis helpers (if available)
let publishEvent = null;
try {
  const redisModule =
    require("../db/redis") ||
    require("../db/redis.helpers") ||
    require("../db/redisHelper") ||
    null;

  if (redisModule) {
    publishEvent =
      redisModule.publishEvent ||
      redisModule.publish ||
      (typeof redisModule === "function" ? redisModule : null);
  }

  if (typeof publishEvent !== "function") {
    logger &&
      logger.warn &&
      logger.warn("publishEvent not available — realtime publish no-op.");
    publishEvent = null;
  }
} catch (e) {
  logger &&
    logger.warn &&
    logger.warn("Redis publish helper load failed:", e && e.message);
  publishEvent = null;
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

function sanitizeAdmin(adminDoc) {
  if (!adminDoc) return null;
  const obj = adminDoc.toObject ? adminDoc.toObject() : { ...adminDoc };
  // remove sensitive fields
  delete obj.hashedPin;
  return obj;
}

function getBcryptRounds() {
  const env = parseInt(process.env.BCRYPT_ROUNDS || "", 10);
  return Number.isFinite(env) && env > 0 ? env : 10;
}

// ----------------------- Controllers -----------------------

/**
 * Admin login
 * Body: { pin }
 * Returns: { token }
 */
async function login(req, res, next) {
  try {
    const { rid } = req.params;
    const { pin } = req.body || {};

    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });
    if (!pin || typeof pin !== "string")
      return res.status(400).json({ error: "PIN required" });

    const admin = await Admin.findOne({ restaurantId: rid }).lean();
    if (!admin) {
      return res.status(404).json({ error: "Admin configuration not found" });
    }

    const isMatch = await bcrypt.compare(pin, admin.hashedPin || "");
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid PIN" });
    }

    const token = generateToken(
      { restaurantId: rid, role: "admin" },
      { expiresIn: "1h" }
    );
    return res.json({ token });
  } catch (err) {
    logger && logger.error && logger.error("Admin login error:", err);
    return next(err);
  }
}

/**
 * Generate one-time override token
 * Body: { pin }
 * Returns: { token, expiresAt }
 */
async function generateOverrideToken(req, res, next) {
  try {
    const { rid } = req.params;
    const { pin } = req.body || {};

    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });
    if (!pin || typeof pin !== "string")
      return res.status(400).json({ error: "PIN required" });

    const admin = await Admin.findOne({ restaurantId: rid });
    if (!admin)
      return res.status(404).json({ error: "Admin configuration not found" });

    const isMatch = await bcrypt.compare(pin, admin.hashedPin || "");
    if (!isMatch) return res.status(401).json({ error: "Invalid PIN" });

    // generate token with expiry (e.g., 10 minutes)
    const token = crypto.randomBytes(32).toString("hex");
    const ttlMinutes =
      parseInt(process.env.OVERRIDE_TOKEN_TTL_MIN || "10", 10) || 10;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    admin.overrideTokens = admin.overrideTokens || [];
    admin.overrideTokens.push({ token, createdAt: new Date(), expiresAt });
    await admin.save();

    // safe publish (optional)
    safePublish(`restaurant:${rid}:staff`, {
      event: "overrideTokenCreated",
      data: { expiresAt },
    });

    return res.json({ token, expiresAt });
  } catch (err) {
    logger &&
      logger.error &&
      logger.error("Generate override token error:", err);
    return next(err);
  }
}

/**
 * Get menu (public). Returns an object (never 404 if admin exists).
 */
const Menu = require("../models/menu.model");

async function getMenu(req, res, next) {
  try {
    const { rid } = req.params;
    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });

    // First try to get menu from new Menu collection
    const menuDoc = await Menu.findOne({ restaurantId: rid }).lean();
    if (menuDoc) {
      return res.json({
        menu: menuDoc.items,
        categories: menuDoc.categories,
        taxes: menuDoc.taxes,
        serviceCharge: menuDoc.serviceCharge,
        branding: menuDoc.branding,
      });
    }

    // Fallback to Admin collection
    const admin = await Admin.findOne({ restaurantId: rid }).lean();
    if (!admin)
      return res.status(404).json({ error: "Admin configuration not found" });

    return res.json({
      menu: admin.menu || {},
      categories: admin.categories || [],
      taxes: admin.taxes || null,
      serviceCharge: admin.serviceCharge || 0,
      branding: admin.branding || null,
    });
  } catch (err) {
    logger && logger.error && logger.error("Get menu error:", err);
    return next(err);
  }
}

/**
 * Update menu (admin only).
 * Accepts partial updates — does not overwrite unspecified fields.
 * Body: { menu, categories, taxes, serviceCharge, branding }
 */
async function updateMenu(req, res, next) {
  try {
    const { rid } = req.params;
    const incoming = req.body || {};

    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });

    // Update Menu collection
    const menuUpdate = {};
    if (typeof incoming.menu !== "undefined") menuUpdate.items = incoming.menu;
    if (typeof incoming.categories !== "undefined")
      menuUpdate.categories = incoming.categories;
    if (typeof incoming.taxes !== "undefined")
      menuUpdate.taxes = incoming.taxes;
    if (typeof incoming.serviceCharge !== "undefined")
      menuUpdate.serviceCharge = incoming.serviceCharge;
    if (typeof incoming.branding !== "undefined")
      menuUpdate.branding = incoming.branding;

    const menuDoc = await Menu.findOneAndUpdate(
      { restaurantId: rid },
      menuUpdate,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update Admin collection for backward compatibility
    const admin = await Admin.findOne({ restaurantId: rid });
    if (!admin) {
      return res.status(404).json({ error: "Admin configuration not found" });
    }

    if (typeof incoming.menu !== "undefined") admin.menu = incoming.menu;
    if (typeof incoming.categories !== "undefined")
      admin.categories = incoming.categories;
    if (typeof incoming.taxes !== "undefined") admin.taxes = incoming.taxes;
    if (typeof incoming.serviceCharge !== "undefined")
      admin.serviceCharge = incoming.serviceCharge;
    if (typeof incoming.branding !== "undefined")
      admin.branding = incoming.branding;

    await admin.save();

    // Publish event
    safePublish(`restaurant:${rid}:staff`, {
      event: "menuUpdated",
      data: { timestamp: new Date() },
    });

    // Return the updated menu from the Menu collection
    return res.json({
      menu: menuDoc.items || {},
      categories: menuDoc.categories || [],
      taxes: menuDoc.taxes || null,
      serviceCharge: menuDoc.serviceCharge || 0,
      branding: menuDoc.branding || null,
    });
  } catch (err) {
    logger && logger.error && logger.error("Update menu error:", err);
    return next(err);
  }
}

/**
 * Get analytics using aggregation for better performance.
 * Query: ?period=daily|weekly|monthly
 */
async function getAnalytics(req, res, next) {
  try {
    const { rid } = req.params;
    const period = (req.query.period || "daily").toLowerCase();

    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });

    const now = new Date();
    let startDate;
    switch (period) {
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        break;
      case "daily":
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    // Total revenue (paid bills) and count using aggregation
    const billMatch = {
      $match: {
        restaurantId: rid,
        paymentStatus: "paid",
        createdAt: { $gte: startDate },
      },
    };

    const billAgg = await Bill.aggregate([
      billMatch,
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ["$totalAmount", 0] } },
          paidCount: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = (billAgg[0] && billAgg[0].totalRevenue) || 0;

    // Orders: count and top items + peak hours with aggregation
    const orderMatch = {
      $match: {
        restaurantId: rid,
        createdAt: { $gte: startDate },
      },
    };

    // order count
    const orderCountAgg = await Order.aggregate([
      orderMatch,
      { $count: "count" },
    ]);
    const orderCount = (orderCountAgg[0] && orderCountAgg[0].count) || 0;

    // Top items (unwind items, group by name)
    const topItemsAgg = await Order.aggregate([
      orderMatch,
      { $unwind: { path: "$items", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: "$items.name",
          quantity: { $sum: { $ifNull: ["$items.quantity", 0] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
      { $project: { name: "$_id", quantity: 1, _id: 0 } },
    ]);

    const topItems = topItemsAgg || [];

    // Peak hours (group by hour)
    const peakHoursAgg = await Order.aggregate([
      orderMatch,
      {
        $project: {
          hour: { $hour: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$hour",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 3 },
      { $project: { hour: "$_id", count: 1, _id: 0 } },
    ]);

    const peakHours = peakHoursAgg || [];

    // unpaid/voided bills counts
    const [unpaidBills, voidedBills] = await Promise.all([
      Bill.countDocuments({
        restaurantId: rid,
        paymentStatus: "unpaid",
        createdAt: { $gte: startDate },
      }),
      Bill.countDocuments({
        restaurantId: rid,
        status: "cancelled",
        createdAt: { $gte: startDate },
      }),
    ]);

    return res.json({
      period,
      totalRevenue,
      orderCount,
      topItems,
      peakHours,
      unpaidBills,
      voidedBills,
    });
  } catch (err) {
    logger && logger.error && logger.error("Get analytics error:", err);
    return next(err);
  }
}

/**
 * Export report (create job placeholder)
 * Body: { format: 'csv'|'pdf', period }
 */
async function exportReport(req, res, next) {
  try {
    const { rid } = req.params;
    const { format, period } = req.body || {};

    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });
    if (!["csv", "pdf"].includes(format))
      return res.status(400).json({ error: "Invalid format" });

    const reportId = crypto.randomBytes(16).toString("hex");
    const job = {
      reportId,
      format,
      period: period || "custom",
      status: "processing",
      createdAt: new Date(),
    };

    // publish that a report job was created
    safePublish(`restaurant:${rid}:staff`, {
      event: "reportRequested",
      data: { reportId, format, period },
    });

    // In real app: push to queue, return job id
    return res.json({
      ...job,
      downloadUrl: `/api/${rid}/admin/reports/${reportId}`,
    });
  } catch (err) {
    logger && logger.error && logger.error("Export report error:", err);
    return next(err);
  }
}

/**
 * Update table configuration — implemented to actually update Table model if exists.
 * Body: { capacity, isActive }
 */
async function updateTable(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { capacity, isActive } = req.body || {};

    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });
    if (!id) return res.status(400).json({ error: "Missing table id" });

    // Lazy load Table model to avoid circular requires in some structures
    let Table;
    try {
      Table = require("../models/table.model");
    } catch (e) {
      Table = null;
    }

    if (!Table) {
      // fallback simulated response (old behavior)
      return res.json({
        tableId: id,
        capacity,
        isActive,
        updatedAt: new Date(),
      });
    }

    const update = {};
    if (typeof capacity !== "undefined") update.capacity = capacity;
    if (typeof isActive !== "undefined") update.isActive = isActive;
    if (isActive === false) {
      update.currentSessionId = null;
      update.staffAlias = null;
    }
    update.updatedAt = Date.now();

    const table = await Table.findOneAndUpdate(
      { _id: id, restaurantId: rid },
      update,
      { new: true }
    );
    if (!table)
      return res.status(404).json({ error: "Table not found or inactive" });

    // notify staff
    safePublish(`restaurant:${rid}:staff`, {
      event: "tableStatusUpdated",
      data: { tableId: id, isActive },
    });

    return res.json(table);
  } catch (err) {
    logger && logger.error && logger.error("Update table error:", err);
    return next(err);
  }
}

/**
 * Update admin PIN (authenticated)
 * Body: { currentPin, newPin }
 */
async function updatePin(req, res, next) {
  try {
    const { rid } = req.params;
    const { currentPin, newPin } = req.body || {};

    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });
    if (!currentPin || !newPin)
      return res.status(400).json({ error: "Current and new PIN required" });
    if (typeof newPin !== "string" || newPin.length < 4)
      return res
        .status(400)
        .json({ error: "New PIN must be at least 4 characters" });

    const admin = await Admin.findOne({ restaurantId: rid });
    if (!admin)
      return res.status(404).json({ error: "Admin configuration not found" });

    const isMatch = await bcrypt.compare(currentPin, admin.hashedPin || "");
    if (!isMatch) return res.status(401).json({ error: "Invalid current PIN" });

    const saltRounds = getBcryptRounds();
    const newHash = await bcrypt.hash(newPin, saltRounds);
    admin.hashedPin = newHash;

    // revoke override tokens on PIN change (security)
    admin.overrideTokens = [];
    await admin.save();

    safePublish(`restaurant:${rid}:staff`, {
      event: "adminPinUpdated",
      data: { updatedAt: new Date() },
    });

    return res.json({ message: "PIN updated successfully" });
  } catch (err) {
    logger && logger.error && logger.error("Update PIN error:", err);
    return next(err);
  }
}

/**
 * Update staff aliases (create admin if missing)
 * Body: { staffAliases: [string] }
 */
async function updateStaffAliases(req, res, next) {
  try {
    const { rid } = req.params;
    const { staffAliases } = req.body || {};

    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });
    if (!Array.isArray(staffAliases) || staffAliases.length === 0) {
      return res.status(400).json({ error: "Valid staff aliases required" });
    }

    let admin = await Admin.findOne({ restaurantId: rid });
    if (!admin) {
      admin = new Admin({ restaurantId: rid, staffAliases, hashedPin: "" });
    } else {
      admin.staffAliases = staffAliases;
    }

    await admin.save();

    safePublish(`restaurant:${rid}:staff`, {
      event: "staffAliasesUpdated",
      data: { staffAliases },
    });

    return res.json(sanitizeAdmin(admin));
  } catch (err) {
    logger && logger.error && logger.error("Update staff aliases error:", err);
    return next(err);
  }
}

module.exports = {
  login,
  generateOverrideToken,
  getMenu,
  updateMenu,
  getAnalytics,
  exportReport,
  updateTable,
  updatePin,
  updateStaffAliases,
};
