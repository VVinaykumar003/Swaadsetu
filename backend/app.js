// src/app.js
const express = require("express");

// initialize DB/clients (side-effects)
require("./db/mongoose");

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
const logger = require("./common/libs/logger");

const app = express();

// ------------------ Basic sanity checks ------------------
// validateRestaurant must be a function (required)
if (!validateRestaurant || typeof validateRestaurant !== "function") {
  console.error(
    "validateRestaurant middleware missing or invalid at ./common/middlewares/validate.middleware"
  );
  process.exit(1);
}

// ------------------ Global Middlewares ------------------
app.use(express.json());
if (logger && logger.middleware) {
  app.use(logger.middleware);
}

// Basic health
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ------------------ Optional: mount a global auth router/middleware ------------------
// If you later re-add an auth middleware or router that should run for all /api routes,
// require it here and mount e.g.:
// const authRouter = require("./common/middlewares/auth.middleware");
// if (authRouter && typeof authRouter === "function") {
//   app.use("/api", authRouter);
// }
// (We're not importing auth.middleware here because we've consolidated to a single validate.middleware)

// ------------------ Mount per-restaurant validators ------------------
// This ensures req.params.rid exists for routes under /api/:rid
app.use("/api/:rid", validateRestaurant);

// ------------------ API Routes ------------------
// Note: route files should apply route-level middlewares where needed
// e.g., order.route.js can import handleIdempotency and validateCustomerSession or validateStaff.

app.use("/api/:rid/orders", orderRoutes);
app.use("/api/:rid/tables", tableRoutes);
app.use("/api/:rid/bills", billRoutes);
app.use("/api/:rid/calls", callRoutes);
app.use("/api/:rid/admin", adminRoutes);

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
