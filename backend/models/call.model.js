const mongoose = require("mongoose");
const { Schema } = mongoose;

const CallSchema = new Schema({
  restaurantId: { type: String, required: true },
  tableId: { type: String, required: true },
  sessionId: { type: String, required: true },
  type: {
    type: String,
    enum: ["staff", "bill", "help"],
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "resolved"],
    default: "active",
  },
  staffAlias: { type: String },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
CallSchema.index({ restaurantId: 1, tableId: 1, status: 1 });

// Middleware to update timestamps
CallSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Call", CallSchema);
