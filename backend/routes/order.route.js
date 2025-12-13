// routes/order.routes.js
// Unified Order Routes (Defensive imports + Staff/Admin protection)

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });
const orderController = require("../controllers/order.controller");

// ------------------------------------------------------------
// 🧱 Defensive Middleware Imports
// ------------------------------------------------------------
let authMiddleware = null;
let rateLimit = null;
let validate = null;

try {
  authMiddleware = require("../common/middlewares/auth.middleware");
} catch (e) {
  console.warn(
    "[order.routes] auth.middleware not available — protected routes may fail in production."
  );
}

try {
  rateLimit = require("../common/middlewares/rateLimit.middleware");
} catch (e) {
  console.warn(
    "[order.routes] rateLimit.middleware not available — disabling rate limiting."
  );
  rateLimit = {};
}

try {
  validate = require("../common/middlewares/validate.middleware");
} catch (e) {
  console.warn(
    "[order.routes] validate.middleware not available — skipping validation."
  );
  validate = {};
}

// ------------------------------------------------------------
// 🧩 Role & Limiter Helpers
// ------------------------------------------------------------

function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!authMiddleware) {
      const err = new Error("auth.middleware required but not found.");
      err.status = 500;
      return next(err);
    }

    if (!req.user) {
      return authMiddleware(req, res, (err) => {
        if (err) return next(err);
        checkUserRole(req, res, next, requiredRole);
      });
    }

    checkUserRole(req, res, next, requiredRole);
  };
}

function checkUserRole(req, res, next, requiredRole) {
  const userRole = (req.user && (req.user.role || req.user.roles)) || null;
  if (!userRole)
    return res.status(403).json({ error: "Forbidden (role missing)" });

  if (userRole === requiredRole || userRole === "admin") return next();

  return res.status(403).json({ error: "Forbidden (insufficient role)" });
}

function limiter(name) {
  if (!rateLimit || !rateLimit[name]) return (req, res, next) => next();
  return rateLimit[name];
}

function staffOrAdminMiddleware() {
  const arr = [];
  if (typeof authMiddleware === "function") arr.push(authMiddleware);
  arr.push(requireRole("staff"));
  const staffLimiter = limiter("staffLimiter");
  if (typeof staffLimiter === "function") arr.push(staffLimiter);
  return arr;
}

// ------------------------------------------------------------
// 🧾 Route Definitions
// ------------------------------------------------------------

/**
 * Routes overview:
 * POST   /api/:rid/orders             — public (create order)
 * GET    /api/:rid/orders/:orderId    — public (customer view order)
 * PATCH  /api/:rid/orders/:id/status  — staff/admin (update status)
 * GET    /api/:rid/orders/active      — staff/admin (active orders)
 * GET    /api/:rid/orders/history     — staff/admin (order history)
 * GET    /api/:rid/orders/waiters     — staff/admin (waiter names)
 * GET    /api/:rid/orders/table/:id   — staff/admin (orders by table)
 * GET    /api/:rid/orders/bill/:id    — staff/admin (bill by order)
 * DELETE /api/:rid/orders/:id         — staff/admin (delete order)
 * PATCH  /api/:rid/orders/:id         — staff/admin (sync order fields)
 */

// 1️⃣ Public: create order (customer)
router.post("/", orderController.createOrder);

// ------------------------------------------------------------
// 🔒 Staff/Admin routes (static paths first)
// ------------------------------------------------------------
router.get(
  "/active",
  staffOrAdminMiddleware(),
  orderController.getActiveOrders
);
router.get(
  "/history",
  staffOrAdminMiddleware(),
  orderController.getOrderHistory
);
router.get(
  "/waiters",
  staffOrAdminMiddleware(),
  orderController.getOrderWaiters
);
router.get(
  "/table/:tableId",
  staffOrAdminMiddleware(),
  orderController.getOrdersByTable
);
router.get(
  "/bill/:orderId",
  staffOrAdminMiddleware(),
  orderController.getBillByOrderId
);
// ✅ Public route (no auth)
router.get("/public/bill/:orderId", orderController.getBillByOrderIdPublic);
router.patch(
  "/:id/status",
  staffOrAdminMiddleware(),
  orderController.updateOrderStatus
);
router.delete(
  "/:id",
  staffOrAdminMiddleware(),
  orderController.deleteOrderById
);
router.patch(
  "/:id",
  staffOrAdminMiddleware(),
  orderController.updateOrderFromBill
);

// ------------------------------------------------------------
// 🌐 Public route (MUST BE LAST!)
// ------------------------------------------------------------
router.get("/:orderId", async (req, res, next) => {
  const { orderId } = req.params;

  // Defensive check
  if (!mongoose.isValidObjectId(orderId)) {
    return res.status(400).json({ error: "Invalid Order ID format" });
  }

  // Pass control to controller
  return orderController.getOrderById(req, res, next);
});

// ------------------------------------------------------------
// ✅ Export Router
// ------------------------------------------------------------
module.exports = router;
