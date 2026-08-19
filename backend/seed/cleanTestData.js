require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Course = require("../models/Course");
const Note = require("../models/Note");
const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");

const cleanTestData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eduverse";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for safe data cleanup & preservation...");

    const testEmails = [
      "studenttest@gmail.com",
      "testteacher@gmail.com",
      "nonenrolled@gmail.com",
    ];

    // Find test users to delete
    const testUsers = await User.find({ email: { $in: testEmails } });
    const testUserIds = testUsers.map((u) => u._id);

    console.log(`Found ${testUsers.length} test users to delete:`, testEmails);

    if (testUserIds.length > 0) {
      // Clean up test teacher's courses, assignments, quizzes, notes if any
      const testTeacher = testUsers.find((u) => u.email === "testteacher@gmail.com");
      if (testTeacher) {
        const testCourses = await Course.find({ teacher: testTeacher._id });
        const testCourseIds = testCourses.map((c) => c._id);

        await Note.deleteMany({ course: { $in: testCourseIds } });
        await Quiz.deleteMany({ course: { $in: testCourseIds } });
        await Assignment.deleteMany({ course: { $in: testCourseIds } });
        await Course.deleteMany({ _id: { $in: testCourseIds } });
        console.log(`Removed test courses/content for test teacher ${testTeacher.email}`);
      }

      // Delete test quiz results and submissions
      await QuizResult.deleteMany({ student: { $in: testUserIds } });
      await AssignmentSubmission.deleteMany({ student: { $in: testUserIds } });

      // Delete the test users
      await User.deleteMany({ _id: { $in: testUserIds } });
      console.log("Successfully removed test user accounts.");
    }

    // Clean up empty duplicate Avinash teacher accounts without data
    const duplicateAvinashEmails = [
      "avinashsingh88161@gmail.com",
      "avinashsingh123@gmail.com",
    ];
    for (const dupEmail of duplicateAvinashEmails) {
      const dup = await User.findOne({ email: dupEmail });
      if (dup) {
        const hasCourses = await Course.countDocuments({ teacher: dup._id });
        if (hasCourses === 0) {
          await User.deleteOne({ _id: dup._id });
          console.log(`Removed empty duplicate teacher account: ${dupEmail}`);
        }
      }
    }

    // Ensure main Avinash Singh teacher account (avinashsingh888161@gmail.com) has correct credentials and role
    const primaryAvinash = await User.findOne({ email: "avinashsingh888161@gmail.com" });
    if (primaryAvinash) {
      const hashedPassword = await bcrypt.hash("Avinash@123", 10);
      primaryAvinash.password = hashedPassword;
      primaryAvinash.role = "teacher";
      primaryAvinash.isActive = true;
      if (!primaryAvinash.teacherId) primaryAvinash.teacherId = "TCH101";
      if (!primaryAvinash.subject) primaryAvinash.subject = "Computer Science";
      await primaryAvinash.save();
      console.log("Successfully updated & verified primary Avinash Singh teacher account with password Avinash@123.");
    }

    // Print summary of active users
    const remainingUsers = await User.find({}).select("name email role isActive");
    console.log("\n=== PRESERVED USERS SUMMARY ===");
    remainingUsers.forEach((u) => {
      console.log(`- ${u.name} (${u.email}) [Role: ${u.role}, Active: ${u.isActive}]`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Cleanup error:", error);
    process.exit(1);
  }
};

cleanTestData();
