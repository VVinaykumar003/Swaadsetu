// routes/call.route.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const callController = require("../controllers/call.controller");

// --------------------------- DEFENSIVE IMPORTS ---------------------------
let authMiddleware = (req, res, next) => next();
let requireRole = () => (req, res, next) => next();
let rateLimit = {};

// 🔹 Load authentication middleware
try {
  const auth = require("../common/middlewares/auth.middleware");
  // If the module exports a function directly, use it as is
  authMiddleware =
    typeof auth === "function" ? auth : auth.verifyToken || authMiddleware;
  console.log("[call.routes] Auth middleware loaded successfully");
} catch (e) {
  console.warn(
    "[call.routes] auth.middleware not found — routes may be unprotected."
  );
}

// 🔹 Load role middleware
try {
  const role = require("../common/middlewares/role.middleware");
  // The file exports the middleware function directly
  requireRole =
    typeof role === "function" ? role : role.requireRole || requireRole;
  console.log("[call.routes] Role middleware loaded successfully");
} catch (e) {
  console.warn(
    "[call.routes] role.middleware not found — skipping role enforcement."
  );
}

// 🔹 Load optional rate limiter
try {
  rateLimit = require("../common/middlewares/rateLimit.middleware");
} catch (e) {
  console.warn(
    "[call.routes] rateLimit.middleware not found — no rate limiting."
  );
  rateLimit = {};
}

// Utility: named limiter or no-op
function limiter(name) {
  if (!rateLimit || !rateLimit[name]) return (req, res, next) => next();
  return rateLimit[name];
}

// --------------------------- ROLE GROUPS ---------------------------
const staffOrAdmin = [authMiddleware, requireRole(["staff", "admin"])];
const adminOnly = [authMiddleware, requireRole(["admin"])];

// --------------------------- ROUTES ---------------------------

// 🧾 Create a new call (Customer/Table)
router.post("/", limiter("createCall"), callController.createCall);

// 👩‍🍳 Get active calls (Staff/Admin)
router.get(
  "/active",
  authMiddleware, // Must run first
  requireRole(["staff", "admin"]), // Checks req.user.role
  limiter("getActiveCalls"),
  callController.getActiveCalls
);

// ✅ Resolve a call (Staff/Admin)
router.patch(
  "/:id/resolve",
  authMiddleware,
  requireRole(["staff", "admin"]),
  limiter("resolveCall"),
  callController.resolveCall
);

// 📜 Get resolved call history (Staff/Admin)
router.get(
  "/resolved",
  authMiddleware,
  requireRole(["staff", "admin"]),
  limiter("getResolvedCalls"),
  callController.getResolvedCalls
);

// ----------------------------------------------------------------
module.exports = router;
