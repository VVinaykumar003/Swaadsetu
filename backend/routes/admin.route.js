// routes/admin.route.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const adminController = require("../controllers/admin.controller");

// Import middleware
const authMiddleware = require("../common/middlewares/auth.middleware");
const requireRole = require("../common/middlewares/role.middleware");

// defensive imports
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

// --- Public routes ---

// Admin login (admin PIN) - sensitiveLimiter
// POST /api/:rid/admin/login
router.post("/login", limiter("sensitiveLimiter"), adminController.login);

// Staff login (shared staff PIN) - staffLimiter
// POST /api/:rid/auth/staff-login
router.post(
  "/auth/staff-login",
  limiter("staffLimiter"),
  adminController.staffLogin
);

// GET /api/:rid/admin/menu (public)
router.get("/menu", adminController.getMenu);

// Generate override token via PIN (no JWT required; controller verifies PIN).
// Rate limit to sensitiveLimiter
router.post(
  "/overrides",
  limiter("sensitiveLimiter"),
  adminController.generateOverrideToken
);

// --- Protected admin routes (require admin JWT / role) ---

// Admin-only middleware
const adminOnly = [authMiddleware, requireRole("admin")];

// Update menu (admin)
router.post("/menu", adminOnly, adminController.updateMenu);

// Add single menu item (admin)
router.post("/menu/items", adminOnly, adminController.addMenuItem);

// Analytics and export (admin)
router.get("/analytics", adminOnly, adminController.getAnalytics);
router.post("/export", adminOnly, adminController.exportReport);

// Table management (admin)
router.patch("/tables/:id", adminOnly, adminController.updateTable);

// PIN management (admin)
router.patch(
  "/pin",
  adminOnly,
  limiter("sensitiveLimiter"),
  adminController.updatePin
);

// Staff aliases management (admin)
router.patch("/staff-aliases", adminOnly, adminController.updateStaffAliases);

// Update global config (taxPercent, discount, serviceCharge) - admin
router.patch("/config", adminOnly, adminController.updateConfig);

// Reopen finalized bill (admin override) - admin
router.post("/bills/:billId/reopen", adminOnly, adminController.reopenBill);

// Export the router
module.exports = router;
