const Note = require("../models/Note");
const Course = require("../models/Course");
const path = require("path");

// @route   POST /api/notes
// @access  Teacher
const uploadNote = async (req, res) => {
  try {
    const title = req.body.title;
    const description = req.body.description || "";
    const targetCourseId = req.body.courseId || req.body.course;

    if (!title || !targetCourseId) {
      return res.status(400).json({
        success: false,
        message: "Title and Course ID are required.",
      });
    }

    // Extract file from req.file or req.files
    let uploadedFile = req.file;
    if (!uploadedFile && req.files) {
      if (req.files.file && req.files.file[0]) {
        uploadedFile = req.files.file[0];
      } else if (req.files.pdfFile && req.files.pdfFile[0]) {
        uploadedFile = req.files.pdfFile[0];
      }
    }

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file.",
      });
    }

    const course = await Course.findById(targetCourseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // Only the course owner or admin can upload notes
    const courseTeacherId = (course.teacher?._id || course.teacher || "").toString();
    const currentUserId = (req.user._id || req.user.id || "").toString();
    const userRole = (req.user.role || "").toLowerCase();

    if (courseTeacherId && currentUserId && courseTeacherId !== currentUserId && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can upload notes only for your own course.",
      });
    }

    const rawFileUrl = uploadedFile.path || uploadedFile.secure_url || uploadedFile.url || "";
    const isCloud = rawFileUrl.startsWith("http");
    let fileUrl = isCloud ? rawFileUrl : "";
    if (fileUrl.includes("cloudinary.com") && fileUrl.includes("/image/upload/") && fileUrl.toLowerCase().endsWith(".pdf")) {
      fileUrl = fileUrl.replace("/image/upload/", "/raw/upload/");
    }
    const publicId = uploadedFile.filename || uploadedFile.public_id || "";
    const originalFileName = uploadedFile.originalname || "";
    const fileType = uploadedFile.mimetype || "application/pdf";
    const pdfFile = fileUrl || (uploadedFile.filename || "");

    const note = await Note.create({
      title,
      description,
      pdfFile,
      fileUrl,
      publicId,
      originalFileName,
      fileType,
      fileSize: uploadedFile.size || 0,
      course: targetCourseId,
      teacher: req.user._id,
    });

    // Notify enrolled students in course
    if (course.enrolledStudents && course.enrolledStudents.length > 0) {
      try {
        const Notification = require("../models/Notification");
        const notifDocs = course.enrolledStudents.map((studentId) => ({
          recipient: studentId,
          type: "NEW_NOTE",
          title: "New Course Material",
          message: `New note uploaded for ${course.title}: "${title}"`,
          referenceId: note._id,
          targetRoute: `/student/courses/${targetCourseId}`,
        }));
        await Notification.insertMany(notifDocs);
      } catch (nErr) {
        console.error("Note notification error:", nErr);
      }
    }

    res.status(201).json({
      success: true,
      message: "Note uploaded successfully.",
      note,
    });
  } catch (error) {
    console.error("Upload note error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   GET /api/notes/course/:courseId
// @access  Student & Teacher & Admin
const getCourseNotes = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const isCourseOwner = course.teacher.toString() === req.user._id.toString();
    const isEnrolled = course.enrolledStudents.some(
      (studentId) => studentId.toString() === req.user._id.toString()
    );

    if (!isEnrolled && !isCourseOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course.",
      });
    }

    const notes = await Note.find({
      course: courseId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Get course notes error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   GET /api/notes/:noteId/file
// @access  Student & Teacher & Admin
const getNoteFile = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const course = await Course.findById(note.course);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const isCourseOwner = course.teacher.toString() === req.user._id.toString();
    const isEnrolled = course.enrolledStudents.some(
      (studentId) => studentId.toString() === req.user._id.toString()
    );

    if (!isEnrolled && !isCourseOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course.",
      });
    }

    let targetUrl = note.fileUrl || note.pdfFile || "";
    if (targetUrl && targetUrl.startsWith("http")) {
      if (targetUrl.includes("cloudinary.com") && targetUrl.includes("/image/upload/") && targetUrl.toLowerCase().endsWith(".pdf")) {
        targetUrl = targetUrl.replace("/image/upload/", "/raw/upload/");
      }
      return res.redirect(targetUrl);
    }

    const filePath = path.join(__dirname, "../uploads/notes", note.pdfFile);

    res.setHeader("Content-Type", note.fileType || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${note.originalFileName || note.pdfFile}"`);

    res.sendFile(filePath, (error) => {
      if (error) {
        console.error("PDF file send error:", error);
        if (!res.headersSent) {
          return res.status(404).json({
            success: false,
            message: "PDF file not found on server.",
          });
        }
      }
    });
  } catch (error) {
    console.error("Get note file error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   DELETE /api/notes/:noteId
// @access  Teacher / Admin
const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const course = await Course.findById(note.course);
    const teacherIdStr = (note.teacher?._id || note.teacher || course?.teacher || "").toString();

    if (teacherIdStr !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can delete only notes from your own course.",
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete note.",
      error: error.message,
    });
  }
};

module.exports = {
  uploadNote,
  getCourseNotes,
  getNoteFile,
  deleteNote,
};
