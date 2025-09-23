// server.js
require("dotenv").config();
const http = require("http");
const app = require("./app");
const { initializeSocket } = require("./services/socket.service");
const config = require("./config");
const logger = require("./common/libs/logger");

// connectDB exported as connectDB in our db/mongoose module
const { connectDB } = require("./db/mongoose");

const server = http.createServer(app);
let io = null;

async function boot() {
  try {
    // validate config early
    try {
      config.validate();
    } catch (cfgErr) {
      logger &&
        logger.error &&
        logger.error("Config validation failed:", cfgErr.message || cfgErr);
      process.exit(1);
    }

    // Connect to MongoDB
    await connectDB();
    logger && logger.info && logger.info("✅ MongoDB connected");

    // Initialize Socket.IO (may fallback internally if Redis not configured)
    try {
      io = await Promise.resolve(initializeSocket(server));
      logger && logger.info && logger.info("📡 Socket.IO initialized");
    } catch (sockErr) {
      logger &&
        logger.warn &&
        logger.warn(
          "Socket initialization failed — continuing without Socket.IO adapter.",
          sockErr && sockErr.message ? sockErr.message : sockErr
        );
      io = null;
    }

    const PORT = config.PORT || process.env.PORT || 3000;
    server.listen(PORT, () => {
      logger && logger.info && logger.info(`🚀 Server running on port ${PORT}`);
      logger &&
        logger.info &&
        logger.info(`Socket.IO ${io ? "ready" : "not initialized"}`);
    });
  } catch (err) {
    logger &&
      logger.error &&
      logger.error("Server boot error:", err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal) {
  try {
    logger &&
      logger.warn &&
      logger.warn(`Received ${signal}, shutting down...`);

    // Stop accepting new connections
    if (io && typeof io.close === "function") {
      await new Promise((resolve) => io.close(resolve));
      logger && logger.info && logger.info("✅ Socket.IO closed");
    }

    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    logger && logger.info && logger.info("✅ HTTP server closed");
    process.exit(0);
  } catch (err) {
    logger &&
      logger.error &&
      logger.error(
        "Error during shutdown:",
        err && err.message ? err.message : err
      );
    setTimeout(() => process.exit(1), 5000);
  }
}

// Listen for termination signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("uncaughtException", (err) => {
  logger &&
    logger.error &&
    logger.error("Uncaught exception:", err && err.stack ? err.stack : err);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  logger &&
    logger.error &&
    logger.error(
      "Unhandled rejection:",
      reason && reason.stack ? reason.stack : reason
    );
  gracefulShutdown("unhandledRejection");
});

// start boot process
boot();
