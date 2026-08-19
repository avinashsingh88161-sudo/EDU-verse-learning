import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import {
  CheckSquare,
  PlusCircle,
  Check,
  Eye,
  Award,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import "./Dashboard.css";

// Helper to parse description into overview text and numbered questions array
const parseAssignmentContent = (rawText) => {
  if (!rawText) return { overview: "", questions: [] };

  const trimmed = rawText.trim();
  // Lookahead regex to split numbered items like "1. ", "2. ", "1) ", "2) "
  const regex = /(?=(?:^|\s+)\d+[.)]\s+)/g;
  const parts = trimmed.split(regex).map((p) => p.trim()).filter(Boolean);

  let overview = "";
  const questions = [];

  parts.forEach((part) => {
    const match = part.match(/^(\d+)[.)]\s+(.*)/s);
    if (match) {
      questions.push({
        num: match[1],
        text: match[2].trim(),
      });
    } else {
      if (overview) {
        overview += " " + part;
      } else {
        overview = part;
      }
    }
  });

  return { overview, questions };
};

const TeacherAssignments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Create Assignment Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalMarks, setTotalMarks] = useState(10);
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Auto-dismiss success notification
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    fetchMyCourses();
  }, [user]);

  const fetchMyCourses = async () => {
    setLoading(true);
    setError("");
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
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCourseId) {
      setAssignments([]);
      return;
    }

    const fetchCourseAssignments = async () => {
      setLoadingAssign(true);
      setError("");
      try {
        const res = await api.get(`/assignments/course/${selectedCourseId}`);
        setAssignments(res.data.assignments || []);
      } catch (err) {
        console.error("Fetch assignments error:", err);
        setError("Unable to load assignments.");
        setAssignments([]);
      } finally {
        setLoadingAssign(false);
      }
    };

    fetchCourseAssignments();
  }, [selectedCourseId]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !title.trim() || !dueDate) return;

    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await api.post("/assignments", {
        title: title.trim(),
        description: description.trim(),
        courseId: selectedCourseId,
        totalMarks: Number(totalMarks),
        dueDate,
      });

      setSuccessMsg("Assignment created successfully!");
      setCreateModalOpen(false);
      setTitle("");
      setDescription("");
      setTotalMarks(10);
      setDueDate("");

      if (res.data.assignment) {
        setAssignments((prev) => [res.data.assignment, ...prev]);
      }
    } catch (err) {
      console.error("Create assignment error:", err);
      setError(err.response?.data?.message || "Failed to create assignment.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (assignmentId) => {
    setError("");
    setSuccessMsg("");
    try {
      await api.put(`/assignments/${assignmentId}/publish`);
      setSuccessMsg("Assignment published successfully!");
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === assignmentId ? { ...a, isPublished: true } : a
        )
      );
    } catch (err) {
      console.error("Publish assignment error:", err);
      setError(err.response?.data?.message || "Failed to publish assignment.");
    }
  };

  const currentCourse = courses.find((c) => c._id === selectedCourseId);
  const teacherName = user?.name || courseTeacherName(currentCourse);

  function courseTeacherName(c) {
    if (!c) return "Faculty Member";
    if (typeof c.teacher === "object" && c.teacher?.name) return c.teacher.name;
    return user?.name || "Faculty Member";
  }

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="teacher" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Assignments & Tasks" role="teacher" />

        <main className="dashboard-content-body">
          {/* Header Bar */}
          <div className="page-header-card glass-card flex-between align-start">
            <div>
              <h2>Faculty Assignment Manager</h2>
              <p>
                Create assignment deliverables, publish deadlines, and review
                student work submissions.
              </p>

              {courses.length > 0 && (
                <div className="course-select-bar mt-14">
                  <label className="course-select-label">Select Course:</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="course-dropdown-input"
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} ({c.subject || "General"})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {courses.length > 0 && (
              <button
                type="button"
                className="primary-action-btn prominent-btn"
                onClick={() => setCreateModalOpen(true)}
              >
                <PlusCircle size={16} /> Create Assignment
              </button>
            )}
          </div>

          {/* Compact Alerts */}
          {error && (
            <div className="error-banner flex-between align-center">
              <span>{error}</span>
              <button
                type="button"
                className="secondary-action-btn sm"
                onClick={() => {
                  setError("");
                  fetchMyCourses();
                }}
              >
                Try Again
              </button>
            </div>
          )}
          {successMsg && (
            <div className="success-banner compact-toast flex-center-gap">
              <CheckCircle2 size={16} /> {successMsg}
            </div>
          )}

          {/* Loading Skeletons */}
          {loading || loadingAssign ? (
            <div className="assignments-skeleton-list">
              <div className="skeleton-assignment-card" />
              <div className="skeleton-assignment-card" />
              <div className="skeleton-assignment-card" />
            </div>
          ) : courses.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No courses created yet"
              description="Create a course first before posting assignments."
            />
          ) : assignments.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No assignments created yet"
              description="Create your first assignment for your students."
              actionLabel="Create Assignment"
              onAction={() => setCreateModalOpen(true)}
            />
          ) : (
            /* Assignment Cards Grid */
            <div className="assignments-structured-grid">
              {assignments.map((assign) => {
                const { overview, questions } = parseAssignmentContent(
                  assign.description
                );

                return (
                  <div
                    key={assign._id}
                    className="assignment-redesign-card glass-card"
                  >
                    {/* Card Top Header */}
                    <div className="assignment-card-header border-bottom pb-12">
                      <div className="flex-between align-start">
                        <div>
                          <h3 className="assignment-card-title">
                            {assign.title}
                          </h3>
                          <div className="assignment-course-meta mt-4">
                            <span className="subject-chip">
                              {currentCourse?.title || "Course"} •{" "}
                              {currentCourse?.subject || "General"}
                            </span>
                            <span className="creator-text">
                              Created by <strong>{teacherName}</strong>
                            </span>
                          </div>
                        </div>

                        <span
                          className={`badge ${
                            assign.isPublished
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {assign.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="assignment-card-body pt-14">
                      {overview && (
                        <div className="assignment-overview-block mb-14">
                          <span className="section-label">
                            Assignment Description
                          </span>
                          <p className="overview-text">{overview}</p>
                        </div>
                      )}

                      {questions.length > 0 && (
                        <div className="assignment-questions-section">
                          <span className="section-label">
                            Questions ({questions.length})
                          </span>
                          <div className="questions-list-grid mt-8">
                            {questions.map((q, qIdx) => (
                              <div key={qIdx} className="question-item-card">
                                <span className="question-num-badge">
                                  {q.num}
                                </span>
                                <span className="question-text-content">
                                  {q.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Bottom Metadata Row */}
                    <div className="assignment-card-footer flex-between align-center mt-16 pt-12 border-top">
                      <div className="assignment-meta-pills flex-center-gap">
                        <span className="meta-pill flex-center-gap">
                          <Calendar size={14} className="text-primary" /> Due:{" "}
                          <strong>
                            {new Date(assign.dueDate).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </strong>
                        </span>
                        <span className="meta-pill flex-center-gap">
                          <Award size={14} className="text-amber" /> Total
                          Marks: <strong>{assign.totalMarks}</strong>
                        </span>
                        <span className="meta-pill flex-center-gap">
                          <CheckCircle2 size={14} className="text-emerald" />{" "}
                          Status:{" "}
                          <strong>
                            {assign.isPublished ? "Published" : "Draft"}
                          </strong>
                        </span>
                      </div>

                      <div className="assignment-card-actions flex-gap-xs">
                        {!assign.isPublished && (
                          <button
                            type="button"
                            className="primary-action-btn sm"
                            onClick={() => handlePublish(assign._id)}
                          >
                            <Check size={14} /> Publish
                          </button>
                        )}
                        <button
                          type="button"
                          className="secondary-action-btn sm"
                          onClick={() =>
                            navigate(
                              `/teacher/submissions?assignmentId=${assign._id}`
                            )
                          }
                        >
                          <Eye size={14} /> View Submissions
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create Assignment Modal */}
          {createModalOpen && (
            <Modal
              isOpen={createModalOpen}
              onClose={() => setCreateModalOpen(false)}
              title="Create Course Assignment"
            >
              <form onSubmit={handleCreateAssignment} className="modal-form">
                <div className="form-group">
                  <label>Target Course *</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="course-dropdown full-width"
                    required
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} ({c.subject || "General"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="assignTitle">Assignment Title *</label>
                  <input
                    id="assignTitle"
                    type="text"
                    placeholder="e.g. JavaScript Fundamentals and Core Concepts"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="assignDesc">
                    Assignment Description & Questions *
                  </label>
                  <p className="field-hint-text">
                    Tip: Enter questions numbered as "1. Question text", "2.
                    Question text" to render them as formatted question items.
                  </p>
                  <textarea
                    id="assignDesc"
                    rows={6}
                    placeholder="This assignment covers JavaScript basics.\n1. What is JavaScript?\n2. Explain features and advantages of JS."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="totalMarks">Total Marks *</label>
                  <input
                    id="totalMarks"
                    type="number"
                    min="1"
                    max="100"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dueDate">Submission Due Date *</label>
                  <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="primary-action-btn full-width mt-10"
                  disabled={saving}
                >
                  {saving ? "Creating Assignment..." : "Create Assignment"}
                </button>
              </form>
            </Modal>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherAssignments;
