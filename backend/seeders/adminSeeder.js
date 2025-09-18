const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("../models/admin.model");
const config = require("../config");

// Connect to database
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      restaurantId: config.DEFAULT_RESTAURANT_ID,
    });
    if (existingAdmin) {
      console.log("Admin already exists. Seeder skipped.");
      process.exit(0);
    }

    // Hash the pin
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(config.DEFAULT_ADMIN_PIN, salt);

    // Create admin
    const admin = new Admin({
      restaurantId: config.DEFAULT_RESTAURANT_ID,
      hashedPin,
      staffAliases: ["Manager", "Waiter", "Chef"],
    });

    await admin.save();
    console.log("Default admin created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeder error:", error);
    process.exit(1);
  }
}

seedAdmin();
