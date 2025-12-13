// routes/bill.route.js
const express = require("express");
const router = express.Router({ mergeParams: true });

// Defensive require of bill controller
let billController = {};
try {
  billController = require("../controllers/bill.controller");
  console.log("[routes/bill.route] loaded bill.controller");
} catch (e) {
  console.error(
    "[routes/bill.route] failed to require bill.controller:",
    e && e.stack ? e.stack : e
  );
  billController = {};
}

// Validate controller exports early and warn if missing
(function validateHandlers() {
  const expected = [
    "createBillFromOrder",
    "createBillManual",
    "updateBillDraft",
    "finalizeBill",
    "markBillPaid",
    "getActiveBills",
    "getBillsHistory",
    "getBillById", // ✅ ensure included
    "incrementBillItem",
    "decrementBillItem",
  ];
  for (const name of expected) {
    if (!billController[name] || typeof billController[name] !== "function") {
      console.warn(
        `[routes/bill.route] WARNING: Missing or invalid handler billController.${name} (type=${typeof billController[
          name
        ]})`
      );
    } else {
      console.log(`[routes/bill.route] handler OK: billController.${name}`);
    }
  }
})();

// Load auth middlewares defensively
let authMiddleware = (req, res, next) => next();
let requireRole = (role) => (req, res, next) => next();

try {
  authMiddleware = require("../common/middlewares/auth.middleware");
} catch (e) {
  console.warn("[routes/bill.route] auth.middleware not found - using no-op");
}
try {
  requireRole = require("../common/middlewares/role.middleware");
} catch (e) {
  console.warn("[routes/bill.route] role.middleware not found - using no-op");
}

// Optional validation / rate-limit middlewares (no-op fallback)
let validate = {};
let rateLimit = {};
try {
  validate = require("../common/middlewares/validate.middleware") || {};
} catch (e) {
  validate = {};
}
try {
  rateLimit = require("../common/middlewares/rateLimit.middleware") || {};
} catch (e) {
  rateLimit = {};
}

function limiter(name) {
  if (!rateLimit || !rateLimit[name]) return (req, res, next) => next();
  return rateLimit[name];
}

/* ========================================================
   ROUTES
======================================================== */

// ✅ Create bill from order (staff)
router.post(
  "/orders/:orderId/bill",
  limiter("standardLimiter"),
  authMiddleware,
  requireRole(["staff", "admin"]),
  billController.createBillFromOrder
);

// Manual bill creation (admin-only)
router.post(
  "/bills",
  limiter("sensitiveLimiter"),
  authMiddleware,
  requireRole("admin"),
  validate.createBillManual || ((req, res, next) => next()),
  billController.createBillManual
);

// Update draft (staff)
router.patch(
  "/bills/:id",
  limiter("standardLimiter"),
  authMiddleware,
  requireRole(["staff", "admin"]),
  validate.updateBillDraft || ((req, res, next) => next()),
  billController.updateBillDraft
);

// Finalize bill (staff)
router.post(
  "/bills/:id/finalize",
  limiter("sensitiveLimiter"),
  authMiddleware,
  requireRole(["staff", "admin"]),
  billController.finalizeBill
);

// Mark bill paid (staff)
router.post(
  "/bills/:id/mark-paid",
  limiter("sensitiveLimiter"),
  authMiddleware,
  requireRole(["staff", "admin"]),
  billController.markBillPaid
);

// Get active bills (staff)
router.get(
  "/bills/active",
  limiter("standardLimiter"),
  authMiddleware,
  requireRole(["staff", "admin"]),
  billController.getActiveBills
);

// Get bills history (staff)
router.get(
  "/bills/history",
  limiter("standardLimiter"),
  authMiddleware,
  requireRole(["staff", "admin"]),
  billController.getBillsHistory
);

// ✅ Get a single bill by ID (must come AFTER /active and /history)
router.get(
  "/bills/:id",
  limiter("standardLimiter"),
  authMiddleware,
  requireRole(["staff", "admin"]),
  billController.getBillById
);

// Increment bill item
router.post(
  "/bills/:id/items/:itemId/increment",
  limiter("standardLimiter"),
  authMiddleware,
  requireRole(["staff", "admin"]),
  billController.incrementBillItem
);

// Decrement bill item
router.post(
  "/bills/:id/items/:itemId/decrement",
  limiter("standardLimiter"),
  authMiddleware,
  requireRole(["staff", "admin"]),
  billController.decrementBillItem
);

module.exports = router;
