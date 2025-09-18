const mongoose = require("mongoose");
const { Schema } = mongoose;

const OrderItemSchema = new Schema({
  menuItemId: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  notes: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "preparing", "ready", "served", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const OrderSchema = new Schema({
  restaurantId: { type: String, required: true },
  tableId: { type: String, required: true },
  sessionId: { type: String, required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "preparing", "ready", "served", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid",
  },
  isCustomerOrder: { type: Boolean, default: true },
  staffAlias: { type: String },
  overrideToken: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
OrderSchema.index({ restaurantId: 1, tableId: 1, status: 1 });
OrderSchema.index({ sessionId: 1 });

// Middleware to update timestamps
OrderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
