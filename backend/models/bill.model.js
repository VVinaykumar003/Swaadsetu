// src/api/bills/bill.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

// BillItem: a snapshot of an ordered item at billing time.
// We keep it independent from Order model to avoid circular imports.
const BillItemSchema = new Schema(
  {
    itemId: { type: String, required: true }, // menu item id / SKU
    name: { type: String, required: true }, // item name snapshot
    qty: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true }, // price at billing time
    modifiers: [
      {
        id: String,
        name: String,
        priceDelta: Number,
      },
    ],
    // optional notes / cooking instructions snapshot
    notes: { type: String },
  },
  { _id: false } // no separate _id for embedded items
);

const BillSchema = new Schema({
  restaurantId: { type: String, required: true },
  tableId: { type: String, required: true },
  sessionId: { type: String, required: true },

  // items is explicitly an array of BillItemSchema and defaults to empty array
  items: { type: [BillItemSchema], default: [] },

  subtotal: { type: Number, required: true, default: 0 },
  tax: { type: Number, default: 0 },
  serviceCharge: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },

  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid",
  },

  staffAlias: { type: String }, // the waiter alias who generated the bill
  overrideToken: { type: String }, // hashed token id (if used)

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
BillSchema.index({ restaurantId: 1, tableId: 1 });
BillSchema.index({ sessionId: 1 });

// update timestamps
BillSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Bill", BillSchema);
