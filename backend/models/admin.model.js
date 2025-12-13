const mongoose = require("mongoose");
const { Schema } = mongoose;

/* ------------------------------------------------------------------
   Subdocument: Override token (temporary tokens with expiry)
------------------------------------------------------------------ */
const OverrideTokenSchema = new Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

/* ------------------------------------------------------------------
   Subdocument: single tax line (name + percent + code + inclusive flag)
------------------------------------------------------------------ */
const TaxLineSchema = new Schema({
  name: { type: String, required: true },
  percent: { type: Number, required: true, min: 0 },
  code: { type: String, default: "" },
  inclusive: { type: Boolean, default: false },
});

/* ------------------------------------------------------------------
   🆕 Subdocument: Offer (Promo Code) Schema
------------------------------------------------------------------ */
const OfferSchema = new Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    discountType: {
      type: String,
      enum: ["flat", "percent"],
      default: "percent",
    },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountValue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date, default: Date.now },
    validTill: { type: Date, default: null },
  },
  { _id: false }
);

/* ------------------------------------------------------------------
   Subdocument: pricing configuration (versioned)
------------------------------------------------------------------ */
const PricingConfigSchema = new Schema({
  version: { type: Number, required: true },
  active: { type: Boolean, default: false },
  effectiveFrom: { type: Date, default: null },
  globalDiscountPercent: { type: Number, default: 0, min: 0 },
  serviceChargePercent: { type: Number, default: 0, min: 0 },
  taxes: { type: [TaxLineSchema], default: [] },
  createdBy: { type: String, default: "system" },
  reason: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },

  // 🆕 Offers array inside pricing version
  offers: { type: [OfferSchema], default: [] },
});

/* ------------------------------------------------------------------
   Admin schema: one document per restaurant
------------------------------------------------------------------ */
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
  waiterNames: { type: [String], default: [] },

  // Pricing configs (history + active flag)
  pricingConfigs: { type: [PricingConfigSchema], default: [] },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
AdminSchema.index({ restaurantId: 1 }, { unique: true });

/* ------------------------------------------------------------------
   Middleware to auto-update timestamps
------------------------------------------------------------------ */
AdminSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

/* ------------------------------------------------------------------
   Instance helper: get active pricing config
------------------------------------------------------------------ */
AdminSchema.methods.getActivePricingConfig = function () {
  if (!Array.isArray(this.pricingConfigs) || this.pricingConfigs.length === 0)
    return null;
  const active = this.pricingConfigs.find((c) => c.active);
  if (active) return active;
  return this.pricingConfigs.reduce((best, cur) => {
    if (!best) return cur;
    return cur.version > best.version ? cur : best;
  }, null);
};

/* ------------------------------------------------------------------
   Static helper: add new pricing config
------------------------------------------------------------------ */
AdminSchema.statics.addPricingConfig = async function (restaurantId, cfg = {}) {
  const Admin = this;
  const doc = await Admin.findOne({ restaurantId });
  if (!doc)
    throw new Error("Admin config not found for restaurantId: " + restaurantId);

  // Determine next version
  const lastVersion =
    doc.pricingConfigs && doc.pricingConfigs.length
      ? doc.pricingConfigs.reduce((mx, c) => Math.max(mx, c.version || 0), 0)
      : 0;
  const nextVersion = lastVersion + 1;

  // Build new config object
  const newCfg = {
    version: nextVersion,
    active: !!cfg.activate,
    effectiveFrom: cfg.effectiveFrom || null,
    globalDiscountPercent: Number(cfg.globalDiscountPercent || 0),
    serviceChargePercent: Number(cfg.serviceChargePercent || 0),
    taxes: Array.isArray(cfg.taxes)
      ? cfg.taxes.map((t) => ({
          name: t.name,
          percent: Number(t.percent || 0),
          code: t.code || "",
          inclusive: !!t.inclusive,
        }))
      : [],
    createdBy: cfg.createdBy || "system",
    reason: cfg.reason || "",
    createdAt: new Date(),

    // 🆕 Offers
    offers: Array.isArray(cfg.offers)
      ? cfg.offers.map((offer) => ({
          code: (offer.code || "").toUpperCase().trim(),
          title: offer.title || "",
          description: offer.description || "",
          discountType: offer.discountType === "flat" ? "flat" : "percent",
          discountValue: Number(offer.discountValue || 0),
          minOrderValue: Number(offer.minOrderValue || 0),
          maxDiscountValue: Number(offer.maxDiscountValue || 0),
          isActive: typeof offer.isActive === "boolean" ? offer.isActive : true,
          validFrom: offer.validFrom ? new Date(offer.validFrom) : new Date(),
          validTill: offer.validTill ? new Date(offer.validTill) : null,
        }))
      : [],
  };

  // Deactivate previous if this one is active
  if (newCfg.active) {
    doc.pricingConfigs = (doc.pricingConfigs || []).map((c) => ({
      ...c,
      active: false,
    }));
  }

  doc.pricingConfigs = doc.pricingConfigs || [];
  doc.pricingConfigs.push(newCfg);
  await doc.save();
  return doc;
};

/* ------------------------------------------------------------------
   Static helper: activate a specific pricing version
------------------------------------------------------------------ */
AdminSchema.statics.activatePricingVersion = async function (
  restaurantId,
  version
) {
  const Admin = this;
  const doc = await Admin.findOne({ restaurantId });
  if (!doc)
    throw new Error("Admin config not found for restaurantId: " + restaurantId);

  let found = false;
  doc.pricingConfigs = (doc.pricingConfigs || []).map((c) => {
    if (c.version === version) {
      c.active = true;
      found = true;
    } else {
      c.active = false;
    }
    return c;
  });

  if (!found) throw new Error("Pricing config version not found: " + version);

  await doc.save();
  return doc;
};

/* ------------------------------------------------------------------
   Instance helper: get config by version
------------------------------------------------------------------ */
AdminSchema.methods.getPricingConfigByVersion = function (version) {
  if (!Array.isArray(this.pricingConfigs)) return null;
  return this.pricingConfigs.find((c) => c.version === version) || null;
};

/* ------------------------------------------------------------------
   Export model
------------------------------------------------------------------ */
module.exports = mongoose.model("Admin", AdminSchema);
