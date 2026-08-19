const Course = require("../models/Course");
const QuizResult = require("../models/QuizResult");
const AssignmentSubmission = require("../models/AssignmentSubmission");

// @route   POST /api/courses
// @access  Teacher
const createCourse = async (req, res) => {
  try {
    const { title, description, subject, thumbnail } = req.body;

    if (!title || !description || !subject) {
      return res.status(400).json({
        success: false,
        message: "Title, description and subject are required.",
      });
    }

    const course = await Course.create({
      title,
      description,
      subject,
      thumbnail: thumbnail || "",
      teacher: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully.",
      course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "teacher",
      "name email"
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// @route   PUT /api/courses/:id
// @access  Teacher
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

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
        message: "You can update only your own course.",
      });
    }

    Object.assign(course, req.body);
    await course.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// @route   DELETE /api/courses/:id
// @access  Teacher
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

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
        message: "You can delete only your own course.",
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // Check if student is already enrolled
    const alreadyEnrolled = course.enrolledStudents.some(
      (studentId) => studentId.toString() === req.user._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course.",
      });
    }

    course.enrolledStudents.push(req.user._id);
    await course.save();

    res.status(200).json({
      success: true,
      message: "Enrolled in course successfully.",
      courseId: course._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const getEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      enrolledStudents: req.user._id,
    }).populate("teacher", "name email");

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("GET ENROLLED COURSES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const { getTeacherStudents } = require("./teacherController");

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getEnrolledCourses,
  getTeacherStudents,
};
