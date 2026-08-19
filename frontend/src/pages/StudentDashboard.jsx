import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import WeeklyChart from "../components/WeeklyChart";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import {
  BookOpen,
  HelpCircle,
  CheckSquare,
  Award,
  ArrowRight,
  PlusCircle,
  FileText,
  Sparkles,
} from "lucide-react";
import MobileWebBottomNav from "../components/MobileWebBottomNav";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const [coursesRes, quizzesRes, resultsRes, subsRes] = await Promise.allSettled([
          api.get("/courses/enrolled"),
          api.get("/quizzes/student"),
          api.get("/quizzes/results/my"),
          api.get("/assignment-submissions/my"),
        ]);

        if (coursesRes.status === "fulfilled") {
          setEnrolledCourses(coursesRes.value.data.courses || []);
        }
        if (quizzesRes.status === "fulfilled") {
          setQuizzes(quizzesRes.value.data.quizzes || []);
        }
        if (resultsRes.status === "fulfilled") {
          setQuizResults(resultsRes.value.data.results || []);
        }
        if (subsRes.status === "fulfilled") {
          setSubmissions(subsRes.value.data.submissions || []);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="student" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Student Dashboard" role="student" />

        <main className="dashboard-content-body">
          {/* Header Banner */}
          <div className="welcome-banner-card glass-card">
            <div className="welcome-banner-content">
              <span className="welcome-eyebrow">
                <Sparkles size={13} /> Student Academic Portal
              </span>
              <h1 className="welcome-title">
                Welcome back, {user?.name || "Student"}
              </h1>
              <p className="welcome-subtitle">
                Track your active courses, review study notes, attempt quizzes, and submit academic assignments.
              </p>

              <div className="welcome-cta-group">
                <button
                  type="button"
                  className="primary-action-btn"
                  onClick={() => navigate("/student/my-courses")}
                >
                  <BookOpen size={16} /> My Enrolled Courses
                </button>
                <button
                  type="button"
                  className="secondary-action-btn"
                  onClick={() => navigate("/student/courses")}
                >
                  <PlusCircle size={16} /> Explore Catalog
                </button>
              </div>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {/* REAL Backend Stats Grid */}
          <div className="stats-overview-grid">
            <StatCard
              title="Enrolled Courses"
              value={loading ? "..." : enrolledCourses.length}
              subtitle="Registered modules"
              icon={BookOpen}
              colorTheme="indigo"
              trend="Active"
              trendType="up"
            />
            <StatCard
              title="Available Quizzes"
              value={loading ? "..." : quizzes.length}
              subtitle="Published tests"
              icon={HelpCircle}
              colorTheme="cyan"
              trend="Ready"
              trendType="up"
            />
            <StatCard
              title="Quizzes Attempted"
              value={loading ? "..." : quizResults.length}
              subtitle="Completed evaluations"
              icon={Award}
              colorTheme="emerald"
              trend="Evaluated"
              trendType="up"
            />
            <StatCard
              title="Assignments Submitted"
              value={loading ? "..." : submissions.length}
              subtitle="Deliverables posted"
              icon={CheckSquare}
              colorTheme="amber"
              trend="Up to date"
              trendType="up"
            />
          </div>

          {/* Enrolled Courses & Learning Analytics */}
          <div className="dashboard-two-column-grid">
            <div className="grid-column-left">
              <section className="dashboard-section-card glass-card">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Enrolled Courses</h2>
                    <p className="section-subtitle">Your active academic courses</p>
                  </div>
                  <button
                    type="button"
                    className="view-all-btn"
                    onClick={() => navigate("/student/my-courses")}
                  >
                    View All <ArrowRight size={14} />
                  </button>
                </div>

                {loading ? (
                  <LoadingSpinner message="Fetching enrolled courses..." />
                ) : enrolledCourses.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title="No courses enrolled yet"
                    description="Explore available courses to start learning."
                    actionLabel="Explore Courses"
                    onAction={() => navigate("/student/courses")}
                  />
                ) : (
                  <div className="course-cards-list">
                    {enrolledCourses.slice(0, 4).map((course) => {
                      // Calculate real progress for this course from quiz evaluations
                      const courseQuizzes = quizzes.filter(
                        (q) => (q.course?._id || q.course) === course._id
                      );
                      const courseAttempts = quizResults.filter(
                        (r) => (r.quiz?.course?._id || r.quiz?.course || r.quiz) === course._id
                      );
                      const progressPct =
                        courseQuizzes.length > 0
                          ? Math.min(
                              Math.round(
                                (courseAttempts.length / courseQuizzes.length) * 100
                              ),
                              100
                            )
                          : 0;

                      return (
                        <div key={course._id} className="dashboard-course-item glass-card">
                          <div className="course-details-body">
                            <span className="subject-chip">{course.subject || "General"}</span>
                            <h3 className="course-card-title">{course.title}</h3>
                            <p className="course-card-desc">{course.description}</p>
                            
                            <div className="course-progress-bar-wrap">
                              <div className="progress-label-row">
                                <span>Quiz Evaluation Progress</span>
                                <span>{progressPct}%</span>
                              </div>
                              <div className="progress-track">
                                <div
                                  className="progress-fill"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="primary-action-btn sm"
                            onClick={() => navigate(`/student/courses/${course._id}`)}
                          >
                            Open Course <ArrowRight size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Learning Analytics Graph with REAL data */}
              <WeeklyChart quizResults={quizResults} submissions={submissions} />
            </div>

            {/* Right Column: Quizzes & Quick Notes */}
            <div className="grid-column-right">
              <div className="dashboard-side-card glass-card">
                <div className="side-card-header">
                  <div className="side-card-title">
                    <HelpCircle size={18} className="text-gradient-accent" />
                    <span>Available Quizzes</span>
                  </div>
                  <button
                    type="button"
                    className="view-all-btn"
                    onClick={() => navigate("/student/quizzes")}
                  >
                    View All <ArrowRight size={14} />
                  </button>
                </div>

                {loading ? (
                  <LoadingSpinner message="Loading quizzes..." />
                ) : quizzes.length === 0 ? (
                  <EmptyState
                    icon={HelpCircle}
                    title="No quizzes available"
                    description="No published quizzes at present."
                  />
                ) : (
                  <div className="side-list">
                    {quizzes.slice(0, 3).map((quiz) => (
                      <div key={quiz._id} className="side-item">
                        <div className="side-item-content">
                          <h4>{quiz.title}</h4>
                          <span className="side-item-sub">
                            {quiz.course?.title || "Course Quiz"}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="secondary-action-btn sm"
                          onClick={() => navigate(`/student/quizzes/${quiz._id}`)}
                        >
                          Start Test
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Tile Panel */}
              <div className="dashboard-side-card glass-card">
                <div className="side-card-header">
                  <div className="side-card-title">
                    <FileText size={18} className="text-gradient-primary" />
                    <span>Quick Access</span>
                  </div>
                </div>

                <div className="quick-actions-column">
                  <button
                    type="button"
                    className="quick-action-tile-btn"
                    onClick={() => navigate("/student/notes")}
                  >
                    <FileText size={20} className="text-primary" />
                    <div>
                      <strong>Lecture Notes & Docs</strong>
                      <p>Study PDFs and course materials</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="quick-action-tile-btn"
                    onClick={() => navigate("/student/assignments")}
                  >
                    <CheckSquare size={20} className="text-emerald" />
                    <div>
                      <strong>Pending Assignments</strong>
                      <p>View deliverables and due dates</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <MobileWebBottomNav />
    </div>
  );
};

export default StudentDashboard;
