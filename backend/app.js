// app.js
// Updated mounts and diagnostics:
//  - Bills router mounted under the same per-restaurant base (/api/:rid) for consistency
//  - Admin router mounted only under /api/:rid/admin (removed duplicate base mount)
//  - Small debug helper prints registered routes at startup (remove in production)

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

// routes
const orderRoutes = require("./routes/order.route");
const tableRoutes = require("./routes/table.route");
const billRoutes = require("./routes/bill.route");
const callRoutes = require("./routes/call.route");
const adminRoutes = require("./routes/admin.route");

// middlewares (named)
const {
  validateRestaurant,
  validateCustomerSession,
  validateStaff,
  validateManager,
  handleIdempotency,
} = require("./common/middlewares/validate.middleware");

// logger
let logger = console;
try {
  logger = require("./common/libs/logger") || console;
} catch (e) {
  // fallback to console if custom logger unavailable
  console.warn("[app.js] custom logger not available, using console.");
}

const app = express();

// ------------------ Sanity checks ------------------
if (!validateRestaurant || typeof validateRestaurant !== "function") {
  throw new Error(
    "validateRestaurant middleware missing or invalid at ./common/middlewares/validate.middleware"
  );
}

// ------------------ Global Middlewares ------------------
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

if (logger && logger.middleware) {
  app.use(logger.middleware);
}

// Basic health endpoint
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ------------------ Mount per-restaurant validators ------------------
// ensures req.params.rid exists for routes under /api/:rid
app.use("/api/:rid", validateRestaurant);

// ------------------ API Routes ------------------
// NOTE: mount resource routers under the same per-restaurant base to keep routes consistent.
// Example final paths:
//   POST /api/:rid/orders/:orderId/bill   -> create bill from order
//   POST /api/:rid/bills                  -> manual bill creation
//   PATCH /api/:rid/bills/:id             -> update draft
//   POST /api/:rid/bills/:id/finalize     -> finalize bill

app.use("/api/:rid/orders", orderRoutes);
app.use("/api/:rid/tables", tableRoutes);

// Mount bill routes under the same base so router paths like "/orders/:orderId/bill" work
app.use("/api/:rid", billRoutes);

app.use("/api/:rid/calls", callRoutes);

// Admin routes: mount under /admin (avoid mounting admin at base unless intentional)
app.use("/api/:rid/admin", adminRoutes);
app.use("/api/:rid", adminRoutes);

// ------------------ Optional startup diagnostics (remove in production) ------------------
// Print registered routes for quick debugging (will list only direct routes on the app router)
(function printRegisteredRoutes() {
  try {
    if (!app || !app._router || !Array.isArray(app._router.stack)) return;
    const routeLines = [];
    app._router.stack.forEach((layer) => {
      if (layer && layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods || {})
          .map((m) => m.toUpperCase())
          .join(",");
        routeLines.push(`${methods} ${layer.route.path}`);
      } else if (layer && layer.name === "router" && layer.regexp) {
        // best-effort: show mount point (Express stores mount path as regexp)
        const mountPath =
          layer.regexp && layer.regexp.source
            ? layer.regexp.source.replace(
                /\\\/\?\(\?:\(\[\^\\\/]\+\?\)\\\/\?\)\?/g,
                "/:rid"
              )
            : "<router>";
        routeLines.push(`USE ${mountPath} (router)`);
      }
    });
    console.info(
      "[app.js] Registered routes (sample):\n",
      routeLines.join("\n")
    );
  } catch (e) {
    console.warn("[app.js] route listing failed:", e && e.message);
  }
})();

// ------------------ 404 handler ------------------
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ------------------ Error Handling ------------------
app.use((err, req, res, next) => {
  if (logger && typeof logger.error === "function") {
    logger.error(err && err.stack ? err.stack : err);
  } else {
    console.error(err);
  }
  const status = (err && err.status) || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
