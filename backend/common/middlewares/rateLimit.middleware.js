const rateLimit = require("express-rate-limit");

// API rate limiter (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Sensitive actions rate limiter (10 requests per hour)
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: "Too many sensitive actions requested, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Staff actions rate limiter (50 requests per 5 minutes)
const staffLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50,
  message: "Too many staff actions from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  sensitiveLimiter,
  staffLimiter,
};
