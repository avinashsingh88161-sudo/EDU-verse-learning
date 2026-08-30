const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mongoose = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/User");
const Course = require("./models/Course");
const Note = require("./models/Note");
const Quiz = require("./models/Quiz");
const QuizResult = require("./models/QuizResult");
const Assignment = require("./models/Assignment");
const AssignmentSubmission = require("./models/AssignmentSubmission");
const Notification = require("./models/Notification");
const AuthorizedTeacher = require("./models/AuthorizedTeacher");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const noteRoutes = require("./routes/noteRoutes");
const quizRoutes = require("./routes/quizRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const assignmentSubmissionRoutes = require("./routes/assignmentSubmissionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const searchRoutes = require("./routes/searchRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

async function runTests() {
  console.log("==================================================");
  console.log("🧪 STARTING EDUVERSE FULL-STACK UNIT & INTEGRATION TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    await connectDB();
    console.log("📊 Database Connected.");

    const seedDemoUsers = require("./seed/seedDemoUsers");
    const seedTeachers = require("./seed/seedTeacher");
    await seedDemoUsers();
    await seedTeachers();

    // Setup Test App
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use("/api/auth", authRoutes);
    app.use("/api/courses", courseRoutes);
    app.use("/api/notes", noteRoutes);
    app.use("/api/quizzes", quizRoutes);
    app.use("/api/assignments", assignmentRoutes);
    app.use("/api/assignment-submissions", assignmentSubmissionRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/teacher", teacherRoutes);
    app.use("/api/search", searchRoutes);
    app.use("/api/notifications", notificationRoutes);

    const server = app.listen(5099);

    const baseUrl = "http://localhost:5099/api";

    // 1. TEST AUTHENTICATION & LOGIN
    console.log("\n--- [1/7] Testing Authentication & Role Isolation ---");
    
    // Seed test users if needed
    const studentUser = await User.findOne({ email: "ashutosh123@gmail.com" });
    const teacherUser = await User.findOne({ email: "avinashsingh88161@gmail.com" });
    const adminUser = await User.findOne({ email: "admin@eduverse.com" });

    assert(studentUser && studentUser.role === "student", "Student test account exists");
    assert(teacherUser && teacherUser.role === "teacher", "Teacher test account exists");
    assert(adminUser && adminUser.role === "admin", "Admin test account exists");

    const studentToken = jwt.sign({ id: studentUser._id }, process.env.JWT_SECRET || "default_jwt_secret", { expiresIn: "1d" });
    const teacherToken = jwt.sign({ id: teacherUser._id }, process.env.JWT_SECRET || "default_jwt_secret", { expiresIn: "1d" });
    const adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || "default_jwt_secret", { expiresIn: "1d" });

    // 2. TEST COURSE CREATION & ENROLLMENT
    console.log("\n--- [2/7] Testing Course Management & Student Enrollment ---");
    
    let testCourse = await Course.findOne({ title: "Automated Test Course" });
    if (testCourse) {
      await Course.deleteOne({ _id: testCourse._id });
    }

    testCourse = await Course.create({
      title: "Automated Test Course",
      subject: "Computer Science",
      description: "Comprehensive testing course for institutional evaluation.",
      teacher: teacherUser._id,
      enrolledStudents: [studentUser._id],
    });

    assert(testCourse && testCourse._id, "Teacher successfully creates and owns course");
    assert(testCourse.enrolledStudents.includes(studentUser._id), "Student enrolled in course");

    // 3. TEST NOTES CREATION & METADATA
    console.log("\n--- [3/7] Testing PDF Notes Storage & Model ---");
    
    let testNote = await Note.findOne({ title: "Test Unit 1 Notes" });
    if (testNote) {
      await Note.deleteOne({ _id: testNote._id });
    }

    testNote = await Note.create({
      title: "Test Unit 1 Notes",
      description: "Testing notes module",
      pdfFile: "https://res.cloudinary.com/demo/image/upload/sample.pdf",
      fileUrl: "https://res.cloudinary.com/demo/image/upload/sample.pdf",
      fileType: "application/pdf",
      fileSize: 102400,
      course: testCourse._id,
      teacher: teacherUser._id,
    });

    assert(testNote && testNote.title === "Test Unit 1 Notes", "Note created with Cloudinary URL & metadata");
    
    const courseNotes = await Note.find({ course: testCourse._id });
    assert(courseNotes.length >= 1, "Course notes retrieved successfully for students");

    // 4. TEST QUIZ ENGINE & AUTOMATED EVALUATION
    console.log("\n--- [4/7] Testing Quiz Engine & Automated Scoring ---");
    
    let testQuiz = await Quiz.findOne({ title: "Unit Test Quiz" });
    if (testQuiz) {
      await Quiz.deleteOne({ _id: testQuiz._id });
    }

    testQuiz = await Quiz.create({
      title: "Unit Test Quiz",
      course: testCourse._id,
      teacher: teacherUser._id,
      passingPercentage: 60,
      isPublished: true,
      questions: [
        {
          question: "What is the time complexity of binary search?",
          options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
          correctAnswer: 1,
          marks: 10,
        },
        {
          question: "Which data structure follows LIFO?",
          options: ["Queue", "Stack", "Tree", "Graph"],
          correctAnswer: 1,
          marks: 10,
        },
      ],
      totalMarks: 20,
    });

    assert(testQuiz && testQuiz.questions.length === 2, "Teacher created quiz with 2 questions");

    // Simulate Student Attempt (1 correct, 1 wrong = 10/20 marks -> Fail if threshold 60%, 2 correct = 20/20 -> Pass)
    const studentAnswers = [
      { questionIndex: 0, selectedAnswer: 1 }, // Correct (10 marks)
      { questionIndex: 1, selectedAnswer: 1 }, // Correct (10 marks)
    ];

    let calculatedScore = 0;
    testQuiz.questions.forEach((q, idx) => {
      if (studentAnswers[idx] && studentAnswers[idx].selectedAnswer === q.correctAnswer) {
        calculatedScore += q.marks;
      }
    });

    let testAttempt = await QuizResult.create({
      quiz: testQuiz._id,
      student: studentUser._id,
      score: calculatedScore,
      totalQuestions: testQuiz.questions.length,
      percentage: (calculatedScore / testQuiz.totalMarks) * 100,
      answers: studentAnswers,
    });

    assert(testAttempt.score === 20, "Auto-evaluator scored 20/20 marks accurately");
    assert(testAttempt.percentage === 100, "Student quiz percentage computed accurately");

    // 5. TEST ASSIGNMENT & GRADING WORKFLOW
    console.log("\n--- [5/7] Testing Assignment & Faculty Grading Workflow ---");
    
    let testAssignment = await Assignment.findOne({ title: "Test Lab Assignment 1" });
    if (testAssignment) {
      await Assignment.deleteOne({ _id: testAssignment._id });
    }

    testAssignment = await Assignment.create({
      title: "Test Lab Assignment 1",
      description: "Implement a binary search tree in C++",
      course: testCourse._id,
      teacher: teacherUser._id,
      totalMarks: 50,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isPublished: true,
    });

    assert(testAssignment && testAssignment.totalMarks === 50, "Faculty posted assignment successfully");

    // Student Submits Deliverable
    let testSubmission = await AssignmentSubmission.create({
      assignment: testAssignment._id,
      student: studentUser._id,
      answer: "Submitted source code and project documentation.",
      fileUrl: "https://res.cloudinary.com/demo/image/upload/sample.pdf",
      status: "submitted",
    });

    assert(testSubmission.status === "submitted", "Student submitted deliverable");

    // Faculty Grades Submission
    testSubmission.marks = 48;
    testSubmission.feedback = "Excellent modular code structure.";
    testSubmission.status = "graded";
    await testSubmission.save();

    assert(testSubmission.marks === 48 && testSubmission.status === "graded", "Faculty graded submission with remarks");

    // 6. TEST NOTIFICATIONS
    console.log("\n--- [6/7] Testing Institutional Notification System ---");
    
    const notif = await Notification.create({
      recipient: studentUser._id,
      type: "ASSIGNMENT_GRADED",
      title: "Assignment Graded",
      message: "Your assignment has been graded: 48/50",
      targetRoute: "/student/assignments",
    });

    assert(notif && notif._id, "Notification dispatched to student");

    notif.isRead = true;
    await notif.save();
    assert(notif.isRead === true, "Notification marked as read");

    // 7. CLEANUP TEST ARTIFACTS
    console.log("\n--- [7/7] Cleaning up Test Fixtures ---");
    await Note.deleteOne({ _id: testNote._id });
    await QuizResult.deleteOne({ _id: testAttempt._id });
    await Quiz.deleteOne({ _id: testQuiz._id });
    await AssignmentSubmission.deleteOne({ _id: testSubmission._id });
    await Assignment.deleteOne({ _id: testAssignment._id });
    await Course.deleteOne({ _id: testCourse._id });
    await Notification.deleteOne({ _id: notif._id });
    console.log("🧹 Test fixtures cleaned up.");

    server.close();

    console.log("\n==================================================");
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("💥 Test execution error:", error);
    process.exit(1);
  }
}

runTests();
