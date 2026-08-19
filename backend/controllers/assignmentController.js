const Assignment = require("../models/Assignment");
const Course = require("../models/Course");

// @route   POST /api/assignments
// @access  Teacher
const createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, totalMarks, dueDate } = req.body;

    if (!title || !description || !courseId || !totalMarks || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Title, description, course ID, total marks and due date are required.",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const teacherIdStr = (course.teacher?._id || course.teacher || "").toString();
    if (teacherIdStr !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can create assignments only for your own course.",
      });
    }

    const assignment = await Assignment.create({
      title,
      description,
      course: courseId,
      teacher: req.user._id,
      totalMarks,
      dueDate,
      isPublished: true,
    });

    // Notify enrolled students in course
    if (course.enrolledStudents && course.enrolledStudents.length > 0) {
      try {
        const Notification = require("../models/Notification");
        const notifDocs = course.enrolledStudents.map((studentId) => ({
          recipient: studentId,
          type: "NEW_ASSIGNMENT",
          title: "New Assignment Published",
          message: `New assignment published for ${course.title}: "${title}"`,
          referenceId: assignment._id,
          targetRoute: `/student/courses/${courseId}`,
        }));
        await Notification.insertMany(notifDocs);
      } catch (nErr) {
        console.error("Assignment notification error:", nErr);
      }
    }

    res.status(201).json({
      success: true,
      message: "Assignment created successfully.",
      assignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   GET /api/assignments/course/:courseId
// @access  Student & Teacher & Admin
const getCourseAssignments = async (req, res) => {
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

    const query = { course: courseId };
    if (!isCourseOwner && req.user.role !== "admin") {
      query.isPublished = true;
    }

    const assignments = await Assignment.find(query)
      .populate("course", "title subject")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get course assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   GET /api/assignments/teacher
// @access  Teacher
const getTeacherAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacher: req.user._id })
      .populate("course", "title subject")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get teacher assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   PUT /api/assignments/:id/publish
// @access  Teacher
const publishAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);

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
        message: "You can publish only your own assignment.",
      });
    }

    assignment.isPublished = true;
    await assignment.save();

    res.status(200).json({
      success: true,
      message: "Assignment published successfully.",
      assignment,
    });
  } catch (error) {
    console.error("Publish assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

module.exports = {
  createAssignment,
  getCourseAssignments,
  getTeacherAssignments,
  publishAssignment,
};
