const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const adminName = process.env.ADMIN_NAME || "System HOD / Admin";
    const adminEmail = process.env.ADMIN_EMAIL || "admin@eduverse.com";
    const plainPassword = process.env.ADMIN_PASSWORD || "Admin@123";

    let admin = await User.findOne({ email: adminEmail });

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    if (admin) {
      admin.name = adminName;
      admin.role = "admin";
      admin.password = hashedPassword;
      admin.isActive = true;
      await admin.save();
      console.log(`Updated existing Admin account: ${adminEmail}`);
    } else {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isActive: true,
      });
      console.log(`Created new Admin account: ${adminEmail}`);
    }

    console.log(`🔑 Admin Credentials Ready:\nEmail: ${adminEmail}\nPassword: ${plainPassword}`);
  } catch (error) {
    console.error("Admin seeding error:", error);
  }
};

module.exports = seedAdmin;

if (require.main === module) {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eduverse";
  mongoose.connect(mongoUri).then(() => {
    seedAdmin().then(() => process.exit(0));
  });
}
