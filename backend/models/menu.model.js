const mongoose = require("mongoose");
const { Schema } = mongoose;

const MenuSchema = new Schema(
  {
    restaurantId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    items: { type: Array, default: [] },
    categories: { type: Array, default: [] },
    taxes: { type: Object, default: null },
    serviceCharge: { type: Number, default: 0 },
    branding: { type: Object, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Menu", MenuSchema);
