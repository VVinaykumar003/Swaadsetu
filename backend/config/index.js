require("dotenv").config();

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/swadsetu",
  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || null,
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || "swadsetu-secret-key",
  DEFAULT_RESTAURANT_ID: process.env.DEFAULT_RESTAURANT_ID || "restro10",
  DEFAULT_ADMIN_PIN: process.env.DEFAULT_ADMIN_PIN || "1111",
};
