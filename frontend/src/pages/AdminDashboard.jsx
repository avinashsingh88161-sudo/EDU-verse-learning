import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import MobileWebBottomNav from "../components/MobileWebBottomNav";
import {
  Users,
  GraduationCap,
  BookOpen,
  HelpCircle,
  CheckSquare,
  Award,
  Activity,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import "./Dashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/dashboard");
      setStats(res.data.stats || {});
      setRecent(res.data.recent || {});
    } catch (err) {
      console.error("Fetch admin dashboard error:", err);
      setError("Failed to load HOD administration metrics.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="admin" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="HOD Administration Dashboard" role="admin" />

        <main className="dashboard-content-body">
          {/* Welcome Banner */}
          <div className="welcome-banner-card glass-card teacher-theme">
            <div className="welcome-banner-content">
              <span className="welcome-eyebrow">
                <ShieldCheck size={14} /> Campus Governance & HOD Control
              </span>
              <h1 className="welcome-title">
                Academic Administration Overview
              </h1>
              <p className="welcome-subtitle">
                Monitor campus faculty performance, student enrollment, course catalog, active evaluations, and system activity logs.
              </p>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {/* REAL Database Stats Overview Grid */}
          <div className="stats-overview-grid">
            <StatCard
              title="Total Faculty / Teachers"
              value={loading ? "..." : stats?.teachersCount}
              subtitle="Registered instructors"
              icon={Users}
              colorTheme="indigo"
            />
            <StatCard
              title="Total Students"
              value={loading ? "..." : stats?.studentsCount}
              subtitle="Enrolled learners"
              icon={GraduationCap}
              colorTheme="cyan"
            />
            <StatCard
              title="Active Courses"
              value={loading ? "..." : stats?.coursesCount}
              subtitle="Published modules"
              icon={BookOpen}
              colorTheme="purple"
            />
            <StatCard
              title="Created Quizzes"
              value={loading ? "..." : stats?.quizzesCount}
              subtitle="Online evaluations"
              icon={HelpCircle}
              colorTheme="amber"
            />
            <StatCard
              title="Assignments"
              value={loading ? "..." : stats?.assignmentsCount}
              subtitle="Deliverable tasks"
              icon={CheckSquare}
              colorTheme="rose"
            />
            <StatCard
              title="Quiz Attempts"
              value={loading ? "..." : stats?.quizAttemptsCount}
              subtitle="Student evaluations"
              icon={Award}
              colorTheme="emerald"
            />
          </div>

          {/* Two Column Section */}
          <div className="dashboard-two-column-grid">
            {/* Left Column: Recent Registrations & Courses */}
            <div className="grid-column-left">
              <section className="dashboard-section-card glass-card">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Recent Courses</h2>
                    <p className="section-subtitle">Latest modules published by faculty</p>
                  </div>
                  <button className="view-all-btn" onClick={() => navigate("/admin/courses")}>
                    View All Courses <ArrowRight size={14} />
                  </button>
                </div>

                {loading ? (
                  <LoadingSpinner message="Loading recent courses..." />
                ) : (recent.courses || []).length === 0 ? (
                  <p className="text-muted">No courses found.</p>
                ) : (
                  <div className="side-list">
                    {recent.courses.map((course) => (
                      <div key={course._id} className="side-item">
                        <div className="side-item-content">
                          <h4>{course.title}</h4>
                          <span className="side-item-sub">
                            Subject: {course.subject} | Faculty: {course.teacher?.name || "Unassigned"}
                          </span>
                        </div>
                        <span className="subject-chip">{course.subject}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Recent Quiz Attempts */}
              <section className="dashboard-section-card glass-card">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Recent Quiz Attempts</h2>
                    <p className="section-subtitle">Real-time student attempt evaluation log</p>
                  </div>
                  <button className="view-all-btn" onClick={() => navigate("/admin/results")}>
                    View All Results <ArrowRight size={14} />
                  </button>
                </div>

                {loading ? (
                  <LoadingSpinner message="Loading quiz attempts..." />
                ) : (recent.quizAttempts || []).length === 0 ? (
                  <p className="text-muted">No quiz attempts recorded yet.</p>
                ) : (
                  <div className="side-list">
                    {recent.quizAttempts.map((attempt) => (
                      <div key={attempt._id} className="side-item">
                        <div className="side-item-content">
                          <h4>{attempt.student?.name || "Student"}</h4>
                          <span className="side-item-sub">
                            Quiz: {attempt.quiz?.title || "Quiz"} | Score: {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                          </span>
                        </div>
                        <span className="badge badge-success">{attempt.percentage}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Quick Administration Actions */}
            <div className="grid-column-right">
              <div className="dashboard-side-card glass-card">
                <div className="side-card-header">
                  <div className="side-card-title">
                    <ShieldCheck size={18} className="text-primary" />
                    <span>HOD Management Tools</span>
                  </div>
                </div>

                <div className="quick-actions-column">
                  <button className="quick-action-tile-btn" onClick={() => navigate("/admin/teachers")}>
                    <Users size={20} className="text-primary" />
                    <div>
                      <strong>Faculty & Teachers</strong>
                      <p>View faculty members, course load, & status</p>
                    </div>
                    <ArrowRight size={14} />
                  </button>

                  <button className="quick-action-tile-btn" onClick={() => navigate("/admin/students")}>
                    <GraduationCap size={20} className="text-accent" />
                    <div>
                      <strong>Student Records</strong>
                      <p>Inspect student enrollments & quiz scores</p>
                    </div>
                    <ArrowRight size={14} />
                  </button>

                  <button className="quick-action-tile-btn" onClick={() => navigate("/admin/results")}>
                    <Award size={20} className="text-emerald" />
                    <div>
                      <strong>Academic Results</strong>
                      <p>Audit quiz scores & assignment grades</p>
                    </div>
                    <ArrowRight size={14} />
                  </button>

                  <button className="quick-action-tile-btn" onClick={() => navigate("/admin/activity")}>
                    <Activity size={20} className="text-amber" />
                    <div>
                      <strong>System Audit Feed</strong>
                      <p>Real-time campus event logs</p>
                    </div>
                    <ArrowRight size={14} />
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

export default AdminDashboard;
