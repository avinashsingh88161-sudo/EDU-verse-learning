import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import MobileWebBottomNav from "../components/MobileWebBottomNav";
import {
  BookOpen,
  FileText,
  HelpCircle,
  CheckSquare,
  PlusCircle,
  ArrowRight,
  GraduationCap,
  Users,
  Award,
} from "lucide-react";
import "./Dashboard.css";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myCourses, setMyCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    publishedQuizzes: 0,
    pendingAssignmentReviews: 0,
  });
  const [courseMetricsMap, setCourseMetricsMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      setError("");
      try {
        const [statsRes, coursesRes, quizzesRes, assignmentsRes] =
          await Promise.allSettled([
            api.get("/teacher/dashboard-stats"),
            api.get("/courses"),
            api.get("/quizzes"),
            api.get("/assignments/teacher"),
          ]);

        if (statsRes.status === "fulfilled" && statsRes.value.data) {
          setStats({
            totalCourses: statsRes.value.data.totalCourses || 0,
            totalStudents: statsRes.value.data.totalStudents || 0,
            publishedQuizzes: statsRes.value.data.publishedQuizzes || 0,
            pendingAssignmentReviews:
              statsRes.value.data.pendingAssignmentReviews || 0,
          });
        }

        let teacherCourses = [];
        if (coursesRes.status === "fulfilled") {
          const allCourses = coursesRes.value.data.courses || [];
          teacherCourses = allCourses.filter(
            (c) =>
              (c.teacher?._id || c.teacher) === user?.id ||
              (c.teacher?._id || c.teacher) === user?._id
          );
          setMyCourses(teacherCourses);
        }

        const allQuizzes =
          quizzesRes.status === "fulfilled"
            ? quizzesRes.value.data.quizzes || []
            : [];
        const allAssignments =
          assignmentsRes.status === "fulfilled"
            ? assignmentsRes.value.data.assignments || []
            : [];

        // Build metrics map per course
        const metrics = {};
        for (const c of teacherCourses) {
          try {
            const notesRes = await api.get(`/notes/course/${c._id}`);
            const notesCount = notesRes.data.notes?.length || 0;

            const courseQuizzesCount = allQuizzes.filter(
              (q) => (q.course?._id || q.course) === c._id
            ).length;

            const courseAssignmentsCount = allAssignments.filter(
              (a) => (a.course?._id || a.course) === c._id
            ).length;

            metrics[c._id] = {
              notesCount,
              quizzesCount: courseQuizzesCount,
              assignmentsCount: courseAssignmentsCount,
            };
          } catch (e) {
            metrics[c._id] = {
              notesCount: 0,
              quizzesCount: 0,
              assignmentsCount: 0,
            };
          }
        }
        setCourseMetricsMap(metrics);
      } catch (err) {
        console.error("Teacher dashboard load error:", err);
        setError("Failed to load instructor metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user]);

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="teacher" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Faculty Control Center" role="teacher" />

        <main className="dashboard-content-body">
          {/* Welcome Banner */}
          <div className="welcome-banner-card glass-card teacher-theme">
            <div className="welcome-banner-content">
              <span className="welcome-eyebrow">
                <GraduationCap size={14} /> Faculty Academic Portal
              </span>
              <h1 className="welcome-title">
                Welcome back, {user?.name || "Faculty Member"}
              </h1>
              <p className="welcome-subtitle">
                Manage your academic curriculum, upload study materials, set up online quizzes, and evaluate student deliverables.
              </p>

              <div className="welcome-cta-group">
                <button
                  type="button"
                  className="primary-action-btn"
                  onClick={() => navigate("/teacher/courses")}
                >
                  <PlusCircle size={16} /> Manage Courses
                </button>
                <button
                  type="button"
                  className="secondary-action-btn"
                  onClick={() => navigate("/teacher/notes")}
                >
                  <FileText size={16} /> Upload Notes
                </button>
              </div>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {/* REAL MongoDB Stats Grid */}
          <div className="stats-overview-grid">
            <StatCard
              title="Total Courses"
              value={loading ? "..." : stats.totalCourses}
              subtitle="Created modules"
              icon={BookOpen}
              colorTheme="indigo"
            />
            <StatCard
              title="Total Enrolled Students"
              value={loading ? "..." : stats.totalStudents}
              subtitle="Unique enrolled learners"
              icon={Users}
              colorTheme="cyan"
            />
            <StatCard
              title="Published Quizzes"
              value={loading ? "..." : stats.publishedQuizzes}
              subtitle="Active question banks"
              icon={HelpCircle}
              colorTheme="amber"
            />
            <StatCard
              title="Pending Reviews"
              value={loading ? "..." : stats.pendingAssignmentReviews}
              subtitle="Deliverables awaiting evaluation"
              icon={Award}
              colorTheme="rose"
            />
          </div>

          {/* Teacher Courses Cards Section */}
          <div className="dashboard-two-column-grid">
            <div className="grid-column-left">
              <section className="dashboard-section-card glass-card">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">My Managed Courses</h2>
                    <p className="section-subtitle">Real course metrics and learning resources</p>
                  </div>
                  <button
                    type="button"
                    className="primary-action-btn sm"
                    onClick={() => navigate("/teacher/courses")}
                  >
                    <PlusCircle size={14} /> Add New Course
                  </button>
                </div>

                {loading ? (
                  <LoadingSpinner message="Loading course metrics..." />
                ) : myCourses.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title="No courses created yet"
                    description="Create your first course to start uploading notes, quizzes, and assignments."
                    actionLabel="Create Course"
                    onAction={() => navigate("/teacher/courses")}
                  />
                ) : (
                  <div className="course-cards-list">
                    {myCourses.map((course) => {
                      const m = courseMetricsMap[course._id] || {
                        notesCount: 0,
                        quizzesCount: 0,
                        assignmentsCount: 0,
                      };

                      return (
                        <div key={course._id} className="dashboard-course-item glass-card">
                          <div className="course-details-body">
                            <span className="subject-chip">{course.subject || "General"}</span>
                            <h3 className="course-card-title">{course.title}</h3>
                            <p className="course-card-desc">{course.description}</p>
                            <div className="teacher-name-tag">
                              Created by: <strong>{user?.name || "Faculty Member"}</strong>
                            </div>

                            <div className="course-metrics-bar">
                              <span className="metric-pill">
                                <strong>Students:</strong> {course.enrolledStudents?.length || 0}
                              </span>
                              <span className="metric-pill">
                                <strong>Notes:</strong> {m.notesCount}
                              </span>
                              <span className="metric-pill">
                                <strong>Quizzes:</strong> {m.quizzesCount}
                              </span>
                              <span className="metric-pill">
                                <strong>Assignments:</strong> {m.assignmentsCount}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="secondary-action-btn sm"
                            onClick={() => navigate("/teacher/courses")}
                          >
                            Manage Course <ArrowRight size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Right Side Actions */}
            <div className="grid-column-right">
              <div className="dashboard-side-card glass-card">
                <div className="side-card-header">
                  <div className="side-card-title">
                    <CheckSquare size={18} className="text-primary" />
                    <span>Quick Faculty Actions</span>
                  </div>
                </div>

                <div className="quick-actions-column">
                  <button type="button" className="quick-action-tile-btn" onClick={() => navigate("/teacher/students")}>
                    <Users size={20} className="text-accent" />
                    <div>
                      <strong>Enrolled Students Directory</strong>
                      <p>View students enrolled in your courses</p>
                    </div>
                    <ArrowRight size={14} />
                  </button>

                  <button type="button" className="quick-action-tile-btn" onClick={() => navigate("/teacher/notes")}>
                    <FileText size={20} className="text-primary" />
                    <div>
                      <strong>Upload Lecture PDF</strong>
                      <p>Share study notes with enrolled students</p>
                    </div>
                    <ArrowRight size={14} />
                  </button>

                  <button type="button" className="quick-action-tile-btn" onClick={() => navigate("/teacher/quizzes")}>
                    <HelpCircle size={20} className="text-amber" />
                    <div>
                      <strong>Create Multiple Choice Quiz</strong>
                      <p>Build automated quiz evaluations</p>
                    </div>
                    <ArrowRight size={14} />
                  </button>

                  <button type="button" className="quick-action-tile-btn" onClick={() => navigate("/teacher/submissions")}>
                    <Award size={20} className="text-emerald" />
                    <div>
                      <strong>Review Submissions</strong>
                      <p>Grade student deliverables & feedback</p>
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

export default TeacherDashboard;
