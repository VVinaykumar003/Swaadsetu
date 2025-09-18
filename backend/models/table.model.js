const mongoose = require("mongoose");
const { Schema } = mongoose;

const TableSchema = new Schema({
  restaurantId: { type: String, required: true },
  tableNumber: { type: Number, required: true, unique: true },
  capacity: { type: Number, required: true, min: 1 },
  isActive: { type: Boolean, default: true },
  currentSessionId: { type: String },
  staffAlias: { type: String },
  lastUsed: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
TableSchema.index({ restaurantId: 1, isActive: 1 });
TableSchema.index({ currentSessionId: 1 });

// Middleware to update timestamps
TableSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Table", TableSchema);
