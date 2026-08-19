const User = require("../models/User");
const Course = require("../models/Course");
const Note = require("../models/Note");
const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const TeacherRegistrationRequest = require("../models/TeacherRegistrationRequest");
const Notification = require("../models/Notification");

// @route   GET /api/admin/dashboard
// @access  Admin
const getAdminDashboard = async (req, res) => {
  try {
    const [
      teachersCount,
      studentsCount,
      coursesCount,
      quizzesCount,
      assignmentsCount,
      quizAttemptsCount,
      submissionsCount,
      recentTeachers,
      recentStudents,
      recentCourses,
      recentQuizAttempts,
      recentSubmissions,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ["teacher", "faculty"] } }),
      User.countDocuments({ role: "student" }),
      Course.countDocuments(),
      Quiz.countDocuments(),
      Assignment.countDocuments(),
      QuizResult.countDocuments(),
      AssignmentSubmission.countDocuments(),
      User.find({ role: { $in: ["teacher", "faculty"] } })
        .select("-password")
        .sort({ createdAt: -1 })
        .limit(5),
      User.find({ role: "student" })
        .select("-password")
        .sort({ createdAt: -1 })
        .limit(5),
      Course.find()
        .populate("teacher", "name email")
        .sort({ createdAt: -1 })
        .limit(5),
      QuizResult.find()
        .populate("student", "name email")
        .populate("quiz", "title")
        .populate({ path: "quiz", populate: { path: "course", select: "title" } })
        .sort({ createdAt: -1 })
        .limit(5),
      AssignmentSubmission.find()
        .populate("student", "name email")
        .populate("assignment", "title totalMarks")
        .populate({ path: "assignment", populate: { path: "course", select: "title" } })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        teachersCount,
        studentsCount,
        coursesCount,
        quizzesCount,
        assignmentsCount,
        quizAttemptsCount,
        submissionsCount,
      },
      recent: {
        teachers: recentTeachers,
        students: recentStudents,
        courses: recentCourses,
        quizAttempts: recentQuizAttempts,
        submissions: recentSubmissions,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load Admin HOD dashboard.",
      error: error.message,
    });
  }
};

// @route   GET /api/admin/teachers
// @access  Admin
const getAdminTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: { $in: ["teacher", "faculty"] } })
      .select("-password")
      .sort({ createdAt: -1 });

    const teachersWithMetrics = await Promise.all(
      teachers.map(async (teacher) => {
        const [coursesCount, quizzesCount, assignmentsCount, notesCount] = await Promise.all([
          Course.countDocuments({ teacher: teacher._id }),
          Quiz.countDocuments({ teacher: teacher._id }),
          Assignment.countDocuments({ teacher: teacher._id }),
          Note.countDocuments({ teacher: teacher._id }),
        ]);

        const teacherCourses = await Course.find({ teacher: teacher._id }).select("enrolledStudents");
        const totalEnrolledStudents = teacherCourses.reduce(
          (acc, c) => acc + (c.enrolledStudents?.length || 0),
          0
        );

        return {
          ...teacher.toObject(),
          coursesCount,
          quizzesCount,
          assignmentsCount,
          notesCount,
          totalEnrolledStudents,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: teachersWithMetrics.length,
      teachers: teachersWithMetrics,
    });
  } catch (error) {
    console.error("Admin teachers fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty list.",
      error: error.message,
    });
  }
};

// @route   GET /api/admin/students
// @access  Admin
const getAdminStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    const studentsWithMetrics = await Promise.all(
      students.map(async (student) => {
        const [quizAttemptsCount, submissionsCount] = await Promise.all([
          QuizResult.countDocuments({ student: student._id }),
          AssignmentSubmission.countDocuments({ student: student._id }),
        ]);

        const quizResults = await QuizResult.find({ student: student._id }).select("percentage");
        const avgQuizScore =
          quizResults.length > 0
            ? (quizResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / quizResults.length).toFixed(1)
            : 0;

        return {
          ...student.toObject(),
          enrolledCount: student.enrolledCourses?.length || 0,
          quizAttemptsCount,
          submissionsCount,
          avgQuizScore: Number(avgQuizScore),
        };
      })
    );

    res.status(200).json({
      success: true,
      count: studentsWithMetrics.length,
      students: studentsWithMetrics,
    });
  } catch (error) {
    console.error("Admin students fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student list.",
      error: error.message,
    });
  }
};

// @route   GET /api/admin/courses
// @access  Admin
const getAdminCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("teacher", "name email teacherId subject")
      .sort({ createdAt: -1 });

    const coursesWithMetrics = await Promise.all(
      courses.map(async (course) => {
        const [notesCount, quizzesCount, assignmentsCount] = await Promise.all([
          Note.countDocuments({ course: course._id }),
          Quiz.countDocuments({ course: course._id }),
          Assignment.countDocuments({ course: course._id }),
        ]);

        return {
          ...course.toObject(),
          studentsCount: course.enrolledStudents?.length || 0,
          notesCount,
          quizzesCount,
          assignmentsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: coursesWithMetrics.length,
      courses: coursesWithMetrics,
    });
  } catch (error) {
    console.error("Admin courses fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses.",
      error: error.message,
    });
  }
};

// @route   GET /api/admin/quizzes
// @access  Admin
const getAdminQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate("teacher", "name email")
      .populate("course", "title subject")
      .sort({ createdAt: -1 });

    const quizzesWithMetrics = await Promise.all(
      quizzes.map(async (quiz) => {
        const attemptsCount = await QuizResult.countDocuments({ quiz: quiz._id });
        return {
          ...quiz.toObject(),
          attemptsCount,
          questionsCount: quiz.questions?.length || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: quizzesWithMetrics.length,
      quizzes: quizzesWithMetrics,
    });
  } catch (error) {
    console.error("Admin quizzes fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes.",
      error: error.message,
    });
  }
};

// @route   GET /api/admin/assignments
// @access  Admin
const getAdminAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("teacher", "name email")
      .populate("course", "title subject")
      .sort({ createdAt: -1 });

    const assignmentsWithMetrics = await Promise.all(
      assignments.map(async (assign) => {
        const submissionsCount = await AssignmentSubmission.countDocuments({ assignment: assign._id });
        return {
          ...assign.toObject(),
          submissionsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: assignmentsWithMetrics.length,
      assignments: assignmentsWithMetrics,
    });
  } catch (error) {
    console.error("Admin assignments fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments.",
      error: error.message,
    });
  }
};

// @route   GET /api/admin/results
// @access  Admin
const getAdminResults = async (req, res) => {
  try {
    const [quizResults, assignmentSubmissions] = await Promise.all([
      QuizResult.find()
        .populate("student", "name email")
        .populate("quiz", "title totalMarks")
        .populate({
          path: "quiz",
          populate: [
            { path: "course", select: "title subject" },
            { path: "teacher", select: "name email" },
          ],
        })
        .sort({ createdAt: -1 }),

      AssignmentSubmission.find()
        .populate("student", "name email")
        .populate("assignment", "title totalMarks dueDate")
        .populate({
          path: "assignment",
          populate: [
            { path: "course", select: "title subject" },
            { path: "teacher", select: "name email" },
          ],
        })
        .sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      quizResults,
      assignmentSubmissions,
    });
  } catch (error) {
    console.error("Admin results fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system results.",
      error: error.message,
    });
  }
};

// @route   GET /api/admin/activity
// @access  Admin
const getAdminActivity = async (req, res) => {
  try {
    const [recentUsers, recentCourses, recentQuizResults, recentSubmissions] = await Promise.all([
      User.find().select("name email role createdAt").sort({ createdAt: -1 }).limit(10),
      Course.find().populate("teacher", "name").select("title subject createdAt").sort({ createdAt: -1 }).limit(10),
      QuizResult.find()
        .populate("student", "name")
        .populate("quiz", "title")
        .select("score totalQuestions percentage createdAt")
        .sort({ createdAt: -1 })
        .limit(10),
      AssignmentSubmission.find()
        .populate("student", "name")
        .populate("assignment", "title")
        .select("status marks createdAt")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const activityFeed = [];

    recentUsers.forEach((u) => {
      activityFeed.push({
        id: `user-${u._id}`,
        type: "registration",
        message: `${u.role === "teacher" ? "Faculty" : "Student"} registered: ${u.name} (${u.email})`,
        timestamp: u.createdAt,
      });
    });

    recentCourses.forEach((c) => {
      activityFeed.push({
        id: `course-${c._id}`,
        type: "course",
        message: `New Course Created: "${c.title}" by ${c.teacher?.name || "Faculty"}`,
        timestamp: c.createdAt,
      });
    });

    recentQuizResults.forEach((q) => {
      activityFeed.push({
        id: `quiz-${q._id}`,
        type: "quiz_attempt",
        message: `Quiz Attempted: ${q.student?.name || "Student"} scored ${q.percentage}% on "${q.quiz?.title || "Quiz"}"`,
        timestamp: q.createdAt,
      });
    });

    recentSubmissions.forEach((s) => {
      activityFeed.push({
        id: `sub-${s._id}`,
        type: "assignment_sub",
        message: `Assignment Submitted: ${s.student?.name || "Student"} submitted deliverable for "${s.assignment?.title || "Task"}"`,
        timestamp: s.createdAt,
      });
    });

    activityFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      activities: activityFeed.slice(0, 25),
    });
  } catch (error) {
    console.error("Admin activity fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system activity.",
      error: error.message,
    });
  }
};

// @route   PUT /api/admin/users/:userId/toggle-status
// @access  Admin
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status changed to ${user.isActive ? "Active" : "Inactive"}.`,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change user status.",
      error: error.message,
    });
  }
};

// @route   GET /api/admin/teacher-requests
// @access  Admin
const getTeacherRequests = async (req, res) => {
  try {
    const requests = await TeacherRegistrationRequest.find()
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get teacher requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher registration requests.",
      error: error.message,
    });
  }
};

// @route   PUT /api/admin/teacher-requests/:requestId/approve
// @access  Admin
const approveTeacherRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await TeacherRegistrationRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Teacher registration request not found.",
      });
    }

    if (request.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "This registration request has already been approved.",
      });
    }

    // PART 20: Check if user already exists
    let user = await User.findOne({ email: request.email });

    if (!user) {
      user = await User.create({
        name: request.name,
        email: request.email,
        password: request.password, // already hashed
        role: "teacher",
        subject: request.department || "Computer Science",
        teacherId: request.facultyId || `TCH${Date.now().toString().slice(-4)}`,
        isActive: true,
      });
    } else {
      user.role = "teacher";
      user.isActive = true;
      user.subject = request.department || user.subject || "Computer Science";
      if (!user.teacherId) {
        user.teacherId = request.facultyId || `TCH${Date.now().toString().slice(-4)}`;
      }
      await user.save();
    }

    // Mark request as approved
    request.status = "approved";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Notify Teacher
    await Notification.create({
      recipient: user._id,
      type: "REQUEST_APPROVED",
      title: "Teacher Registration Approved",
      message: "Your teacher registration request has been approved. You can now login to EduVerse.",
      referenceId: request._id,
      targetRoute: "/teacher/dashboard",
    });

    res.status(200).json({
      success: true,
      message: `Teacher ${request.name} approved successfully. Account activated.`,
      teacher: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Approve teacher request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve teacher request.",
      error: error.message,
    });
  }
};

// @route   PUT /api/admin/teacher-requests/:requestId/reject
// @access  Admin
const rejectTeacherRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;

    const request = await TeacherRegistrationRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Teacher registration request not found.",
      });
    }

    if (request.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Cannot reject a registration request that is already approved.",
      });
    }

    request.status = "rejected";
    request.rejectionReason = rejectionReason || "Faculty verification could not be completed.";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: `Teacher registration request for ${request.name} was rejected.`,
      request,
    });
  } catch (error) {
    console.error("Reject teacher request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject teacher request.",
      error: error.message,
    });
  }
};

module.exports = {
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
};

