// controllers/bill.controller.js
// Upgraded: server-side totals using Admin config, idempotency + Redis lock support,
// single-active-bill enforcement, draft->finalize->paid lifecycle, require staffAlias for finalize & mark-paid.

const Bill = require("../models/bill.model");
const Order = require("../models/order.model");
const Admin = (() => {
  try {
    return require("../models/admin.model");
  } catch (e) {
    return null;
  }
})();

// Defensive logger
let logger = console;
try {
  logger = require("../common/libs/logger") || console;
} catch (e) {
  console.warn("Logger not found, using console as fallback.");
}

// Redis helpers
let redisHelpers = null;
let checkIdempotency = null;
let acquireLock = null;
let releaseLock = null;
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
      redisHelpers = mod;
      checkIdempotency = mod.checkIdempotency || mod.check_idempotency || null;
      acquireLock = mod.acquireLock || mod.setLock || mod.lock || null;
      releaseLock = mod.releaseLock || mod.unlock || null;
      publishEvent = mod.publishEvent || mod.publish || null;
      if (checkIdempotency || acquireLock || publishEvent) break;
    } catch (err) {
      // ignore
    }
  }

  if (!checkIdempotency)
    logger &&
      logger.warn &&
      logger.warn("checkIdempotency not found; idempotency checks skipped.");
  if (!acquireLock)
    logger &&
      logger.warn &&
      logger.warn("acquireLock not found; distributed locking skipped.");
  if (!publishEvent)
    logger &&
      logger.warn &&
      logger.warn("publishEvent not found; notifications skipped.");
})();

async function safeCheckIdempotency(key) {
  if (typeof checkIdempotency !== "function") return null;
  try {
    return await checkIdempotency(key);
  } catch (err) {
    logger && logger.error && logger.error("checkIdempotency error:", err);
    return null;
  }
}

async function safeAcquireLock(lockKey, ttl = 5000) {
  if (!acquireLock) return false;
  try {
    // expected API: acquireLock(key, ttl) -> boolean
    if (typeof acquireLock === "function") {
      return await acquireLock(lockKey, ttl);
    }
    return false;
  } catch (err) {
    logger && logger.error && logger.error("acquireLock error:", err);
    return false;
  }
}

async function safeReleaseLock(lockKey) {
  if (!releaseLock) return false;
  try {
    if (typeof releaseLock === "function") {
      return await releaseLock(lockKey);
    }
    return false;
  } catch (err) {
    logger && logger.error && logger.error("releaseLock error:", err);
    return false;
  }
}

function safePublish(channel, message) {
  if (typeof publishEvent !== "function") return;
  try {
    const out = publishEvent(channel, message);
    if (out && typeof out.then === "function") {
      out.catch((err) => {
        logger &&
          logger.error &&
          logger.error("publishEvent promise rejected:", err);
      });
    }
  } catch (err) {
    logger && logger.error && logger.error("publishEvent error:", err);
  }
}

const { getPricingConfig } = require("../common/libs/pricingHelper");

// Helper to compute totals from items and pricing config
async function computeTotalsFromConfig(rid, items = [], extras = []) {
  // items: [{name, quantity, priceAtOrder}]
  const subtotal =
    (items || []).reduce(
      (s, it) => s + Number(it.priceAtOrder || 0) * Number(it.quantity || 1),
      0
    ) + (extras || []).reduce((s, x) => s + Number(x.amount || 0), 0);

  // Get pricing config
  const config = await getPricingConfig(rid);

  // Apply global discount
  const discountAmount = (subtotal * config.globalDiscountPercent) / 100;
  const amountAfterDiscount = subtotal - discountAmount;

  // Calculate taxes
  const taxBreakdown = [];
  let totalTax = 0;
  for (const tax of config.taxes) {
    const taxAmount = (amountAfterDiscount * tax.percent) / 100;
    taxBreakdown.push({
      name: tax.name || "Tax",
      rate: tax.percent,
      amount: taxAmount,
    });
    totalTax += taxAmount;
  }

  // Calculate service charge
  const serviceChargeAmount =
    (amountAfterDiscount * config.serviceCharge) / 100;

  // Calculate total
  const total = amountAfterDiscount + totalTax + serviceChargeAmount;

  // Calculate effective tax rate for compatibility with existing model
  const effectiveTaxRate = config.taxes.reduce(
    (sum, tax) => sum + tax.percent,
    0
  );

  return {
    subtotal,
    taxBreakdown,
    taxAmount: totalTax,
    discountPercent: config.globalDiscountPercent,
    discountAmount,
    serviceChargeAmount,
    total,
  };
}

// Create draft bill - enforces single active bill per session/table and server-side totals
async function createBill(req, res, next) {
  let lockKey = null;
  try {
    const { rid } = req.params;
    const { tableId, sessionId, items, extras = [], staffAlias } = req.body;

    if (
      !rid ||
      !tableId ||
      !sessionId ||
      !Array.isArray(items) ||
      !items.length
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields: tableId, sessionId, items" });
    }

    // idempotency header support
    const hdr =
      req.headers["x-idempotency-key"] || req.headers["x-idempotency"];
    const idempotencyKey = hdr
      ? `idempotency:bill:${rid}:${sessionId}:${hdr}`
      : null;
    if (idempotencyKey) {
      const existing = await safeCheckIdempotency(idempotencyKey);
      if (existing)
        return res
          .status(409)
          .json({ error: "Duplicate request", bill: existing });
    }

    // Acquire a lock for this session to prevent concurrent bill creation
    lockKey = `bill:lock:${rid}:${sessionId}`;
    const acquired = await safeAcquireLock(lockKey, 5000);
    if (!acquired) {
      // fallback: check if an active bill exists
      const active = await Bill.findOne({
        restaurantId: rid,
        sessionId,
        status: { $in: ["draft", "finalized"] },
      }).lean();
      if (active)
        return res
          .status(409)
          .json({ error: "Active bill exists", bill: active });
      // else allow creation (best effort)
    } else {
      // after acquiring lock also check active bill
      const active = await Bill.findOne({
        restaurantId: rid,
        sessionId,
        status: { $in: ["draft", "finalized"] },
      }).lean();
      if (active) {
        await safeReleaseLock(lockKey);
        return res
          .status(409)
          .json({ error: "Active bill exists", bill: active });
      }
    }

    // compute totals server-side using Admin config
    // items should include priceAtOrder (orders aggregated) or raw items: try to use priceAtOrder if present
    // We expect items[] to be array of { name, quantity, priceAtOrder }
    const totals = await computeTotalsFromConfig(rid, items, extras);

    // create bill as draft with initial audit entry
    const bill = new Bill({
      restaurantId: rid,
      tableId,
      sessionId,
      items,
      extras,
      subtotal: totals.subtotal,
      taxes: totals.taxBreakdown,
      taxAmount: totals.taxAmount,
      discountPercent: totals.discountPercent,
      discountAmount: totals.discountAmount,
      serviceCharge: totals.serviceChargeAmount,
      totalAmount: totals.total,
      status: "draft",
      staffAlias: staffAlias || null,
      audit: [
        {
          by: staffAlias || "system",
          action: "created",
          at: new Date(),
        },
      ],
    });

    await bill.save();

    // publish
    safePublish(`restaurant:${rid}:tables:${tableId}`, {
      event: "billCreated",
      data: bill,
    });

    // optionally store idempotency mapping via redis helper (if available) - left to redis helper impl
    // release lock if held
    if (lockKey) await safeReleaseLock(lockKey);

    return res.status(201).json(bill);
  } catch (err) {
    logger && logger.error && logger.error("Bill creation error:", err);
    try {
      if (lockKey) await safeReleaseLock(lockKey);
    } catch (e) {
      /*ignore*/
    }
    return next(err);
  }
}

// Edit draft bill - only allowed when status === 'draft'
async function updateBillDraft(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { items, extras, staffAlias } = req.body;

    if (!rid || !id) return res.status(400).json({ error: "Missing params" });

    const bill = await Bill.findOne({ _id: id, restaurantId: rid });
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    if (bill.status !== "draft")
      return res.status(403).json({ error: "Bill not editable unless draft" });

    if (typeof items !== "undefined") bill.items = items;
    if (typeof extras !== "undefined") bill.extras = extras;
    if (typeof staffAlias !== "undefined") bill.staffAlias = staffAlias;

    // recompute totals server-side
    const totals = await computeTotalsFromConfig(rid, bill.items, bill.extras);
    bill.subtotal = totals.subtotal;
    bill.taxPercent = totals.taxPercent;
    bill.taxAmount = totals.taxAmount;
    bill.discountPercent = totals.discountPercent;
    bill.discountAmount = totals.discountAmount;
    bill.serviceCharge = totals.serviceChargeAmount;
    bill.totalAmount = totals.total;

    // Add audit entry for the update
    const delta = {};
    if (typeof items !== "undefined") delta.items = items;
    if (typeof extras !== "undefined") delta.extras = extras;
    if (typeof staffAlias !== "undefined") delta.staffAlias = staffAlias;

    bill.audit.push({
      by: staffAlias || bill.staffAlias || "system",
      action: "updated",
      delta: delta,
      at: new Date(),
    });

    await bill.save();

    safePublish(`restaurant:${rid}:tables:${bill.tableId}`, {
      event: "billUpdated",
      data: bill,
    });

    return res.json(bill);
  } catch (err) {
    logger && logger.error && logger.error("Update bill draft error:", err);
    return next(err);
  }
}

// Finalize bill (staff) - record finalizedByAlias, set status to 'finalized' and prevent further edits
async function finalizeBill(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { staffAlias } = req.body;
    if (!rid || !id) return res.status(400).json({ error: "Missing params" });
    if (!staffAlias)
      return res.status(400).json({ error: "staffAlias required to finalize" });

    const bill = await Bill.findOne({ _id: id, restaurantId: rid });
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    if (bill.status !== "draft")
      return res
        .status(400)
        .json({ error: "Only draft bills can be finalized" });

    bill.status = "finalized";
    bill.finalizedByAlias = staffAlias;
    bill.finalizedAt = new Date();

    // ensure totals are correct (recompute)
    const totals = await computeTotalsFromConfig(rid, bill.items, bill.extras);
    bill.subtotal = totals.subtotal;
    bill.taxPercent = totals.taxPercent;
    bill.taxAmount = totals.taxAmount;
    bill.discountPercent = totals.discountPercent;
    bill.discountAmount = totals.discountAmount;
    bill.serviceCharge = totals.serviceChargeAmount;
    bill.totalAmount = totals.total;

    // Add audit entry for finalization
    bill.audit.push({
      by: staffAlias,
      action: "finalized",
      at: new Date(),
    });

    await bill.save();

    safePublish(`restaurant:${rid}:tables:${bill.tableId}`, {
      event: "billFinalized",
      data: bill,
    });

    return res.json(bill);
  } catch (err) {
    logger && logger.error && logger.error("Finalize bill error:", err);
    return next(err);
  }
}

// Mark bill paid (staff) - requires staffAlias and sets paymentStatus/paidAt
async function markBillPaid(req, res, next) {
  try {
    const { rid, id } = req.params;
    const { staffAlias, paymentNote, overrideToken } = req.body;
    if (!rid || !id) return res.status(400).json({ error: "Missing params" });
    if (!staffAlias)
      return res
        .status(400)
        .json({ error: "staffAlias required to mark paid" });

    const bill = await Bill.findOne({ _id: id, restaurantId: rid });
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    // Reject unless finalized or admin override
    if (
      bill.status !== "finalized" &&
      !(overrideToken && overrideToken === bill.overrideToken)
    ) {
      return res.status(400).json({
        error: "Only finalized bill can be marked paid without admin override",
      });
    }

    bill.paymentStatus = "paid";
    bill.paymentMarkedBy = staffAlias;
    bill.paymentNote = paymentNote || null;
    bill.paidAt = new Date();

    // optionally set overall status
    bill.status = "paid";

    // Add audit entry for payment marking
    bill.audit.push({
      by: staffAlias,
      action: "payment_marked",
      at: new Date(),
    });

    await bill.save();

    safePublish(`restaurant:${rid}:tables:${bill.tableId}`, {
      event: "billPaid",
      data: bill,
    });

    return res.json(bill);
  } catch (err) {
    logger && logger.error && logger.error("Mark bill paid error:", err);
    return next(err);
  }
}

// Get active bills (unpaid/draft/finalized)
async function getActiveBills(req, res, next) {
  try {
    const { rid } = req.params;
    const bills = await Bill.find({
      restaurantId: rid,
      status: { $in: ["draft", "finalized"] },
    }).sort({ createdAt: -1 });

    return res.json(bills);
  } catch (err) {
    logger && logger.error && logger.error("Active bills fetch error:", err);
    return next(err);
  }
}

// Get bill history (session or date range)
async function getBillsHistory(req, res, next) {
  try {
    const { rid } = req.params;
    const { sessionId, startDate, endDate } = req.query;

    const filter = { restaurantId: rid };

    if (sessionId) filter.sessionId = sessionId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const bills = await Bill.find(filter).sort({ createdAt: -1 });
    return res.json(bills);
  } catch (err) {
    logger && logger.error && logger.error("Bill history fetch error:", err);
    return next(err);
  }
}

module.exports = {
  createBill,
  updateBillDraft,
  finalizeBill,
  markBillPaid,
  getActiveBills,
  getBillsHistory,
};
