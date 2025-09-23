// controllers/admin.controller.js
// Hardened admin controller with Menu extraction support and staff/login/config fixes.

const Admin = require("../models/admin.model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../common/libs/jwt");
const Order = require("../models/order.model");
const Bill = require("../models/bill.model");
const crypto = require("crypto");
const mongoose = require("mongoose");

// Defensive logger (fallback to console)
let logger = console;
try {
  logger = require("../common/libs/logger") || console;
} catch (e) {
  console.warn("Logger not found, using console as fallback.");
}

// Defensive publishEvent loader
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
    publishEvent = null;
    logger &&
      logger.warn &&
      logger.warn("publishEvent not available — realtime publish no-op.");
  }
} catch (e) {
  publishEvent = null;
  logger &&
    logger.warn &&
    logger.warn("Redis publish helper load failed:", e && e.message);
}

function safePublish(channel, message) {
  if (typeof publishEvent !== "function") return;
  try {
    const res = publishEvent(channel, message);
    if (res && typeof res.then === "function")
      res.catch((err) => {
        logger &&
          logger.error &&
          logger.error("publishEvent promise rejected:", err);
      });
  } catch (err) {
    logger && logger.error && logger.error("publishEvent error:", err);
  }
}

function sanitizeAdmin(adminDoc) {
  if (!adminDoc) return null;
  const obj = adminDoc.toObject ? adminDoc.toObject() : { ...adminDoc };
  // remove all sensitive fields
  delete obj.hashedPin;
  delete obj.staffHashedPin;
  delete obj.overrideTokens;
  return obj;
}

function getBcryptRounds() {
  const env = parseInt(process.env.BCRYPT_ROUNDS || "", 10);
  return Number.isFinite(env) && env > 0 ? env : 10;
}

// Defensive Menu model require (may not exist during migration)
let Menu = null;
try {
  Menu = require("../models/menu.model");
} catch (e) {
  Menu = null;
  logger &&
    logger.info &&
    logger.info("Menu model not found — menus unavailable until migrated.");
}

// ----------------------- Controllers -----------------------

/**
 * Admin login (admin PIN)
 * POST /api/:rid/admin/login
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
    if (!admin)
      return res.status(404).json({ error: "Admin configuration not found" });

    const isMatch = await bcrypt.compare(pin, admin.hashedPin || "");
    if (!isMatch) return res.status(401).json({ error: "Invalid PIN" });

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
 * Staff login (shared staff PIN or fallback to admin PIN)
 * POST /api/:rid/auth/staff-login
 */
async function staffLogin(req, res, next) {
  try {
    const { rid } = req.params;
    const { pin } = req.body || {};

    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });
    if (!pin || typeof pin !== "string")
      return res.status(400).json({ error: "PIN required" });

    const admin = await Admin.findOne({ restaurantId: rid }).lean();
    if (!admin)
      return res.status(404).json({ error: "Admin configuration not found" });

    const staffHash = admin.staffHashedPin || "";
    const adminHash = admin.hashedPin || "";

    // Prefer staff pin match; allow admin pin as fallback for convenience
    let matched = false;
    if (staffHash) matched = await bcrypt.compare(pin, staffHash);
    if (!matched && adminHash) matched = await bcrypt.compare(pin, adminHash);

    if (!matched) return res.status(401).json({ error: "Invalid PIN" });

    // Issue a short-lived staff token (no profiling in token)
    const token = generateToken(
      { restaurantId: rid, role: "staff" },
      { expiresIn: "8h" }
    );
    return res.json({ token });
  } catch (err) {
    logger && logger.error && logger.error("Staff login error:", err);
    return next(err);
  }
}

/**
 * Generate short-lived override token (admin PIN required)
 * POST /api/:rid/admin/overrides
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

    const token = crypto.randomBytes(32).toString("hex");
    const ttlMinutes =
      parseInt(process.env.OVERRIDE_TOKEN_TTL_MIN || "10", 10) || 10;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    // Normalize overrideTokens array: keep only non-expired objects
    admin.overrideTokens = (admin.overrideTokens || []).filter((t) => {
      try {
        if (!t) return false;
        // If legacy stored as string skip it (we won't accept legacy format)
        if (typeof t === "string") return false;
        if (!t.expiresAt) return false;
        return new Date(t.expiresAt) > new Date();
      } catch (e) {
        return false;
      }
    });

    admin.overrideTokens = admin.overrideTokens || [];
    admin.overrideTokens.push({ token, createdAt: new Date(), expiresAt });
    await admin.save();

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
 * Get Menu (public)
 * GET /api/:rid/admin/menu
 *
 * NOTE: Menu is sourced from the Menu collection (single source of truth).
 * If Menu collection/document isn't present, return 404 with guidance.
 */
async function getMenu(req, res, next) {
  try {
    const { rid } = req.params;
    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });

    // Try Menu collection (preferred)
    if (Menu) {
      const menuDoc = await Menu.findOne({
        restaurantId: rid,
        isActive: true,
      }).lean();
      if (menuDoc) {
        return res.json({
          menu: menuDoc.items || [],
          categories: menuDoc.categories || [],
          taxes: menuDoc.taxes || [],
          serviceCharge: menuDoc.serviceCharge || 0,
          branding: menuDoc.branding || {},
        });
      }
    }

    // No menu found
    return res.status(404).json({
      error:
        "Menu not configured for this restaurant. Please create an admin menu via POST /api/:rid/admin/menu",
    });
  } catch (err) {
    logger && logger.error && logger.error("Get menu error:", err);
    return next(err);
  }
}

/**
 * Update Menu (admin protected)
 * POST /api/:rid/admin/menu
 *
 * Writes to Menu collection only. Admin document is ensured to exist (no menu copy).
 */
async function updateMenu(req, res, next) {
  try {
    const { rid } = req.params;
    const incoming = req.body || {};

    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });

    // Prepare update fields (only set provided)
    const updateFields = {};
    if (typeof incoming.menu !== "undefined")
      updateFields.items = incoming.menu;
    if (typeof incoming.categories !== "undefined")
      updateFields.categories = incoming.categories;
    if (typeof incoming.taxes !== "undefined")
      updateFields.taxes = incoming.taxes;
    if (typeof incoming.serviceCharge !== "undefined")
      updateFields.serviceCharge = incoming.serviceCharge;
    if (typeof incoming.branding !== "undefined")
      updateFields.branding = incoming.branding;

    let menuResult = null;
    if (Menu) {
      // try to find active menu for this restaurant
      let menuDoc = await Menu.findOne({ restaurantId: rid, isActive: true });
      if (menuDoc) {
        // apply only provided fields
        Object.assign(menuDoc, updateFields);
        menuDoc.updatedAt = Date.now();
        menuResult = await menuDoc.save();
      } else {
        // create new active menu; pick version = highest+1 or 1
        const last = await Menu.findOne({ restaurantId: rid })
          .sort({ version: -1 })
          .lean();
        const version = last && last.version ? last.version + 1 : 1;
        const newDoc = {
          restaurantId: rid,
          version,
          isActive: true,
          title: incoming.title || `${rid} menu`,
          items: updateFields.items || [],
          categories: updateFields.categories || [],
          taxes: updateFields.taxes || [],
          serviceCharge:
            typeof updateFields.serviceCharge !== "undefined"
              ? updateFields.serviceCharge
              : 0,
          branding: updateFields.branding || {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        menuResult = await Menu.create(newDoc);
      }
    } else {
      // Menu model not available - cannot update menu collection
      return res
        .status(501)
        .json({ error: "Menu collection not available on server." });
    }

    // Ensure Admin exists minimally (do not copy menu into Admin)
    await Admin.updateOne(
      { restaurantId: rid },
      {
        $setOnInsert: { restaurantId: rid, hashedPin: "" },
        $set: { updatedAt: Date.now() },
      },
      { upsert: true }
    );

    safePublish(`restaurant:${rid}:staff`, {
      event: "menuUpdated",
      data: { timestamp: new Date() },
    });

    return res.json({
      menu: menuResult.items || [],
      categories: menuResult.categories || [],
      taxes: menuResult.taxes || [],
      serviceCharge: menuResult.serviceCharge || 0,
      branding: menuResult.branding || {},
    });
  } catch (err) {
    logger && logger.error && logger.error("Update menu error:", err);
    return next(err);
  }
}

/**
 * Add a single menu item (admin)
 * POST /api/:rid/admin/menu/items
 */
async function addMenuItem(req, res, next) {
  try {
    const { rid } = req.params;
    const { item } = req.body || {};
    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });
    if (!item || typeof item !== "object")
      return res.status(400).json({ error: "Valid menu item required" });

    // minimal validation
    if (!item.name || typeof item.name !== "string")
      return res.status(400).json({ error: "Item name required" });
    if (typeof item.price !== "number")
      return res.status(400).json({ error: "Item price required (number)" });
    const categoryName =
      item.category && typeof item.category === "string"
        ? item.category
        : "Uncategorized";

    // generate itemId
    const itemId = `i_${mongoose.Types.ObjectId().toString()}`;
    const newItem = {
      itemId,
      name: item.name,
      description: item.description || "",
      price: item.price,
      currency: item.currency || "INR",
      image: item.image || null,
      isActive: typeof item.isActive === "boolean" ? item.isActive : true,
      isVegetarian: !!item.isVegetarian,
      preparationTime:
        typeof item.preparationTime === "number" ? item.preparationTime : null,
      metadata: item.metadata || {},
    };

    // If Menu model exists, perform updates (atomic-ish)
    if (Menu) {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        // ensure active menu exists (upsert)
        const menuDoc = await Menu.findOneAndUpdate(
          { restaurantId: rid, isActive: true },
          {
            $setOnInsert: {
              restaurantId: rid,
              version: 1,
              title: `${rid} menu`,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            $push: { items: newItem },
          },
          { new: true, upsert: true, session }
        );

        // Ensure category exists; if not, push new category with this itemId
        await Menu.updateOne(
          { _id: menuDoc._id, "categories.name": { $ne: categoryName } },
          { $push: { categories: { name: categoryName, itemIds: [itemId] } } },
          { session }
        );

        // If category exists but does not reference this item, add it
        await Menu.updateOne(
          {
            _id: menuDoc._id,
            "categories.name": categoryName,
            "categories.itemIds": { $ne: itemId },
          },
          { $push: { "categories.$.itemIds": itemId } },
          { session }
        );

        await session.commitTransaction();
        session.endSession();
      } catch (txErr) {
        await session.abortTransaction();
        session.endSession();
        throw txErr;
      }
    } else {
      // Cannot add menu item without Menu collection
      return res
        .status(501)
        .json({ error: "Menu collection not available on server." });
    }

    // Ensure Admin exists minimally (do not store menu)
    await Admin.updateOne(
      { restaurantId: rid },
      {
        $setOnInsert: { restaurantId: rid, hashedPin: "" },
        $set: { updatedAt: Date.now() },
      },
      { upsert: true }
    );

    safePublish(`restaurant:${rid}:staff`, {
      event: "menuItemAdded",
      data: {
        itemId,
        name: newItem.name,
        category: categoryName,
        createdAt: new Date(),
      },
    });

    return res.status(201).json({
      item: {
        itemId: newItem.itemId,
        name: newItem.name,
        price: newItem.price,
        description: newItem.description,
        category: categoryName,
        image: newItem.image,
        isVegetarian: newItem.isVegetarian,
        preparationTime: newItem.preparationTime,
      },
    });
  } catch (err) {
    logger && logger.error && logger.error("Add menu item error:", err);
    return next(err);
  }
}

/**
 * Update global config (taxPercent, globalDiscountPercent, serviceCharge)
 * PATCH /api/:rid/admin/config
 *
 * Stores values under admin.settings to keep a single config location.
 */
async function updateConfig(req, res, next) {
  try {
    const { rid } = req.params;
    const { taxPercent, globalDiscountPercent, serviceCharge } = req.body || {};

    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });

    const settings = {};
    if (typeof taxPercent !== "undefined") {
      settings.taxPercent = Number(taxPercent);
    }
    if (typeof globalDiscountPercent !== "undefined") {
      settings.globalDiscountPercent = Number(globalDiscountPercent);
    }
    if (typeof serviceCharge !== "undefined") {
      settings.serviceCharge = Number(serviceCharge);
    }

    if (Object.keys(settings).length === 0) {
      return res.status(400).json({ error: "No config fields provided" });
    }

    // Persist settings under admin.settings using updateOne (safe even if schema doesn't define it)
    const upd = {
      $setOnInsert: { restaurantId: rid, hashedPin: "" },
      $set: { updatedAt: Date.now(), settings },
    };
    await Admin.updateOne({ restaurantId: rid }, upd, { upsert: true });

    safePublish(`restaurant:${rid}:staff`, {
      event: "configUpdated",
      data: { settings },
    });

    const admin = await Admin.findOne({ restaurantId: rid }).lean();
    return res.json(sanitizeAdmin(admin));
  } catch (err) {
    logger && logger.error && logger.error("Update config error:", err);
    return next(err);
  }
}

/**
 * Analytics (keeps your previous logic)
 * GET /api/:rid/admin/analytics?period=daily|weekly|monthly
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

    const orderMatch = {
      $match: { restaurantId: rid, createdAt: { $gte: startDate } },
    };
    const orderCountAgg = await Order.aggregate([
      orderMatch,
      { $count: "count" },
    ]);
    const orderCount = (orderCountAgg[0] && orderCountAgg[0].count) || 0;

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

    const peakHoursAgg = await Order.aggregate([
      orderMatch,
      { $project: { hour: { $hour: "$createdAt" } } },
      { $group: { _id: "$hour", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
      { $project: { hour: "$_id", count: 1, _id: 0 } },
    ]);
    const peakHours = peakHoursAgg || [];

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
 * Export report (keeps existing behavior)
 * POST /api/:rid/admin/export
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

    safePublish(`restaurant:${rid}:staff`, {
      event: "reportRequested",
      data: { reportId, format, period },
    });

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
 * Update table (admin)
 * PATCH /api/:rid/admin/tables/:id
 */
async function updateTable(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { capacity, isActive } = req.body || {};

    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });
    if (!id) return res.status(400).json({ error: "Missing table id" });

    let Table;
    try {
      Table = require("../models/table.model");
    } catch (e) {
      Table = null;
    }

    if (!Table) {
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
 * Update admin PIN (admin only)
 * PATCH /api/:rid/admin/pin
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
 * Update staff aliases (admin)
 * PATCH /api/:rid/admin/staff-aliases
 */
async function updateStaffAliases(req, res, next) {
  try {
    const { rid } = req.params;
    const { staffAliases } = req.body || {};

    if (!rid)
      return res.status(400).json({ error: "Missing restaurant id (rid)" });
    if (!Array.isArray(staffAliases) || staffAliases.length === 0)
      return res.status(400).json({ error: "Valid staff aliases required" });

    let admin = await Admin.findOne({ restaurantId: rid });
    if (!admin)
      admin = new Admin({ restaurantId: rid, staffAliases, hashedPin: "" });
    else admin.staffAliases = staffAliases;

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

/**
 * Reopen a finalized bill (admin override)
 * POST /api/:rid/admin/bills/:billId/reopen
 */
async function reopenBill(req, res, next) {
  try {
    const { rid, billId } = req.params;
    const { reason } = req.body || {};

    if (!rid || !billId)
      return res.status(400).json({ error: "Missing params" });

    const bill = await Bill.findOne({ _id: billId, restaurantId: rid });
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    if (bill.status !== "finalized")
      return res.status(400).json({ error: "Bill is not finalized" });

    // record audit metadata
    bill.status = "draft";
    bill.adminReopened = {
      by: req.user ? req.user.restaurantId || "admin" : "admin",
      reason: reason || "admin reopen",
      at: new Date(),
    };
    await bill.save();

    safePublish(`restaurant:${rid}:staff`, {
      event: "billReopened",
      data: { billId },
    });
    return res.json({ success: true, data: bill });
  } catch (err) {
    logger && logger.error && logger.error("Reopen bill error:", err);
    return next(err);
  }
}

module.exports = {
  login,
  staffLogin,
  generateOverrideToken,
  getMenu,
  updateMenu,
  getAnalytics,
  exportReport,
  updateTable,
  updatePin,
  updateStaffAliases,
  addMenuItem,
  updateConfig,
  reopenBill,
};
