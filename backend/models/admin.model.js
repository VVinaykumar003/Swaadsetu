// models/admin.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Subdocument for temporary override tokens
const OverrideTokenSchema = new Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const AdminSchema = new Schema({
  restaurantId: { type: String, required: true, unique: true },

  // Admin PIN hash (primary authentication)
  hashedPin: { type: String, required: true },

  // Optional: staff PIN hash for shared staff login
  staffHashedPin: { type: String, default: "" },

  // Override tokens (with TTL)
  overrideTokens: { type: [OverrideTokenSchema], default: [] },

  // Staff aliases (for waiter/chef/manager identifiers)
  staffAliases: { type: [String], default: [] },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
AdminSchema.index({ restaurantId: 1 }, { unique: true });

// Middleware to auto-update timestamps
AdminSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Admin", AdminSchema);
