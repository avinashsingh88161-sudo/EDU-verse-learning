const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getAdminDashboard,
  getAdminTeachers,
  getAdminStudents,
  getAdminCourses,
  getAdminQuizzes,
  getAdminAssignments,
  getAdminResults,
  getAdminActivity,
  toggleUserStatus,
  getTeacherRequests,
  approveTeacherRequest,
  rejectTeacherRequest,
} = require("../controllers/adminController");

const router = express.Router();

// All routes require JWT authentication & Admin role
router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/dashboard", getAdminDashboard);
router.get("/teachers", getAdminTeachers);
router.get("/students", getAdminStudents);
router.get("/courses", getAdminCourses);
router.get("/quizzes", getAdminQuizzes);
router.get("/assignments", getAdminAssignments);
router.get("/results", getAdminResults);
router.get("/activity", getAdminActivity);
router.put("/users/:userId/toggle-status", toggleUserStatus);

// Teacher Registration Requests Management Routes
router.get("/teacher-requests", getTeacherRequests);
router.put("/teacher-requests/:requestId/approve", approveTeacherRequest);
router.put("/teacher-requests/:requestId/reject", rejectTeacherRequest);

module.exports = router;
