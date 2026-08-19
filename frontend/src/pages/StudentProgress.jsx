import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import MobileWebBottomNav from "../components/MobileWebBottomNav";
import { BookOpen, CheckSquare, Award, TrendingUp } from "lucide-react";
import "./Dashboard.css";

const StudentProgress = () => {
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [quizResults, setQuizResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProgressData = async () => {
      setLoading(true);
      setError("");
      try {
        const [cRes, sRes, qRes] = await Promise.all([
          api.get("/courses/enrolled"),
          api.get("/assignment-submissions/my"),
          api.get("/quizzes/results/my"),
        ]);

        setCourses(cRes.data.courses || []);
        setSubmissions(sRes.data.submissions || []);
        setQuizResults(qRes.data.results || []);
      } catch (err) {
        console.error("Progress fetch error:", err);
        setError("Failed to calculate progress data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  const totalScoreSum = quizResults.reduce((acc, r) => acc + (r.percentage || 0), 0);
  const avgQuizPercentage = quizResults.length > 0 ? (totalScoreSum / quizResults.length).toFixed(1) : 0;
  const gradedAssignments = submissions.filter((s) => s.status === "graded");

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="student" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="My Academic Progress" role="student" />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card">
            <h2>Academic Summary & Progress</h2>
            <p>Calculated directly from your enrolled course statistics, assignment submission records, and quiz evaluations.</p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <LoadingSpinner message="Calculating your progress data..." />
          ) : (
            <>
              {/* REAL Stats */}
              <div className="stats-overview-grid">
                <StatCard
                  title="Courses Enrolled"
                  value={courses.length}
                  subtitle="Active enrollments"
                  icon={BookOpen}
                />
                <StatCard
                  title="Assignments Submitted"
                  value={submissions.length}
                  subtitle={`${gradedAssignments.length} graded`}
                  icon={CheckSquare}
                />
                <StatCard
                  title="Quizzes Attempted"
                  value={quizResults.length}
                  subtitle={`Avg Score: ${avgQuizPercentage}%`}
                  icon={Award}
                />
              </div>

              <div className="dashboard-two-column-grid">
                {/* Quiz Performance Breakdown */}
                <div className="grid-column-left">
                  <section className="dashboard-section-card glass-card">
                    <div className="section-header border-bottom pb-10 mb-14">
                      <h3 className="section-title flex-center-gap">
                        <Award size={18} className="text-primary" /> Quiz Performance Breakdown
                      </h3>
                    </div>

                    {quizResults.length === 0 ? (
                      <EmptyState
                        icon={Award}
                        title="No quiz evaluations yet"
                        description="Complete quizzes to view score breakdowns."
                      />
                    ) : (
                      <div className="progress-cards-vertical-list">
                        {quizResults.map((r) => (
                          <div key={r._id} className="quiz-progress-card glass-card">
                            <h4 className="progress-card-title">{r.quiz?.title || "Quiz Evaluation"}</h4>

                            <div className="quiz-metrics-three-col mt-12">
                              <div className="metric-box">
                                <span className="metric-label">Total Questions</span>
                                <span className="metric-val">{r.totalQuestions}</span>
                              </div>

                              <div className="metric-box">
                                <span className="metric-label">Correct Answers</span>
                                <span className="metric-val">{r.score} / {r.totalQuestions}</span>
                              </div>

                              <div className="metric-box highlighted">
                                <span className="metric-label">Score</span>
                                <span className="metric-val text-primary">{r.percentage}%</span>
                              </div>
                            </div>

                            <div className="score-progress-bar-track mt-12">
                              <div
                                className="score-progress-bar-fill"
                                style={{ width: `${Math.min(Math.max(r.percentage || 0, 0), 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                {/* Assignment Grades List */}
                <div className="grid-column-right">
                  <section className="dashboard-section-card glass-card">
                    <div className="section-header border-bottom pb-10 mb-14">
                      <h3 className="section-title flex-center-gap">
                        <CheckSquare size={18} className="text-accent" /> Assignment Grades
                      </h3>
                    </div>

                    {submissions.length === 0 ? (
                      <EmptyState
                        icon={CheckSquare}
                        title="No assignments submitted"
                        description="Submit course assignments to see grades."
                      />
                    ) : (
                      <div className="progress-cards-vertical-list">
                        {submissions.map((s) => {
                          const isGraded = s.status === "graded";
                          const totalMarks = s.assignment?.totalMarks || 100;
                          const percentage = isGraded
                            ? Math.min(Math.round((s.marks / totalMarks) * 100), 100)
                            : 0;

                          return (
                            <div key={s._id} className="assignment-progress-card glass-card">
                              <div className="flex-between align-start mb-10">
                                <h4 className="progress-card-title">
                                  {s.assignment?.title || "Course Assignment"}
                                </h4>
                                <span
                                  className={`badge ${
                                    isGraded ? "badge-success" : "badge-warning"
                                  }`}
                                >
                                  {isGraded ? "Graded" : "Pending Grade"}
                                </span>
                              </div>

                              <div className="assignment-marks-display-box mt-10">
                                <span className="metric-label">Marks</span>
                                <div className="marks-fraction-large mt-2">
                                  {isGraded ? (
                                    <>
                                      <strong>{s.marks}</strong> / {totalMarks}
                                    </>
                                  ) : (
                                    <span className="text-muted">Pending Evaluation</span>
                                  )}
                                </div>
                              </div>

                              {isGraded && (
                                <div className="score-progress-bar-track mt-12">
                                  <div
                                    className="score-progress-bar-fill accent"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <MobileWebBottomNav />
    </div>
  );
};

export default StudentProgress;
