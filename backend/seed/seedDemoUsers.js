const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Course = require("../models/Course");
const Note = require("../models/Note");
const Quiz = require("../models/Quiz");
const Assignment = require("../models/Assignment");

const seedDemoUsers = async () => {
  try {
    const hashedPasswordTeacher = await bcrypt.hash("Avinash@123", 10);
    const hashedPasswordAdmin = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "Admin@123",
      10
    );

    const demoUsers = [
      {
        name: "Ashutosh Singh",
        email: "ashutosh123@gmail.com",
        password: hashedPasswordTeacher,
        role: "student",
        isActive: true,
      },
      {
        name: "Prof. Avinash Singh",
        email: "avinashsingh88161@gmail.com",
        password: hashedPasswordTeacher,
        role: "teacher",
        teacherId: "TCH101",
        subject: "Computer Science",
        isActive: true,
      },
      {
        name: "Prof. Avinash Singh",
        email: "avinashsingh888161@gmail.com",
        password: hashedPasswordTeacher,
        role: "teacher",
        teacherId: "TCH101",
        subject: "Computer Science",
        isActive: true,
      },
      {
        name: process.env.ADMIN_NAME || "System HOD / Admin",
        email: process.env.ADMIN_EMAIL || "admin@eduverse.com",
        password: hashedPasswordAdmin,
        role: "admin",
        isActive: true,
      },
    ];

    for (const u of demoUsers) {
      let existing = await User.findOne({ email: u.email });
      if (existing) {
        existing.name = u.name;
        existing.password = u.password;
        existing.role = u.role;
        existing.isActive = true;
        if (u.teacherId) existing.teacherId = u.teacherId;
        if (u.subject) existing.subject = u.subject;
        await existing.save();
      } else {
        await User.create(u);
      }
    }

    // Sync any courses, notes, quizzes, and assignments to primary teacher account
    const primaryTeacher = await User.findOne({ email: "avinashsingh88161@gmail.com" });
    const altTeacher = await User.findOne({ email: "avinashsingh888161@gmail.com" });

    if (primaryTeacher && altTeacher && primaryTeacher._id.toString() !== altTeacher._id.toString()) {
      await Promise.all([
        Course.updateMany({ teacher: altTeacher._id }, { teacher: primaryTeacher._id }),
        Note.updateMany({ teacher: altTeacher._id }, { teacher: primaryTeacher._id }),
        Quiz.updateMany({ teacher: altTeacher._id }, { teacher: primaryTeacher._id }),
        Assignment.updateMany({ teacher: altTeacher._id }, { teacher: primaryTeacher._id }),
      ]);
    }

    console.log("✅ Seeded demo accounts and synced teacher content.");
  } catch (error) {
    console.error("Demo user seeding error:", error);
  }
};

module.exports = seedDemoUsers;

if (require.main === module) {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eduverse";
  mongoose.connect(mongoUri).then(() => {
    seedDemoUsers().then(() => process.exit(0));
  });
}
