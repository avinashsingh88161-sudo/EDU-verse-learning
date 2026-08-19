import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import {
  HelpCircle,
  PlusCircle,
  Trash2,
  Eye,
  Award,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import "./Dashboard.css";

const TeacherQuizzes = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [quizzes, setQuizzes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Quiz Builder Modal State
  const [builderOpen, setBuilderOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDesc, setQuizDesc] = useState("");
  const [passingPercentage, setPassingPercentage] = useState(40);
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: 0, marks: 1 },
  ]);
  const [validationErrors, setValidationErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // View Student Results Modal State
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    fetchMyCourses();
    fetchQuizzes();
  }, [user]);

  const fetchMyCourses = async () => {
    try {
      const res = await api.get("/courses");
      const all = res.data.courses || [];
      const currentUserId = (user?._id || user?.id || "").toString();

      const myC = all.filter((c) => {
        const tId = (c.teacher?._id || c.teacher || "").toString();
        return tId === currentUserId || user?.role === "admin";
      });

      setCourses(myC);
      if (myC.length > 0) {
        setSelectedCourseId(myC[0]._id);
      }
    } catch (err) {
      console.error("Fetch teacher courses error:", err);
      setError("Failed to load courses.");
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/quizzes/teacher");
      setQuizzes(res.data.quizzes || []);
    } catch (err) {
      console.error("Fetch teacher quizzes error:", err);
      // Fallback
      try {
        const res = await api.get("/quizzes");
        const allQ = res.data.quizzes || [];
        const currentUserId = (user?._id || user?.id || "").toString();
        setQuizzes(
          allQ.filter((q) => {
            const tId = (q.teacher?._id || q.teacher || "").toString();
            return tId === currentUserId || user?.role === "admin";
          })
        );
      } catch (e) {
        setError("Failed to load quizzes.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Question Builder Functions
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: "", options: ["", "", "", ""], correctAnswer: 0, marks: 1 },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleQuestionTextChange = (index, text) => {
    const updated = [...questions];
    updated[index].question = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, text) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = text;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex, correctIdx) => {
    const updated = [...questions];
    updated[qIndex].correctAnswer = Number(correctIdx);
    setQuestions(updated);
  };

  const handleMarksChange = (qIndex, marks) => {
    const updated = [...questions];
    updated[qIndex].marks = Math.max(1, Number(marks) || 1);
    setQuestions(updated);
  };

  // Calculations
  const calculatedTotalMarks = questions.reduce(
    (sum, q) => sum + (Number(q.marks) || 1),
    0
  );

  const validateForm = () => {
    const errors = {};
    if (!selectedCourseId) errors.courseId = "Please select a target course.";
    if (!quizTitle.trim()) errors.title = "Quiz title is required.";

    const qErrors = [];
    questions.forEach((q, idx) => {
      const err = {};
      if (!q.question.trim()) err.question = "Question text is required.";
      const optErrs = [];
      q.options.forEach((opt, oIdx) => {
        if (!opt || !opt.toString().trim()) {
          optErrs[oIdx] = `Option ${String.fromCharCode(65 + oIdx)} is required.`;
        }
      });
      if (optErrs.length > 0) err.options = optErrs;
      if (q.correctAnswer === undefined || q.correctAnswer === null) {
        err.correctAnswer = "Please select the correct answer option.";
      }
      if (Object.keys(err).length > 0) qErrors[idx] = err;
    });

    if (qErrors.length > 0) errors.questions = qErrors;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveQuiz = async (shouldPublish) => {
    if (!validateForm()) {
      setError("Please fix the validation errors in the builder before saving.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      await api.post("/quizzes", {
        title: quizTitle,
        description: quizDesc,
        courseId: selectedCourseId,
        questions,
        passingPercentage: Number(passingPercentage) || 40,
        isPublished: shouldPublish,
      });

      setSuccessMsg(
        `Quiz successfully ${shouldPublish ? "published" : "saved as draft"}!`
      );
      setBuilderOpen(false);
      resetBuilder();
      fetchQuizzes();
    } catch (err) {
      console.error("Save quiz error:", err);
      setError(err.response?.data?.message || "Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  };

  const resetBuilder = () => {
    setQuizTitle("");
    setQuizDesc("");
    setPassingPercentage(40);
    setQuestions([
      { question: "", options: ["", "", "", ""], correctAnswer: 0, marks: 1 },
    ]);
    setValidationErrors({});
  };

  const handleTogglePublishStatus = async (quizId) => {
    try {
      const res = await api.put(`/quizzes/${quizId}/publish`);
      setSuccessMsg(res.data.message || "Quiz status updated.");
      fetchQuizzes();
    } catch (err) {
      console.error("Toggle publish error:", err);
      setError(err.response?.data?.message || "Failed to update quiz status.");
    }
  };

  const openResultsModal = async (quiz) => {
    setSelectedQuiz(quiz);
    setResultsModalOpen(true);
    setLoadingResults(true);
    try {
      const res = await api.get(`/quizzes/${quiz._id}/results`);
      setQuizResults(res.data.results || []);
    } catch (err) {
      console.error("Fetch quiz results error:", err);
      setQuizResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="teacher" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Faculty Quiz Builder" role="teacher" />

        <main className="dashboard-content-body">
          {/* Header Card */}
          <div className="page-header-card glass-card flex-between">
            <div>
              <h2>Create Quiz</h2>
              <p>Create and publish an assessment for your students.</p>
            </div>
            {courses.length > 0 && (
              <button
                type="button"
                className="primary-action-btn"
                onClick={() => {
                  resetBuilder();
                  setBuilderOpen(true);
                }}
              >
                <PlusCircle size={16} /> Create Quiz
              </button>
            )}
          </div>

          {error && <div className="error-banner">{error}</div>}
          {successMsg && <div className="success-banner">{successMsg}</div>}

          {/* Quizzes List */}
          {loading ? (
            <LoadingSpinner message="Fetching quizzes..." />
          ) : quizzes.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              title="No quizzes created yet"
              description="Click 'Create Quiz' to build your first multiple-choice evaluation."
              actionLabel="Create Quiz"
              onAction={() => {
                resetBuilder();
                setBuilderOpen(true);
              }}
            />
          ) : (
            <div className="quizzes-grid-layout">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="quiz-card glass-card">
                  <div className="quiz-card-top">
                    <span className="subject-chip">
                      {quiz.course?.title || "Course Quiz"}
                    </span>
                    <span
                      className={`badge ${
                        quiz.isPublished ? "badge-success" : "badge-warning"
                      }`}
                    >
                      {quiz.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  <h3 className="quiz-title">{quiz.title}</h3>
                  <p className="quiz-desc">
                    {quiz.description || "Multiple choice assessment evaluation."}
                  </p>

                  <div className="quiz-metrics-row">
                    <span className="metric-pill">
                      <strong>Questions:</strong> {quiz.questions?.length || 0}
                    </span>
                    <span className="metric-pill">
                      <strong>Total Marks:</strong> {quiz.totalMarks || 0}
                    </span>
                    <span className="metric-pill">
                      <strong>Attempts:</strong> {quiz.attemptsCount || 0}
                    </span>
                    <span className="metric-pill">
                      <strong>Avg Score:</strong> {quiz.avgScore || 0}%
                    </span>
                  </div>

                  <div className="quiz-card-footer flex-gap-xs">
                    <button
                      type="button"
                      className="secondary-action-btn sm flex-1"
                      onClick={() => openResultsModal(quiz)}
                    >
                      <Eye size={14} /> View Results
                    </button>
                    <button
                      type="button"
                      className={`secondary-action-btn sm ${
                        quiz.isPublished ? "danger-action-btn" : ""
                      }`}
                      onClick={() => handleTogglePublishStatus(quiz._id)}
                      title={quiz.isPublished ? "Unpublish Quiz" : "Publish Quiz"}
                    >
                      {quiz.isPublished ? (
                        <>
                          <ToggleLeft size={14} /> Unpublish
                        </>
                      ) : (
                        <>
                          <ToggleRight size={14} /> Publish
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quiz Builder Modal */}
          <Modal
            isOpen={builderOpen}
            onClose={() => setBuilderOpen(false)}
            title="Create Quiz"
          >
            <div className="modal-form">
              <p className="modal-subtitle-text">
                Create and publish an assessment for your students.
              </p>

              {/* Top Configuration Form */}
              <div className="form-group">
                <label>Course *</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="course-dropdown full-width"
                  required
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.subject})
                    </option>
                  ))}
                </select>
                {validationErrors.courseId && (
                  <span className="field-error">{validationErrors.courseId}</span>
                )}
              </div>

              <div className="form-group">
                <label>Quiz Title *</label>
                <input
                  type="text"
                  placeholder="Enter quiz title..."
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  required
                />
                {validationErrors.title && (
                  <span className="field-error">{validationErrors.title}</span>
                )}
              </div>

              <div className="form-group">
                <label>Description (Optional Instructions)</label>
                <textarea
                  rows={2}
                  placeholder="Optional quiz instructions for students..."
                  value={quizDesc}
                  onChange={(e) => setQuizDesc(e.target.value)}
                />
              </div>

              {/* Quiz Settings Summary Row */}
              <div className="quiz-settings-grid">
                <div className="setting-box">
                  <span className="setting-label">Total Questions</span>
                  <span className="setting-val">{questions.length}</span>
                </div>
                <div className="setting-box">
                  <span className="setting-label">Total Marks</span>
                  <span className="setting-val">{calculatedTotalMarks}</span>
                </div>
                <div className="setting-box input-box">
                  <span className="setting-label">Passing Percentage (%)</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={passingPercentage}
                    onChange={(e) => setPassingPercentage(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-section-divider" />

              {/* Question Builder */}
              <div className="questions-builder-container">
                <h3 className="builder-section-title">Question Builder</h3>

                {questions.map((q, qIdx) => {
                  const qErr =
                    validationErrors.questions && validationErrors.questions[qIdx];

                  return (
                    <div key={qIdx} className="question-card-builder glass-card">
                      <div className="question-card-header flex-between">
                        <span className="question-card-number">
                          Question {qIdx + 1}
                        </span>
                        <div className="flex-center-gap">
                          <div className="marks-input-wrap">
                            <label>Marks:</label>
                            <input
                              type="number"
                              min={1}
                              value={q.marks}
                              onChange={(e) =>
                                handleMarksChange(qIdx, e.target.value)
                              }
                            />
                          </div>

                          {questions.length > 1 && (
                            <button
                              type="button"
                              className="danger-action-btn sm"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              title="Delete Question"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="form-group mt-10">
                        <label>Question Text *</label>
                        <input
                          type="text"
                          placeholder="What is JavaScript?"
                          value={q.question}
                          onChange={(e) =>
                            handleQuestionTextChange(qIdx, e.target.value)
                          }
                          required
                        />
                        {qErr?.question && (
                          <span className="field-error">{qErr.question}</span>
                        )}
                      </div>

                      {/* Options Vertical List */}
                      <div className="options-vertical-list">
                        <label className="options-list-label">Options * (Select correct radio)</label>
                        {q.options.map((opt, oIdx) => {
                          const optionLetter = String.fromCharCode(65 + oIdx);
                          const isCorrect = q.correctAnswer === oIdx;

                          return (
                            <div
                              key={oIdx}
                              className={`option-builder-row ${
                                isCorrect ? "correct-selected" : ""
                              }`}
                            >
                              <span className="option-letter-badge">
                                {optionLetter}
                              </span>
                              <input
                                type="text"
                                placeholder={`Option ${optionLetter} text...`}
                                value={opt}
                                onChange={(e) =>
                                  handleOptionChange(qIdx, oIdx, e.target.value)
                                }
                                required
                              />
                              <label className="radio-select-label">
                                <input
                                  type="radio"
                                  name={`correct-ans-${qIdx}`}
                                  checked={isCorrect}
                                  onChange={() =>
                                    handleCorrectAnswerChange(qIdx, oIdx)
                                  }
                                />
                                <span>Correct</span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="secondary-action-btn full-width mt-10"
                  onClick={handleAddQuestion}
                >
                  <PlusCircle size={16} /> Add Question
                </button>
              </div>

              {/* Action Buttons */}
              <div className="builder-actions-row flex-gap-xs mt-20">
                <button
                  type="button"
                  className="secondary-action-btn flex-1"
                  disabled={saving}
                  onClick={() => handleSaveQuiz(false)}
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="button"
                  className="primary-action-btn flex-1"
                  disabled={saving}
                  onClick={() => handleSaveQuiz(true)}
                >
                  {saving ? "Publishing..." : "Publish Quiz"}
                </button>
              </div>
            </div>
          </Modal>

          {/* View Student Results Modal */}
          <Modal
            isOpen={resultsModalOpen}
            onClose={() => setResultsModalOpen(false)}
            title={`Quiz Evaluation Results: ${selectedQuiz?.title || ""}`}
          >
            {loadingResults ? (
              <LoadingSpinner message="Fetching student evaluation scores..." />
            ) : quizResults.length === 0 ? (
              <EmptyState
                icon={Award}
                title="No student attempts recorded"
                description="No students have submitted evaluations for this quiz so far."
              />
            ) : (
              <div className="dashboard-section-card glass-card overflow-x-auto">
                <table className="admin-data-table compact">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Student Email</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Correct</th>
                      <th>Incorrect</th>
                      <th>Attempted</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizResults.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <strong>{r.student?.name || "Student"}</strong>
                        </td>
                        <td>{r.student?.email}</td>
                        <td>
                          {r.score} / {r.totalQuestions}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              r.percentage >= 50 ? "badge-success" : "badge-rose"
                            }`}
                          >
                            {r.percentage}%
                          </span>
                        </td>
                        <td>{r.correct}</td>
                        <td>{r.incorrect}</td>
                        <td>{r.attempted}</td>
                        <td>
                          {r.submittedAt
                            ? new Date(r.submittedAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default TeacherQuizzes;
