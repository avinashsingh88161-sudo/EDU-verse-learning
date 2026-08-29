const mongoose = require("mongoose");
const dns = require("dns");

// Ensure IPv4 resolution first for MongoDB Atlas SRV records
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (dnsErr) {
  // Ignore if DNS method not supported
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eduverse";
    const isAtlas = mongoUri.includes("mongodb.net") || mongoUri.startsWith("mongodb+srv://");

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 1,
      socketTimeoutMS: 45000,
    });
    console.log(`🍃 MongoDB Connected: ${conn.connection.host} (${isAtlas ? "MongoDB Atlas" : "Local Database"})`);
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Failed (${error.message}). Falling back to local MongoDB...`);
    try {
      const fallbackUri = "mongodb://127.0.0.1:27017/eduverse";
      const fallbackConn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`🍃 MongoDB Connected: ${fallbackConn.connection.host} (Local Fallback Database)`);
    } catch (fallbackErr) {
      console.error(`❌ Fatal Database Error: ${fallbackErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
