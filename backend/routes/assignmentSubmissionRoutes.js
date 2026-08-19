const express = require("express");
const {
  submitAssignment,
  getAssignmentSubmissions,
  gradeAssignment,
  getMyAssignmentSubmissions,
  getSubmissionFile,
} = require("../controllers/assignmentSubmissionController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { uploadSubmissionMiddleware } = require("../config/cloudinary");

const router = express.Router();

// Student Submit Assignment (Accepts 'file' or 'submissionFile')
router.post(
  "/:assignmentId",
  protect,
  authorizeRoles("student"),
  uploadSubmissionMiddleware.fields([
    { name: "file", maxCount: 1 },
    { name: "submissionFile", maxCount: 1 },
  ]),
  submitAssignment
);

// Student View My Submissions
router.get(
  "/my",
  protect,
  authorizeRoles("student"),
  getMyAssignmentSubmissions
);

// File stream / download endpoint
router.get(
  "/:submissionId/file",
  protect,
  getSubmissionFile
);

// Teacher View Submissions
router.get(
  "/assignment/:assignmentId",
  protect,
  authorizeRoles("teacher"),
  getAssignmentSubmissions
);

// Teacher Grade Submission
router.put(
  "/:submissionId/grade",
  protect,
  authorizeRoles("teacher"),
  gradeAssignment
);

module.exports = router;
