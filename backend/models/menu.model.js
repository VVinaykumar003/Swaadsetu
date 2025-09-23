// models/menu.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const MenuItemSchema = new Schema({
  itemId: { type: String, required: true, index: true }, // e.g. "i_..." or SKU
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, default: 0 },
  currency: { type: String, default: "INR" },
  image: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  isVegetarian: { type: Boolean, default: false },
  preparationTime: { type: Number, default: null },
  metadata: { type: Schema.Types.Mixed, default: {} },
});

const MenuCategorySchema = new Schema({
  name: { type: String, required: true },
  itemIds: { type: [String], default: [] }, // array of itemId strings
});

const TaxSchema = new Schema({
  name: { type: String, default: "GST" },
  percent: { type: Number, default: 0 },
});

const MenuSchema = new Schema(
  {
    restaurantId: {
      type: String,
      required: true,
      index: true,
      // DO NOT set unique:true here — we support versioned menu docs per restaurant
    },
    version: { type: Number, required: true, default: 1 },
    isActive: { type: Boolean, default: true }, // which menu is currently active
    title: { type: String, default: "" },

    items: { type: [MenuItemSchema], default: [] },
    categories: { type: [MenuCategorySchema], default: [] },

    taxes: { type: [TaxSchema], default: [] }, // array of taxes
    serviceCharge: { type: Number, default: 0 },
    branding: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

// Indexes
MenuSchema.index({ restaurantId: 1, version: -1 });
MenuSchema.index({ restaurantId: 1, isActive: 1 });

module.exports = mongoose.model("Menu", MenuSchema);
