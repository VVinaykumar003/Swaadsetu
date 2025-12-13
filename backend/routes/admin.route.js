// routes/admin.route.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const adminController = require("../controllers/admin.controller");

// Import middleware
const authMiddleware = require("../common/middlewares/auth.middleware");
const requireRole = require("../common/middlewares/role.middleware");

// Defensive optional imports
let rateLimit = null;
let validate = null;

try {
  rateLimit = require("../common/middlewares/rateLimit.middleware");
} catch (e) {
  console.warn(
    "rateLimit.middleware not available — rate limiting disabled for admin routes."
  );
  rateLimit = {};
}

try {
  validate = require("../common/middlewares/validate.middleware");
} catch (e) {
  console.warn(
    "validate.middleware not available — input validation disabled for admin routes."
  );
  validate = {};
}

// rate-limit helper: map to your exported limiters or no-op
function limiter(mwName) {
  if (!rateLimit || !rateLimit[mwName]) {
    return (req, res, next) => next();
  }
  return rateLimit[mwName];
}

/**
 * Router-level request logger for admin routes
 * - logs method, path, rid and x-request-id (if provided)
 * - does not print sensitive info
 */
router.use((req, res, next) => {
  try {
    const now = new Date().toISOString();
    const reqId = req.header("x-request-id") || req.requestId || null;
    const method = req.method;
    const path = req.originalUrl || req.url;
    const rid = req.params?.rid || null;
    console.info(`[${now}] [admin.route] Enter`, { reqId, method, path, rid });
  } catch (e) {
    console.warn("[admin.route] route logger failed", e && e.message);
  }
  return next();
});

// ----------------------------------------------------------------------
// 🟢 PUBLIC ROUTES
// ----------------------------------------------------------------------

// Admin login (PIN-based)
router.post("/login", limiter("sensitiveLimiter"), adminController.login);

// Staff login (shared PIN)
router.post(
  "/auth/staff-login",
  limiter("staffLimiter"),
  adminController.staffLogin
);

// Public menu (customer-facing)
router.get("/menu", adminController.getMenu);

// Generate override token (PIN required)
router.post(
  "/overrides",
  limiter("sensitiveLimiter"),
  adminController.generateOverrideToken
);

// ----------------------------------------------------------------------
// 🔒 PROTECTED ADMIN ROUTES
// ----------------------------------------------------------------------

// Pricing management
router.get(
  "/pricing",
  authMiddleware,
  requireRole("admin"),
  adminController.getPricingConfigs
);

router.post(
  "/pricing",
  authMiddleware,
  requireRole("admin"),
  limiter("sensitiveLimiter"),
  adminController.createPricingConfig
);

router.patch(
  "/pricing/:version/activate",
  authMiddleware,
  requireRole("admin"),
  limiter("sensitiveLimiter"),
  adminController.activatePricingVersion
);

// ----------------------------------------------------------------------
// 🧾 MENU MANAGEMENT
// ----------------------------------------------------------------------

/**
 * Full menu management (create / update)
 * POST /api/:rid/admin/menu
 */
router.post(
  "/menu",
  authMiddleware,
  requireRole("admin"),
  adminController.updateMenu
);

/**
 * Add single menu item
 * POST /api/:rid/admin/menu/items
 */
router.post(
  "/menu/items",
  authMiddleware,
  requireRole("admin"),
  adminController.addMenuItem
);

/**
 * Update specific menu item
 * PATCH /api/:rid/admin/menu/items/:itemId
 */
router.patch(
  "/menu/items/:itemId",
  authMiddleware,
  requireRole("admin"),
  adminController.updateMenuItem
);

/**
 * Delete or disable specific menu item
 * DELETE /api/:rid/admin/menu/items/:itemId
 */
router.delete(
  "/menu/items/:itemId",
  authMiddleware,
  requireRole("admin"),
  adminController.deleteMenuItem
);

/**
 * Restore (re-enable) a soft-deleted item
 * PATCH /api/:rid/admin/menu/items/:itemId/restore
 */
router.patch(
  "/menu/items/:itemId/restore",
  authMiddleware,
  requireRole("admin"),
  adminController.restoreMenuItem
);

/**
 * Update specific category
 * PATCH /api/:rid/admin/menu/categories/:categoryId
 */
router.patch(
  "/menu/categories/:categoryId",
  authMiddleware,
  requireRole("admin"),
  adminController.updateCategory
);

/**
 * Delete specific category
 * DELETE /api/:rid/admin/menu/categories/:categoryId
 */
router.delete(
  "/menu/categories/:categoryId",
  authMiddleware,
  requireRole("admin"),
  adminController.deleteCategory
);

/**
 * ✅ Fetch all categories
 * GET /api/:rid/admin/menu/categories
 */
router.get("/menu/categories", adminController.getAllCategories);

// ----------------------------------------------------------------------
// 📊 ANALYTICS & REPORTING
// ----------------------------------------------------------------------

router.get(
  "/analytics",
  authMiddleware,
  requireRole("admin"),
  adminController.getAnalytics
);

router.post(
  "/export",
  authMiddleware,
  requireRole("admin"),
  adminController.exportReport
);

// ----------------------------------------------------------------------
// 🪑 TABLE MANAGEMENT
// ----------------------------------------------------------------------

router.patch(
  "/tables/:id",
  authMiddleware,
  requireRole("admin"),
  adminController.updateTable
);

// ----------------------------------------------------------------------
// 🔐 PIN & STAFF MANAGEMENT
// ----------------------------------------------------------------------

router.patch(
  "/pin",
  authMiddleware,
  requireRole("admin"),
  limiter("sensitiveLimiter"),
  adminController.updatePin
);

router.patch(
  "/staff-aliases",
  authMiddleware,
  requireRole("admin"),
  adminController.updateStaffAliases
);

// ----------------------------------------------------------------------
// ⚙️ GLOBAL CONFIG MANAGEMENT
// ----------------------------------------------------------------------

router.patch(
  "/config",
  authMiddleware,
  requireRole("admin"),
  adminController.updateConfig
);

// ----------------------------------------------------------------------
// 💳 BILL OVERRIDES
// ----------------------------------------------------------------------

router.post(
  "/bills/:billId/reopen",
  authMiddleware,
  requireRole("admin"),
  adminController.reopenBill
);

// ----------------------------------------------------------------------
// 👨‍🍳 WAITER MANAGEMENT
// ----------------------------------------------------------------------

router.get(
  "/waiters",
  authMiddleware,
  requireRole("admin"),
  adminController.getWaiterNames
    ? adminController.getWaiterNames
    : async (req, res, next) => {
        const Admin = require("../models/admin.model");
        try {
          const { rid } = req.params;
          if (!rid)
            return res
              .status(400)
              .json({ error: "Missing restaurant id (rid)" });
          const admin = await Admin.findOne({ restaurantId: rid }).lean();
          if (!admin)
            return res
              .status(404)
              .json({ error: "Admin configuration not found" });
          return res.json({ waiterNames: admin.waiterNames || [] });
        } catch (err) {
          return next(err);
        }
      }
);

router.post(
  "/waiters",
  authMiddleware,
  requireRole("admin"),
  limiter("sensitiveLimiter"),
  validate.addWaiterName || ((req, res, next) => next()),
  adminController.addWaiterName
);

router.patch(
  "/waiters",
  authMiddleware,
  requireRole("admin"),
  limiter("sensitiveLimiter"),
  validate.updateWaiterName || ((req, res, next) => next()),
  adminController.updateWaiterName
);

router.delete(
  "/waiters",
  authMiddleware,
  requireRole("admin"),
  limiter("sensitiveLimiter"),
  validate.deleteWaiterName || ((req, res, next) => next()),
  adminController.deleteWaiterName
);

// ----------------------------------------------------------------------
// ✅ EXPORT ROUTER
// ----------------------------------------------------------------------

module.exports = router;
