const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdminSchema = new Schema({
  restaurantId: { type: String, required: true },
  hashedPin: { type: String, required: true },
  overrideTokens: [{ type: String }],
  staffAliases: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
AdminSchema.index({ restaurantId: 1 });

// Middleware to update timestamps
AdminSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Admin", AdminSchema);
