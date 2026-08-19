import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { HelpCircle, Award, CheckCircle, ArrowRight } from "lucide-react";
import "./Dashboard.css";

const StudentQuizzes = () => {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState("available");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzesAndResults = async () => {
      setLoading(true);
      setError("");
      try {
        const [qRes, rRes] = await Promise.all([
          api.get("/quizzes/student"),
          api.get("/quizzes/results/my"),
        ]);

        const qList = qRes.data.quizzes || [];
        const rList = rRes.data.results || [];

        setQuizzes(qList);
        setFilteredQuizzes(qList);
        setQuizResults(rList);
      } catch (err) {
        console.error("Quiz fetch error:", err);
        setError("Failed to load quizzes.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzesAndResults();
  }, []);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredQuizzes(quizzes);
    } else {
      const q = query.toLowerCase();
      setFilteredQuizzes(
        quizzes.filter(
          (quiz) =>
            quiz.title?.toLowerCase().includes(q) ||
            quiz.description?.toLowerCase().includes(q) ||
            quiz.course?.title?.toLowerCase().includes(q)
        )
      );
    }
  };

  const attemptedQuizIds = new Set(quizResults.map((r) => r.quiz?._id || r.quiz));

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="student" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Quizzes & Evaluations" role="student" onSearch={handleSearch} />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card">
            <h2>Quizzes & Online Tests</h2>
            <p>Take interactive multiple-choice tests created by your faculty and view instant evaluation results.</p>
          </div>

          <div className="tab-bar">
            <button
              className={`tab-btn ${activeTab === "available" ? "active" : ""}`}
              onClick={() => setActiveTab("available")}
            >
              <HelpCircle size={16} /> Available Quizzes ({quizzes.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "results" ? "active" : ""}`}
              onClick={() => setActiveTab("results")}
            >
              <Award size={16} /> My Quiz Results ({quizResults.length})
            </button>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <LoadingSpinner message="Fetching quizzes..." />
          ) : activeTab === "available" ? (
            filteredQuizzes.length === 0 ? (
              <EmptyState
                icon={HelpCircle}
                title="No quizzes available"
                description="There are currently no published quizzes available."
              />
            ) : (
              <div className="quizzes-grid-layout">
                {filteredQuizzes.map((quiz) => {
                  const isAttempted = attemptedQuizIds.has(quiz._id);
                  const result = quizResults.find(
                    (r) => (r.quiz?._id || r.quiz) === quiz._id
                  );

                  return (
                    <div key={quiz._id} className="quiz-card glass-card">
                      <div className="quiz-card-top">
                        <span className="subject-chip">
                          {quiz.course?.subject || quiz.course?.title || "General"}
                        </span>
                        {isAttempted && (
                          <span className="attempted-badge">
                            <CheckCircle size={12} /> Attempted ({result?.score}/{result?.totalQuestions})
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="quiz-title">{quiz.title}</h3>
                        <p className="quiz-desc">{quiz.description || "Multiple Choice Evaluation"}</p>
                      </div>

                      <div className="quiz-card-footer">
                        {isAttempted ? (
                          <button
                            className="secondary-action-btn sm"
                            onClick={() => navigate(`/student/quizzes/${quiz._id}`)}
                          >
                            View Result <ArrowRight size={14} />
                          </button>
                        ) : (
                          <button
                            className="primary-action-btn sm"
                            onClick={() => navigate(`/student/quizzes/${quiz._id}`)}
                          >
                            Start Quiz <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : quizResults.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No quiz results yet"
              description="Complete a quiz to see your score analysis."
            />
          ) : (
            <div className="quizzes-grid-layout">
              {quizResults.map((result) => (
                <div key={result._id} className="quiz-card glass-card">
                  <div className="quiz-card-top">
                    <span className="subject-chip">Quiz Result</span>
                    <span className="badge badge-success">{result.percentage}%</span>
                  </div>

                  <div>
                    <h3 className="quiz-title">{result.quiz?.title || "Completed Evaluation"}</h3>
                    <p className="quiz-desc">
                      Score: <strong>{result.score} / {result.totalQuestions}</strong> ({result.percentage}%)
                    </p>
                  </div>

                  <div className="quiz-card-footer">
                    <button
                      className="secondary-action-btn sm"
                      onClick={() => navigate(`/student/quizzes/${result.quiz?._id || result.quiz}`)}
                    >
                      View Breakdown <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentQuizzes;
