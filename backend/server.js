// server.js
require("dotenv").config();
const http = require("http");
const app = require("./app");
const { initializeSocket } = require("./services/socket.service");
const config = require("./config");
const connectDB = require("./db/mongoose"); // Import MongoDB connection

const server = http.createServer(app);

// We'll set `io` later (may be sync or async depending on your initializeSocket implementation)
let io;

/**
 * Boot the server: initialize sockets (sync or async) then start listening.
 */
(async function boot() {
  try {
    // Connect to MongoDB first
    await connectDB();
    console.log("✅ MongoDB connected");

    // Then initialize Socket.IO
    io = await Promise.resolve(initializeSocket(server));
    console.log("📡 Socket.IO initialized");
  } catch (err) {
    // Log but continue — socket service should already have fallen back to in-memory if needed.
    console.warn(
      "⚠️  Socket.IO initialization failed or Redis unavailable — continuing without Redis adapter."
    );
    console.warn(err && err.message ? err.message : err);
    // It's okay to continue; `io` may be undefined if initialization failed completely.
  }

  const PORT = config.PORT || process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(
      `📡 Socket.IO ${io ? "ready" : "not initialized (check logs)"}${
        config.REDIS_URL ? " — REDIS_URL present" : ""
      }`
    );
  });
})();

/**
 * Graceful shutdown helper
 */
async function gracefulShutdown(signal) {
  console.log(`\n⚠️  Received ${signal}. Shutting down...`);

  // Stop accepting new connections
  try {
    // Close socket.io first (if available)
    if (io && typeof io.close === "function") {
      await new Promise((resolve) => io.close(resolve));
      console.log("✅ Socket.IO closed");
    } else {
      console.log("ℹ️  Socket.IO not initialized or already closed");
    }
  } catch (err) {
    console.warn(
      "Error while closing Socket.IO:",
      err && err.message ? err.message : err
    );
  }

  // Close HTTP server
  try {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    console.log("✅ HTTP server closed");
    process.exit(0);
  } catch (err) {
    console.warn(
      "Error while closing HTTP server:",
      err && err.message ? err.message : err
    );
    // Force exit after a short delay
    setTimeout(() => process.exit(1), 5000);
  }

  // Safety: force exit if things hang
  setTimeout(() => {
    console.error("Forcing process.exit due to shutdown timeout");
    process.exit(1);
  }, 10000).unref();
}

// Listen for common termination signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Optional: handle uncaught exceptions/rejections (log and attempt graceful shutdown)
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err && err.stack ? err.stack : err);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  console.error(
    "Unhandled rejection:",
    reason && reason.stack ? reason.stack : reason
  );
  // attempt graceful shutdown but don't block forever
  gracefulShutdown("unhandledRejection");
});
