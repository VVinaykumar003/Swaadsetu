const express = require("express");
const router = express.Router({ mergeParams: true });
const billController = require("../controllers/bill.controller");

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
    "rateLimit.middleware not available — rate limiting disabled for bill routes."
  );
  rateLimit = {};
}

try {
  validate = require("../common/middlewares/validate.middleware");
} catch (e) {
  console.warn(
    "validate.middleware not available — input validation disabled for bill routes."
  );
  validate = {};
}

// Define role-based middleware
const staffOrAdmin = [authMiddleware, requireRole(["staff", "admin"])];

// limiter mapper
function limiter(name) {
  if (!rateLimit || !rateLimit[name]) return (req, res, next) => next();
  return rateLimit[name];
}

// --- Routes ---
// POST /api/:rid/bills  (staff) - create draft bill
// apply idempotency handler if available and staff limiter
router.post(
  "/",
  [
    ...staffOrAdmin,
    limiter("staffLimiter"),
    // use idempotency middleware if available
    ...(validate && validate.handleIdempotency
      ? [validate.handleIdempotency]
      : []),
  ],
  billController.createBill
);

// PATCH /api/:rid/bills/:id - edit draft (staff)
router.patch(
  "/:id",
  [...staffOrAdmin, limiter("staffLimiter")],
  billController.updateBillDraft
);

// PATCH /api/:rid/bills/:id/finalize - finalize bill (staff) - sensitive
router.patch(
  "/:id/finalize",
  [
    ...staffOrAdmin,
    limiter("sensitiveLimiter"),
    // ensure staffAlias present if validate middleware is available
    ...(validate && validate.validateStaff ? [validate.validateStaff] : []),
  ],
  billController.finalizeBill
);

// POST /api/:rid/bills/:id/mark-paid - mark paid (staff) - sensitive
router.post(
  "/:id/mark-paid",
  [
    ...staffOrAdmin,
    limiter("sensitiveLimiter"),
    ...(validate && validate.validateStaff ? [validate.validateStaff] : []),
  ],
  billController.markBillPaid
);

// backward-compatibility: PATCH /:id/pay -> mark-paid
router.patch(
  "/:id/pay",
  [
    ...staffOrAdmin,
    limiter("sensitiveLimiter"),
    ...(validate && validate.validateStaff ? [validate.validateStaff] : []),
  ],
  billController.updatePaymentStatus || billController.markBillPaid
);

// GET /api/:rid/bills/active (staff)
router.get(
  "/active",
  [...staffOrAdmin, limiter("staffLimiter")],
  billController.getActiveBills
);

// GET /api/:rid/bills/history
router.get("/history", billController.getBillsHistory);

module.exports = router;
