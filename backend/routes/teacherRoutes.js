const express = require("express");
const {
  getTeacherStudents,
  getTeacherStudentDetails,
  getTeacherDashboardStats,
} = require("../controllers/teacherController");
const { protect, teacherOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Teacher Enrolled Students Directory
router.get("/students", protect, teacherOnly, getTeacherStudents);

// Teacher View Specific Student Details
router.get("/students/:studentId", protect, teacherOnly, getTeacherStudentDetails);

// Teacher Dashboard Real Metrics
router.get("/dashboard-stats", protect, teacherOnly, getTeacherDashboardStats);

module.exports = router;
