const express = require("express");
const router = express.Router({ mergeParams: true });

const callController = require("../controllers/call.controller");

// defensive imports
let authMiddleware = null;
let rateLimit = null;
let helpers = null;
let requireRole = null;

try {
  authMiddleware = require("../common/middlewares/auth.middleware");
} catch (e) {
  console.warn(
    "auth.middleware not found — staff protections will error if used."
  );
}

try {
  rateLimit = require("../common/middlewares/rateLimit.middleware");
} catch (e) {
  console.warn(
    "rateLimit.middleware not found — rate limiting disabled for call routes."
  );
  rateLimit = {};
}

try {
  helpers = require("../common/libs/helpers");
} catch (e) {
  console.warn(
    "common/libs/helpers not found — staffAlias validation and requireRoleMiddleware unavailable."
  );
  helpers = null;
}

try {
  requireRole = require("../common/middlewares/role.middleware");
} catch (e) {
  console.warn(
    "role.middleware not found — role-based protections will error if used."
  );
  requireRole = null;
}

// helper wrappers
function limiter(name) {
  if (!rateLimit || !rateLimit[name]) return (req, res, next) => next();
  return rateLimit[name];
}

// Staff role middleware (defensive)
let requireStaff = (req, res, next) => {
  if (!requireRole) {
    console.error("role.middleware not available — staff protection failed.");
    return res.status(500).json({ error: "Server configuration error" });
  }
  return requireRole("staff")(req, res, next);
};

// ensureStaffAlias middleware for resolve (validates staffAlias)
const ensureStaffAliasMiddleware =
  helpers && typeof helpers.ensureStaffAliasMiddleware === "function"
    ? helpers.ensureStaffAliasMiddleware()
    : (req, res, next) => next();

/**
 * Routes:
 *
 * POST   /api/:rid/calls            -- public (customer)
 * PATCH  /api/:rid/calls/:id/resolve -- staff only
 * GET    /api/:rid/calls/active     -- staff only
 */

// Create call (public) - apply light rate limiting via apiLimiter if available
router.post("/", limiter("apiLimiter"), callController.createCall);

// Resolve call (staff only)
router.patch(
  "/:id/resolve",
  [requireStaff, limiter("staffLimiter"), ensureStaffAliasMiddleware],
  callController.resolveCall
);

// Get active calls (staff only)
router.get(
  "/active",
  [requireStaff, limiter("staffLimiter")],
  callController.getActiveCalls
);

module.exports = router;
