const express = require("express");

const {
  uploadNote,
  getCourseNotes,
  getNoteFile,
  deleteNote,
} = require("../controllers/noteController");

const {
  protect,
  teacherOnly,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const { uploadNoteMiddleware } = require("../config/cloudinary");

const router = express.Router();

// Notes Retrieval Routes (Student, Teacher, Admin)
router.get(
  "/:noteId/file",
  protect,
  authorizeRoles("student", "teacher", "admin"),
  getNoteFile
);

router.get(
  "/course/:courseId",
  protect,
  authorizeRoles("student", "teacher", "admin"),
  getCourseNotes
);

// Teacher Upload Route (Accepts both field names 'file' and 'pdfFile' with graceful error handling)
router.post(
  "/",
  protect,
  teacherOnly,
  (req, res, next) => {
    uploadNoteMiddleware.fields([
      { name: "file", maxCount: 1 },
      { name: "pdfFile", maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        console.error("Multer / File upload error:", err);
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed. Please ensure the document is a valid PDF.",
        });
      }
      next();
    });
  },
  uploadNote
);

// Teacher Delete Note Route
router.delete(
  "/:noteId",
  protect,
  teacherOnly,
  deleteNote
);

module.exports = router;
