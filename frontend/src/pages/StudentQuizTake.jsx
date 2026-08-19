import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  AlertTriangle,
  User,
  BookOpen,
} from "lucide-react";
import "./Dashboard.css";

const StudentQuizTake = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const quizRes = await api.get(`/quizzes/student/${quizId}`);
        const currentQuiz = quizRes.data.quiz;
        setQuiz(currentQuiz);

        // Check if student already attempted quiz
        const resultsRes = await api.get("/quizzes/results/my");
        const existingResult = (resultsRes.data.results || []).find(
          (r) => (r.quiz?._id || r.quiz) === quizId
        );

        if (existingResult) {
          const totalQ = existingResult.totalQuestions || currentQuiz?.questions?.length || 0;
          const score = existingResult.score || 0;
          const correct = score;
          const incorrect = Math.max(0, totalQ - score);

          const detailedResults = currentQuiz?.questions
            ? currentQuiz.questions.map((q, idx) => {
                const studentAnsObj = existingResult.answers?.find(
                  (a) => a.questionIndex === idx
                );
                const selectedIdx = studentAnsObj ? studentAnsObj.selectedAnswer : null;
                const selectedText =
                  selectedIdx !== null && selectedIdx !== undefined
                    ? q.options[selectedIdx]
                    : "Not Answered";
                return {
                  questionIndex: idx,
                  question: q.question,
                  selectedAnswer: selectedText,
                  isCorrect: selectedIdx !== null,
                };
              })
            : null;

          setResultData({
            score,
            totalQuestions: totalQ,
            percentage: existingResult.percentage,
            correct,
            incorrect,
            attempted: totalQ,
            passed: existingResult.percentage >= (currentQuiz?.passingPercentage || 40),
            alreadySubmitted: true,
            details: detailedResults,
          });
        }
      } catch (err) {
        console.error("Fetch quiz error:", err);
        setError(err.response?.data?.message || "Quiz not found or not available.");
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizDetails();
    }
  }, [quizId]);

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const confirmAndSubmitQuiz = async () => {
    if (!quiz) return;

    setConfirmModalOpen(false);
    setSubmitting(true);
    setError("");

    const formattedAnswers = quiz.questions.map((_, index) => ({
      questionIndex: index,
      selectedAnswer: answers[index] !== undefined ? answers[index] : null,
    }));

    try {
      const res = await api.post(`/quizzes/${quizId}/submit`, {
        answers: formattedAnswers,
      });

      const resObj = res.data.result;
      const totalQ = resObj.totalQuestions || quiz.questions.length;
      const score = resObj.score || 0;

      setResultData({
        ...resObj,
        correct: score,
        incorrect: Math.max(0, totalQ - score),
        attempted: totalQ,
      });
    } catch (err) {
      console.error("Submit quiz error:", err);
      setError(err.response?.data?.message || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout-container">
        <Sidebar role="student" />
        <div className="dashboard-main-wrapper">
          <Topbar pageTitle="Quiz Evaluation" role="student" />
          <main className="dashboard-content-body">
            <LoadingSpinner message="Preparing quiz questions..." />
          </main>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="dashboard-layout-container">
        <Sidebar role="student" />
        <div className="dashboard-main-wrapper">
          <Topbar pageTitle="Quiz Evaluation" role="student" />
          <main className="dashboard-content-body">
            <EmptyState
              icon={HelpCircle}
              title="Quiz Unavailable"
              description={error || "The requested quiz could not be loaded."}
              actionLabel="Back to Quizzes"
              onAction={() => navigate("/student/quizzes")}
            />
          </main>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQIndex];
  const totalQuestionsCount = quiz.questions.length;

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="student" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle={quiz.title} role="student" />

        <main className="dashboard-content-body">
          <div className="flex-between align-center mb-10">
            <button
              type="button"
              className="secondary-action-btn sm"
              onClick={() => navigate("/student/quizzes")}
            >
              <ArrowLeft size={14} /> Back to Quizzes
            </button>
            <span className="subject-chip">{quiz.course?.title || "Course Evaluation"}</span>
          </div>

          {/* Result Overview View */}
          {resultData ? (
            <div className="quiz-result-container glass-card">
              <div className="result-banner">
                <div className="brand-logo-glow mb-4">
                  <Award size={28} />
                </div>
                <h2>Quiz Result Overview</h2>
                <p>
                  {resultData.alreadySubmitted
                    ? "You have completed this quiz evaluation."
                    : "Your answers have been evaluated and recorded."}
                </p>
              </div>

              <div className="result-score-card">
                <div className="score-metric">
                  <span className="label">Final Score</span>
                  <span className="value">
                    {resultData.score} / {resultData.totalQuestions}
                  </span>
                </div>
                <div className="score-metric">
                  <span className="label">Percentage</span>
                  <span className="value">{resultData.percentage}%</span>
                </div>
                <div className="score-metric">
                  <span className="label">Correct Answers</span>
                  <span className="value text-emerald">{resultData.correct}</span>
                </div>
                <div className="score-metric">
                  <span className="label">Incorrect Answers</span>
                  <span className="value text-rose">{resultData.incorrect}</span>
                </div>
                <div className="score-metric">
                  <span className="label">Total Attempted</span>
                  <span className="value">{resultData.attempted}</span>
                </div>
                <div className="score-metric">
                  <span className="label">Evaluation Status</span>
                  <span
                    className={`value ${
                      resultData.passed ? "text-emerald" : "text-rose"
                    }`}
                  >
                    {resultData.passed ? "PASSED" : "FAILED"}
                  </span>
                </div>
              </div>

              {resultData.details && resultData.details.length > 0 && (
                <div className="detailed-breakdown">
                  <h3>Question & Answer Review</h3>
                  {resultData.details.map((item, idx) => (
                    <div
                      key={idx}
                      className={`breakdown-item ${
                        item.isCorrect ? "correct" : "wrong"
                      }`}
                    >
                      <div className="item-header">
                        {item.isCorrect ? (
                          <CheckCircle2 size={20} className="text-emerald" />
                        ) : (
                          <XCircle size={20} className="text-rose" />
                        )}
                        <strong>
                          Question {idx + 1}: {item.question}
                        </strong>
                      </div>

                      <div className="item-answers">
                        <div>
                          Your Answer: <span>{item.selectedAnswer || "Not Answered"}</span>
                        </div>
                        {!item.isCorrect && item.correctAnswer && (
                          <div>
                            Correct Answer:{" "}
                            <span className="text-emerald">{item.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Active Quiz Form */
            <div className="quiz-active-wrapper">
              <div className="page-header-card glass-card">
                <h2>{quiz.title}</h2>
                <div className="quiz-meta-info-row">
                  <span className="meta-item flex-center-gap">
                    <BookOpen size={14} /> Course: <strong>{quiz.course?.title}</strong>
                  </span>
                  <span className="meta-item flex-center-gap">
                    <User size={14} /> Instructor: <strong>{quiz.teacher?.name || "Faculty Member"}</strong>
                  </span>
                  <span className="meta-item flex-center-gap">
                    <HelpCircle size={14} /> Questions: <strong>{totalQuestionsCount}</strong>
                  </span>
                  <span className="meta-item flex-center-gap">
                    <Award size={14} /> Total Marks: <strong>{quiz.totalMarks || totalQuestionsCount}</strong>
                  </span>
                </div>
                <p className="quiz-instructions-text">{quiz.description || "Read questions carefully before submitting."}</p>
              </div>

              {error && <div className="error-banner mt-10">{error}</div>}

              {/* Single / Paginated Question Card */}
              <div className="question-card glass-card mt-20">
                <div className="flex-between align-center mb-10">
                  <span className="question-index-badge">
                    Question {currentQIndex + 1} of {totalQuestionsCount}
                  </span>
                  <span className="question-marks-tag">
                    {currentQuestion?.marks || 1} Mark{(currentQuestion?.marks || 1) !== 1 ? "s" : ""}
                  </span>
                </div>

                <h3 className="question-text">{currentQuestion?.question}</h3>

                <div className="options-list mt-16">
                  {currentQuestion?.options.map((opt, oIdx) => {
                    const isSelected = answers[currentQIndex] === oIdx;
                    const optionLetter = String.fromCharCode(65 + oIdx);

                    return (
                      <div
                        key={oIdx}
                        className={`option-box ${isSelected ? "selected" : ""}`}
                        onClick={() => handleOptionSelect(currentQIndex, oIdx)}
                      >
                        <span className="option-letter-badge">{optionLetter}</span>
                        <input
                          type="radio"
                          name={`question-${currentQIndex}`}
                          checked={isSelected}
                          onChange={() => handleOptionSelect(currentQIndex, oIdx)}
                        />
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                <div className="flex-between align-center mt-20 pt-10 border-top">
                  <button
                    type="button"
                    className="secondary-action-btn"
                    disabled={currentQIndex === 0}
                    onClick={() => setCurrentQIndex((prev) => prev - 1)}
                  >
                    <ArrowLeft size={14} /> Previous
                  </button>

                  {currentQIndex < totalQuestionsCount - 1 ? (
                    <button
                      type="button"
                      className="primary-action-btn"
                      onClick={() => setCurrentQIndex((prev) => prev + 1)}
                    >
                      Next Question <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="primary-action-btn"
                      disabled={submitting}
                      onClick={() => setConfirmModalOpen(true)}
                    >
                      {submitting ? "Evaluating..." : "Submit Quiz"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submission Confirmation Modal */}
          {confirmModalOpen && (
            <Modal
              isOpen={confirmModalOpen}
              onClose={() => setConfirmModalOpen(false)}
              title="Confirm Quiz Submission"
            >
              <div className="confirm-modal-body">
                <AlertTriangle size={36} className="text-warning mb-10" />
                <h3>Ready to submit your quiz?</h3>
                <p>
                  You are about to submit your quiz. You cannot change your answers after submission.
                </p>
                <div className="flex-gap-xs mt-20">
                  <button
                    type="button"
                    className="secondary-action-btn flex-1"
                    onClick={() => setConfirmModalOpen(false)}
                  >
                    Continue Quiz
                  </button>
                  <button
                    type="button"
                    className="primary-action-btn flex-1"
                    onClick={confirmAndSubmitQuiz}
                  >
                    Submit Answers
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentQuizTake;
