const Quiz = require("../models/Quiz");
const Course = require("../models/Course");
const QuizResult = require("../models/QuizResult");

// @route   POST /api/quizzes
// @access  Teacher
const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      questions,
      passingPercentage,
      isPublished,
    } = req.body;

    if (!title || !courseId || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title, Course ID, and at least one question are required.",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // Only course owner can create quiz
    const teacherIdStr = (course.teacher?._id || course.teacher || "").toString();
    const userIdStr = (req.user._id || req.user.id || "").toString();

    if (teacherIdStr && teacherIdStr !== userIdStr && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can create quizzes only for your own course.",
      });
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.question.trim()) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} text is required.`,
        });
      }
      if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have exactly 4 options.`,
        });
      }
      for (let j = 0; j < 4; j++) {
        if (
          q.options[j] === undefined ||
          q.options[j] === null ||
          !q.options[j].toString().trim()
        ) {
          return res.status(400).json({
            success: false,
            message: `Option ${String.fromCharCode(65 + j)} for Question ${i + 1} cannot be empty.`,
          });
        }
      }
      if (
        q.correctAnswer === undefined ||
        q.correctAnswer === null ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3
      ) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have a valid correct answer selected.`,
        });
      }
    }

    // Calculate total marks
    const totalMarks = questions.reduce(
      (sum, q) => sum + (Number(q.marks) || 1),
      0
    );

    const quiz = await Quiz.create({
      title: title.trim(),
      description: (description || "").trim(),
      course: courseId,
      teacher: req.user._id,
      questions,
      totalMarks,
      passingPercentage: Number(passingPercentage) || 40,
      isPublished: Boolean(isPublished),
    });

    // Notify enrolled students in course if published
    if (quiz.isPublished && course.enrolledStudents && course.enrolledStudents.length > 0) {
      try {
        const Notification = require("../models/Notification");
        const notifDocs = course.enrolledStudents.map((studentId) => ({
          recipient: studentId,
          type: "NEW_QUIZ",
          title: "New Quiz Available",
          message: `New quiz available for ${course.title}: "${quiz.title}"`,
          referenceId: quiz._id,
          targetRoute: `/student/quizzes`,
        }));
        await Notification.insertMany(notifDocs);
      } catch (nErr) {
        console.error("Quiz notification error:", nErr);
      }
    }

    res.status(201).json({
      success: true,
      message: `Quiz ${quiz.isPublished ? "published" : "saved as draft"} successfully.`,
      quiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   GET /api/quizzes
// @access  Public / Authenticated
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate("course", "title subject")
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   GET /api/quizzes/teacher
// @access  Teacher
const getTeacherQuizzes = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const quizzes = await Quiz.find({ teacher: teacherId })
      .populate("course", "title subject")
      .sort({ createdAt: -1 });

    const quizzesWithAnalytics = await Promise.all(
      quizzes.map(async (quiz) => {
        const results = await QuizResult.find({ quiz: quiz._id });
        const attemptsCount = results.length;

        let avgScore = 0;
        let highestScore = 0;
        let lowestScore = 0;

        if (attemptsCount > 0) {
          const percentages = results.map((r) => r.percentage || 0);
          const sum = percentages.reduce((a, b) => a + b, 0);
          avgScore = Number((sum / attemptsCount).toFixed(1));
          highestScore = Math.max(...percentages);
          lowestScore = Math.min(...percentages);
        }

        return {
          ...quiz.toObject(),
          attemptsCount,
          avgScore,
          highestScore,
          lowestScore,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: quizzesWithAnalytics.length,
      quizzes: quizzesWithAnalytics,
    });
  } catch (error) {
    console.error("Get teacher quizzes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load teacher quizzes.",
      error: error.message,
    });
  }
};

// @route   GET /api/quizzes/student
// @access  Student
const getStudentQuizzes = async (req, res) => {
  try {
    // Only return published quizzes for courses that the student is enrolled in
    const enrolledCourses = await Course.find({
      enrolledStudents: req.user._id,
    }).select("_id");

    const courseIds = enrolledCourses.map((c) => c._id);

    const quizzes = await Quiz.find({
      isPublished: true,
      course: { $in: courseIds },
    })
      .select("-questions.correctAnswer")
      .populate("course", "title subject")
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    console.error("Get student quizzes error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   GET /api/quizzes/student/:quizId
// @access  Student
const getStudentQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({
      _id: quizId,
      isPublished: true,
    })
      .select("-questions.correctAnswer")
      .populate("course", "title subject")
      .populate("teacher", "name email");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found or not published.",
      });
    }

    res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   GET /api/quizzes/results/my
// @access  Student
const getMyQuizResults = async (req, res) => {
  try {
    const results = await QuizResult.find({
      student: req.user._id,
    })
      .populate("quiz", "title description totalMarks course passingPercentage")
      .populate({ path: "quiz", populate: { path: "course", select: "title" } })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   GET /api/quizzes/:quizId/results
// @access  Teacher
const getQuizResultsForTeacher = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).populate("course", "title subject");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const teacherIdStr = (quiz.teacher?._id || quiz.teacher || "").toString();
    const userIdStr = (req.user._id || req.user.id || "").toString();

    if (teacherIdStr !== userIdStr && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can view results only for your own quizzes.",
      });
    }

    const results = await QuizResult.find({
      quiz: quizId,
    })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    const formattedResults = results.map((r) => {
      const totalQuestions = r.totalQuestions || quiz.questions?.length || 0;
      const score = r.score || 0;
      const correct = score;
      const incorrect = Math.max(0, totalQuestions - score);

      return {
        _id: r._id,
        quizId: quiz._id,
        quizTitle: quiz.title,
        courseTitle: quiz.course?.title || "N/A",
        studentName: r.student?.name || "Student",
        studentEmail: r.student?.email || "N/A",
        student: r.student,
        score,
        totalQuestions,
        totalMarks: quiz.totalMarks || totalQuestions,
        percentage: r.percentage,
        correct,
        incorrect,
        attempted: totalQuestions,
        attemptDate: r.createdAt,
        submittedAt: r.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedResults.length,
      quizTitle: quiz.title,
      courseTitle: quiz.course?.title || "N/A",
      results: formattedResults,
    });
  } catch (error) {
    console.error("Get quiz results for teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load quiz results.",
      error: error.message,
    });
  }
};

// @route   PUT /api/quizzes/:quizId
// @access  Teacher
const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const teacherIdStr = (quiz.teacher?._id || quiz.teacher || "").toString();
    const userIdStr = (req.user._id || req.user.id || "").toString();

    if (teacherIdStr !== userIdStr && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this quiz.",
      });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully.",
      quiz: updatedQuiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   PUT /api/quizzes/:quizId/publish
// @access  Teacher
const togglePublishQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const teacherIdStr = (quiz.teacher?._id || quiz.teacher || "").toString();
    if (teacherIdStr !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to modify this quiz.",
      });
    }

    quiz.isPublished = !quiz.isPublished;
    await quiz.save();

    res.status(200).json({
      success: true,
      message: `Quiz is now ${quiz.isPublished ? "Published" : "Draft"}.`,
      isPublished: quiz.isPublished,
    });
  } catch (error) {
    console.error("Toggle publish quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// @route   POST /api/quizzes/:quizId/submit
// @access  Student
const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers are required.",
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const existingResult = await QuizResult.findOne({
      quiz: quizId,
      student: req.user._id,
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: "You have already attempted this quiz.",
      });
    }

    if (!quiz.isPublished) {
      return res.status(400).json({
        success: false,
        message: "This quiz is not published.",
      });
    }

    let score = 0;
    const detailedResults = [];

    quiz.questions.forEach((question, index) => {
      const studentAnswer = answers.find(
        (answer) => answer.questionIndex === index
      );

      const selectedAnswer =
        studentAnswer && studentAnswer.selectedAnswer !== undefined
          ? studentAnswer.selectedAnswer
          : null;

      const isCorrect =
        selectedAnswer !== null && selectedAnswer === question.correctAnswer;

      const qMarks = Number(question.marks) || 1;

      if (isCorrect) {
        score += qMarks;
      }

      detailedResults.push({
        questionIndex: index,
        question: question.question,
        selectedAnswer:
          selectedAnswer !== null ? question.options[selectedAnswer] : null,
        correctAnswer: question.options[question.correctAnswer],
        isCorrect,
      });
    });

    const totalQuestions = quiz.questions.length;
    const totalPossibleMarks = quiz.totalMarks || totalQuestions;

    const percentage =
      totalPossibleMarks > 0
        ? Number(((score / totalPossibleMarks) * 100).toFixed(2))
        : 0;

    const result = await QuizResult.create({
      quiz: quiz._id,
      student: req.user._id,
      answers,
      score,
      totalQuestions,
      percentage,
    });

    const passed = percentage >= (quiz.passingPercentage || 40);

    res.status(201).json({
      success: true,
      message: "Quiz submitted successfully.",
      result: {
        id: result._id,
        quiz: quiz._id,
        score,
        totalQuestions,
        percentage,
        passed,
        passingPercentage: quiz.passingPercentage || 40,
        details: detailedResults,
        submittedAt: result.createdAt,
      },
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

module.exports = {
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
};
