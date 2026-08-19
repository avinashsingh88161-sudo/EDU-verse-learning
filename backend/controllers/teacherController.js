const Course = require("../models/Course");
const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const User = require("../models/User");

// @route   GET /api/teacher/students
// @access  Teacher
const getTeacherStudents = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Find all courses created by the current teacher
    const teacherCourses = await Course.find({ teacher: teacherId }).populate(
      "enrolledStudents",
      "name email createdAt"
    );

    const teacherCourseIds = teacherCourses.map((c) => c._id);

    // Map unique students
    const studentMap = new Map();

    for (const course of teacherCourses) {
      for (const student of course.enrolledStudents || []) {
        if (!student) continue;
        const sId = student._id.toString();
        if (!studentMap.has(sId)) {
          studentMap.set(sId, {
            _id: student._id,
            name: student.name,
            email: student.email,
            enrollmentDate: student.createdAt,
            courses: [{ _id: course._id, title: course.title }],
          });
        } else {
          // Avoid duplicate course entries
          const existingCourses = studentMap.get(sId).courses;
          if (!existingCourses.some((c) => c._id.toString() === course._id.toString())) {
            existingCourses.push({ _id: course._id, title: course.title });
          }
        }
      }
    }

    const studentsList = Array.from(studentMap.values());

    // Fetch quiz IDs belonging to teacher's courses
    const teacherQuizzes = await Quiz.find({
      course: { $in: teacherCourseIds },
    }).select("_id");
    const teacherQuizIds = teacherQuizzes.map((q) => q._id);

    // Fetch assignment IDs belonging to teacher's courses
    const teacherAssignments = await Assignment.find({
      course: { $in: teacherCourseIds },
    }).select("_id");
    const teacherAssignmentIds = teacherAssignments.map((a) => a._id);

    // Calculate metrics for each student scoped ONLY to current teacher
    const studentsWithMetrics = await Promise.all(
      studentsList.map(async (st) => {
        const [quizResults, submissions] = await Promise.all([
          QuizResult.find({
            student: st._id,
            quiz: { $in: teacherQuizIds },
          }),
          AssignmentSubmission.find({
            student: st._id,
            assignment: { $in: teacherAssignmentIds },
          }),
        ]);

        const quizAttempts = quizResults.length;
        const averageQuizScore =
          quizAttempts > 0
            ? Number(
                (
                  quizResults.reduce((sum, r) => sum + (r.percentage || 0), 0) /
                  quizAttempts
                ).toFixed(1)
              )
            : 0;

        return {
          _id: st._id,
          name: st.name,
          email: st.email,
          courses: st.courses,
          quizAttempts,
          averageQuizScore,
          assignmentSubmissions: submissions.length,
          enrollmentDate: st.enrollmentDate,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: studentsWithMetrics.length,
      students: studentsWithMetrics,
    });
  } catch (error) {
    console.error("Get teacher students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load enrolled students.",
      error: error.message,
    });
  }
};

// @route   GET /api/teacher/students/:studentId
// @access  Teacher
const getTeacherStudentDetails = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { studentId } = req.params;

    // Find courses taught by current teacher
    const teacherCourses = await Course.find({ teacher: teacherId });
    const teacherCourseIds = teacherCourses.map((c) => c._id);

    // Check if student is enrolled in at least one course taught by this teacher
    const enrolledCourses = teacherCourses.filter((course) =>
      course.enrolledStudents.some(
        (stId) => stId.toString() === studentId.toString()
      )
    );

    if (enrolledCourses.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Student is not enrolled in your courses.",
      });
    }

    const student = await User.findById(studentId).select("name email createdAt");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Get quizzes taught by teacher
    const teacherQuizzes = await Quiz.find({
      course: { $in: teacherCourseIds },
    }).populate("course", "title");

    const teacherQuizIds = teacherQuizzes.map((q) => q._id);

    // Get student quiz results for teacher's quizzes
    const quizResults = await QuizResult.find({
      student: studentId,
      quiz: { $in: teacherQuizIds },
    })
      .populate({
        path: "quiz",
        select: "title course",
        populate: { path: "course", select: "title" },
      })
      .sort({ createdAt: -1 });

    const quizPerformance = quizResults.map((qr) => ({
      _id: qr._id,
      quizTitle: qr.quiz?.title || "Quiz",
      courseTitle: qr.quiz?.course?.title || "Course",
      score: qr.score,
      totalQuestions: qr.totalQuestions,
      percentage: qr.percentage,
      attemptDate: qr.createdAt,
    }));

    // Get assignments taught by teacher
    const teacherAssignments = await Assignment.find({
      course: { $in: teacherCourseIds },
    }).populate("course", "title");

    const teacherAssignmentIds = teacherAssignments.map((a) => a._id);

    // Get student assignment submissions for teacher's assignments
    const submissions = await AssignmentSubmission.find({
      student: studentId,
      assignment: { $in: teacherAssignmentIds },
    })
      .populate({
        path: "assignment",
        select: "title totalMarks course",
        populate: { path: "course", select: "title" },
      })
      .sort({ submittedAt: -1 });

    const assignmentsPerformance = submissions.map((sub) => ({
      _id: sub._id,
      assignmentTitle: sub.assignment?.title || "Assignment",
      courseTitle: sub.assignment?.course?.title || "Course",
      submissionDate: sub.submittedAt,
      status: sub.status,
      marks: sub.marks,
      totalMarks: sub.assignment?.totalMarks || 100,
      feedback: sub.feedback || "",
      file: sub.file,
    }));

    res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        createdAt: student.createdAt,
      },
      courses: enrolledCourses.map((c) => ({
        _id: c._id,
        title: c.title,
        subject: c.subject,
      })),
      quizPerformance,
      assignments: assignmentsPerformance,
    });
  } catch (error) {
    console.error("Get student details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load student details.",
      error: error.message,
    });
  }
};

// @route   GET /api/teacher/dashboard-stats
// @access  Teacher
const getTeacherDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Courses created by teacher
    const courses = await Course.find({ teacher: teacherId });
    const courseIds = courses.map((c) => c._id);

    // Unique enrolled students across teacher's courses
    const studentSet = new Set();
    courses.forEach((c) => {
      (c.enrolledStudents || []).forEach((stId) => {
        studentSet.add(stId.toString());
      });
    });

    // Published quizzes created by teacher
    const publishedQuizzesCount = await Quiz.countDocuments({
      teacher: teacherId,
      isPublished: true,
    });

    // Pending assignment submissions (status === "submitted") for teacher's assignments
    const teacherAssignments = await Assignment.find({
      course: { $in: courseIds },
    }).select("_id");
    const teacherAssignmentIds = teacherAssignments.map((a) => a._id);

    const pendingReviewsCount = await AssignmentSubmission.countDocuments({
      assignment: { $in: teacherAssignmentIds },
      status: "submitted",
    });

    res.status(200).json({
      success: true,
      totalCourses: courses.length,
      totalStudents: studentSet.size,
      publishedQuizzes: publishedQuizzesCount,
      pendingAssignmentReviews: pendingReviewsCount,
    });
  } catch (error) {
    console.error("Get teacher dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load teacher stats.",
      error: error.message,
    });
  }
};

module.exports = {
  getTeacherStudents,
  getTeacherStudentDetails,
  getTeacherDashboardStats,
};
