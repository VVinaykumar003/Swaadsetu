// models/table.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const TableSchema = new Schema({
  restaurantId: { type: String, required: true, index: true },
  tableNumber: { type: Number, required: true }, // uniqueness enforced per-restaurant by index below
  capacity: { type: Number, required: true, min: 1 },
  isActive: { type: Boolean, default: true },
  // session info
  currentSessionId: { type: String, default: null, index: true },
  sessionExpiresAt: { type: Date, default: null }, // optional TTL for auto-expiry logic
  staffAlias: { type: String, default: null },
  lastUsed: { type: Date, default: Date.now },
  // soft-delete flag (optional but useful)
  isDeleted: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
// enforce tableNumber uniqueness per restaurant
TableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

// fast lookups
TableSchema.index({ restaurantId: 1, isActive: 1 });
TableSchema.index({ currentSessionId: 1 });

// Middleware to update timestamps
TableSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Table", TableSchema);
