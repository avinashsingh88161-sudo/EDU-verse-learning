const express = require("express");

const {
  createAssignment,
  getCourseAssignments,
  getTeacherAssignments,
  publishAssignment,
} = require("../controllers/assignmentController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Shared route
router.get("/course/:courseId", getCourseAssignments);

// Teacher routes
router.post("/", authorizeRoles("teacher"), createAssignment);
router.get("/teacher", authorizeRoles("teacher"), getTeacherAssignments);
router.put("/:id/publish", authorizeRoles("teacher"), publishAssignment);

module.exports = router;
