const express = require("express");

const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getEnrolledCourses,
  getTeacherStudents,
} = require("../controllers/courseController");

const {
  protect,
  teacherOnly,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.get("/", getAllCourses);

// Student Routes
router.get("/enrolled", protect, authorizeRoles("student"), getEnrolledCourses);
router.post("/:id/enroll", protect, authorizeRoles("student"), enrollInCourse);

// Teacher Student List Route
router.get("/teacher/students", protect, authorizeRoles("teacher"), getTeacherStudents);

// Public single course
router.get("/:id", getCourseById);

// Teacher Routes
router.post("/", protect, teacherOnly, createCourse);
router.put("/:id", protect, teacherOnly, updateCourse);
router.delete("/:id", protect, teacherOnly, deleteCourse);

module.exports = router;
