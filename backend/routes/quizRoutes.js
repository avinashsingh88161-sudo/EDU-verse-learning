const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  createQuiz,
  getAllQuizzes,
  getTeacherQuizzes,
  submitQuiz,
  getStudentQuizzes,
  getStudentQuizById,
  getMyQuizResults,
  getQuizResultsForTeacher,
  updateQuiz,
  togglePublishQuiz,
} = require("../controllers/quizController");

const router = express.Router();

// Public / General Routes
router.get("/", getAllQuizzes);

// Student Routes
router.get("/student", protect, authorizeRoles("student"), getStudentQuizzes);
router.get("/results/my", protect, authorizeRoles("student"), getMyQuizResults);
router.get("/student/:quizId", protect, authorizeRoles("student"), getStudentQuizById);
router.post("/:quizId/submit", protect, authorizeRoles("student"), submitQuiz);

// Teacher Routes
router.get("/teacher", protect, authorizeRoles("teacher"), getTeacherQuizzes);
router.post("/", protect, authorizeRoles("teacher"), createQuiz);
router.put("/:quizId", protect, authorizeRoles("teacher"), updateQuiz);
router.put("/:quizId/publish", protect, authorizeRoles("teacher"), togglePublishQuiz);
router.get("/:quizId/results", protect, authorizeRoles("teacher"), getQuizResultsForTeacher);

module.exports = router;
