const Course = require("../models/Course");
const Note = require("../models/Note");
const Quiz = require("../models/Quiz");
const Assignment = require("../models/Assignment");

// @route   GET /api/search?q=query
// @access  Private
const searchAcademicContent = async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.trim() : "";

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        count: 0,
        results: [],
      });
    }

    const regex = new RegExp(q, "i");

    // Search Courses
    const courses = await Course.find({
      isPublished: true,
      $or: [{ title: regex }, { subject: regex }, { description: regex }],
    })
      .select("title subject description")
      .limit(5);

    // Search Notes
    const notes = await Note.find({
      title: regex,
    })
      .populate("course", "title subject")
      .select("title description course createdAt")
      .limit(5);

    // Search Assignments
    const assignments = await Assignment.find({
      isPublished: true,
      title: regex,
    })
      .populate("course", "title subject")
      .select("title description course dueDate totalMarks")
      .limit(5);

    // Search Quizzes
    const quizzes = await Quiz.find({
      isPublished: true,
      title: regex,
    })
      .populate("course", "title subject")
      .select("title description course totalMarks")
      .limit(5);

    const formattedResults = [];

    courses.forEach((c) => {
      formattedResults.push({
        id: c._id,
        type: "course",
        title: c.title,
        subtitle: `Subject: ${c.subject || "General"}`,
        targetRoute: `/student/courses/${c._id}`,
      });
    });

    notes.forEach((n) => {
      formattedResults.push({
        id: n._id,
        type: "note",
        title: n.title,
        subtitle: n.course?.title ? `Course: ${n.course.title}` : "Lecture Note",
        targetRoute: `/student/courses/${n.course?._id || n.course}`,
      });
    });

    assignments.forEach((a) => {
      formattedResults.push({
        id: a._id,
        type: "assignment",
        title: a.title,
        subtitle: a.course?.title ? `Course: ${a.course.title}` : "Assignment Task",
        targetRoute: `/student/courses/${a.course?._id || a.course}`,
      });
    });

    quizzes.forEach((qItem) => {
      formattedResults.push({
        id: qItem._id,
        type: "quiz",
        title: qItem.title,
        subtitle: qItem.course?.title ? `Course: ${qItem.course.title}` : "Quiz Evaluation",
        targetRoute: `/student/quizzes`,
      });
    });

    res.status(200).json({
      success: true,
      count: formattedResults.length,
      results: formattedResults,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform academic search.",
      error: error.message,
    });
  }
};

module.exports = {
  searchAcademicContent,
};
