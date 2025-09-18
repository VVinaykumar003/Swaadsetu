const jwt = require("jsonwebtoken");
const config = require("../../config");

/**
 * Generate JWT token
 * @param {Object} payload - Data to include in token
 * @param {Object} options - JWT options (expiresIn, etc.)
 * @returns {String} JWT token
 */
function generateToken(payload, options = {}) {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: options.expiresIn || "1h",
    ...options,
  });
}

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
  return jwt.verify(token, config.JWT_SECRET);
}

module.exports = {
  generateToken,
  verifyToken,
};
