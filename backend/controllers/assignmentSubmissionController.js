const AssignmentSubmission = require("../models/AssignmentSubmission");
const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const path = require("path");

// @route   POST /api/assignment-submissions/:assignmentId
// @access  Student
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const answer = req.body.answer || "";

    let uploadedFile = req.file;
    if (!uploadedFile && req.files) {
      if (req.files.file && req.files.file[0]) uploadedFile = req.files.file[0];
      else if (req.files.submissionFile && req.files.submissionFile[0]) uploadedFile = req.files.submissionFile[0];
    }

    if (!answer && !uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "Please provide an answer text or upload a deliverable file (PDF/JPG/PNG).",
      });
    }

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    // Assignment must be published
    if (!assignment.isPublished) {
      return res.status(403).json({
        success: false,
        message: "This assignment is not published.",
      });
    }

    // Check course
    const course = await Course.findById(assignment.course);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // Check student enrollment
    const isEnrolled = course.enrolledStudents.some(
      (studentId) => studentId.toString() === req.user._id.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course.",
      });
    }

    const rawFileUrl = uploadedFile ? (uploadedFile.path || uploadedFile.secure_url || uploadedFile.url || "") : "";
    const isCloud = rawFileUrl.startsWith("http");
    const fileUrl = isCloud ? rawFileUrl : "";
    const publicId = uploadedFile ? (uploadedFile.filename || uploadedFile.public_id || "") : "";
    const originalFileName = uploadedFile ? (uploadedFile.originalname || "") : "";
    const fileType = uploadedFile ? (uploadedFile.mimetype || "") : "";
    const file = isCloud ? rawFileUrl : (uploadedFile ? uploadedFile.filename : "");

    // Check for existing active submission
    const existingSubmission = await AssignmentSubmission.findOne({
      assignment: assignmentId,
      student: req.user._id,
    });

    if (existingSubmission) {
      if (existingSubmission.status === "graded") {
        return res.status(400).json({
          success: false,
          message: "You have already submitted this assignment and it has been graded.",
        });
      }

      // Update previous ungraded submission
      existingSubmission.answer = answer || existingSubmission.answer;
      if (uploadedFile) {
        existingSubmission.file = file;
        existingSubmission.fileUrl = fileUrl;
        existingSubmission.publicId = publicId;
        existingSubmission.originalFileName = originalFileName;
        existingSubmission.fileType = fileType;
        existingSubmission.fileSize = uploadedFile.size || 0;
      }
      existingSubmission.submittedAt = new Date();
      existingSubmission.status = "submitted";

      await existingSubmission.save();

      return res.status(200).json({
        success: true,
        message: "Assignment submission updated successfully.",
        submission: existingSubmission,
      });
    }

    // Create new submission
    const submission = await AssignmentSubmission.create({
      assignment: assignmentId,
      student: req.user._id,
      answer,
      file,
      fileUrl,
      publicId,
      originalFileName,
      fileType,
      fileSize: uploadedFile ? (uploadedFile.size || 0) : 0,
      status: "submitted",
      submittedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Assignment submitted successfully.",
      submission,
    });
  } catch (error) {
    console.error("Submit assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   GET /api/assignment-submissions/assignment/:assignmentId
// @access  Teacher
const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const teacherIdStr = (assignment.teacher?._id || assignment.teacher || "").toString();
    if (teacherIdStr !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view these submissions.",
      });
    }

    const submissions = await AssignmentSubmission.find({
      assignment: assignmentId,
    })
      .populate("student", "name email")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Get assignment submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   PUT /api/assignment-submissions/:submissionId/grade
// @access  Teacher
const gradeAssignment = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { marks, feedback } = req.body;

    if (marks === undefined || marks === null) {
      return res.status(400).json({
        success: false,
        message: "Marks are required.",
      });
    }

    const submission = await AssignmentSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }

    const assignment = await Assignment.findById(submission.assignment);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const teacherIdStr = (assignment.teacher?._id || assignment.teacher || "").toString();
    if (teacherIdStr !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to grade this submission.",
      });
    }

    const numericMarks = Number(marks);
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > assignment.totalMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${assignment.totalMarks}.`,
      });
    }

    submission.marks = numericMarks;
    submission.feedback = feedback || "";
    submission.status = "graded";

    await submission.save();

    // Create Notification for Student
    try {
      const Notification = require("../models/Notification");
      await Notification.create({
        recipient: submission.student,
        type: "ASSIGNMENT_GRADED",
        title: "Assignment Graded",
        message: `Your assignment submission for "${assignment.title}" has been graded. Awarded: ${numericMarks}/${assignment.totalMarks}`,
        referenceId: submission._id,
        targetRoute: `/student/assignments`,
      });
    } catch (nErr) {
      console.error("Grading notification error:", nErr);
    }

    res.status(200).json({
      success: true,
      message: "Assignment graded successfully.",
      submission,
    });
  } catch (error) {
    console.error("Grade assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   GET /api/assignment-submissions/my
// @access  Student
const getMyAssignmentSubmissions = async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({
      student: req.user._id,
    })
      .populate("assignment", "title description totalMarks dueDate course")
      .populate({ path: "assignment", populate: { path: "course", select: "title subject" } })
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Get my assignment submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   GET /api/assignment-submissions/:submissionId/file
// @access  Student & Teacher & Admin
const getSubmissionFile = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await AssignmentSubmission.findById(submissionId);

    if (!submission || !submission.file) {
      return res.status(404).json({
        success: false,
        message: "Submission deliverable file not found.",
      });
    }

    const assignment = await Assignment.findById(submission.assignment);
    const teacherIdStr = (assignment?.teacher?._id || assignment?.teacher || "").toString();
    const isStudentOwner = submission.student.toString() === req.user._id.toString();
    const isTeacherOwner = teacherIdStr === req.user._id.toString();

    if (!isStudentOwner && !isTeacherOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (submission.fileUrl && submission.fileUrl.startsWith("http")) {
      return res.redirect(submission.fileUrl);
    }
    if (submission.file && submission.file.startsWith("http")) {
      return res.redirect(submission.file);
    }

    const filePath = path.join(__dirname, "../uploads/submissions", submission.file);
    if (submission.fileType) {
      res.setHeader("Content-Type", submission.fileType);
    }
    res.setHeader("Content-Disposition", `inline; filename="${submission.originalFileName || submission.file}"`);

    res.sendFile(filePath, (error) => {
      if (error && !res.headersSent) {
        return res.status(404).json({
          success: false,
          message: "File not found on server.",
        });
      }
    });
  } catch (error) {
    console.error("Get submission file error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

module.exports = {
  submitAssignment,
  getAssignmentSubmissions,
  gradeAssignment,
  getMyAssignmentSubmissions,
  getSubmissionFile,
};
