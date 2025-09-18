const mongoose = require("mongoose");
const config = require("../config");
const logger = require("../common/libs/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  logger.info("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  logger.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("Mongoose disconnected from DB");
});

// Handle app termination
process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    logger.info("Mongoose disconnected on app termination");
    process.exit(0);
  });
});

module.exports = connectDB;
