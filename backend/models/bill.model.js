const mongoose = require("mongoose");
const { Schema } = mongoose;

const BillItemSchema = new Schema(
  {
    itemId: { type: String, required: true }, // menu item id / SKU
    name: { type: String, required: true },
    qty: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true }, // price at billing time
    // alias for controllers that expect priceAtOrder
    priceAtOrder: { type: Number, required: true, default: 0 },
    modifiers: [
      {
        id: String,
        name: String,
        priceDelta: Number,
      },
    ],
    notes: { type: String },
  },
  { _id: false }
);

const BillSchema = new Schema({
  restaurantId: { type: String, required: true },
  tableId: { type: String, required: true },
  sessionId: { type: String, required: true },

  items: { type: [BillItemSchema], default: [] },
  extras: { type: [{ label: String, amount: Number }], default: [] },

  subtotal: { type: Number, required: true, default: 0 },
  taxes: [
    {
      name: String,
      rate: Number,
      amount: Number,
    },
  ],
  taxAmount: { type: Number, default: 0 }, // Total tax amount for compatibility
  discountPercent: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  serviceChargeAmount: { type: Number, default: 0 },

  totalAmount: { type: Number, required: true, default: 0 },

  // lifecycle
  status: {
    type: String,
    enum: ["draft", "finalized", "paid", "cancelled"],
    default: "draft",
  },

  audit: [{ by: String, action: String, delta: Object, at: Date }],

  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid",
  },

  // auditing
  staffAlias: { type: String, default: null },
  finalizedByAlias: { type: String, default: null },
  finalizedAt: { type: Date, default: null },
  paymentMarkedBy: { type: String, default: null },
  paidAt: { type: Date, default: null },

  adminReopened: {
    by: String,
    reason: String,
    at: Date,
  },

  overrideToken: { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
BillSchema.index({ restaurantId: 1, tableId: 1 });

BillSchema.index({ sessionId: 1 });
// optional: partial unique index to prevent multiple active bills per session (Mongo 3.2+)
// db.bills.createIndex({ sessionId: 1 }, { unique: true, partialFilterExpression: { status: { $in: ["draft", "finalized"] } } });

BillSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Bill", BillSchema);
