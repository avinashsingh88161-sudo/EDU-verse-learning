import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import {
  BookOpen,
  FileText,
  HelpCircle,
  CheckSquare,
  User,
  Download,
  Clock,
  Send,
  Check,
  Users,
  GraduationCap,
  Eye,
  Award,
  RefreshCw,
  ArrowLeft,
  FileCheck,
} from "lucide-react";
import "./Dashboard.css";

// Helper to format assignment questions so every numbered question displays on a separate line
const formatAssignmentText = (rawText) => {
  if (!rawText) return null;

  const trimmed = rawText.trim();
  const regex = /(?=(?:^|\s+)\d+[.)]\s+)/g;
  const parts = trimmed.split(regex).map((p) => p.trim()).filter(Boolean);

  if (parts.length > 1) {
    return (
      <div className="formatted-questions-container">
        {parts.map((part, idx) => (
          <div key={idx} className="formatted-question-line">
            {part}
          </div>
        ))}
      </div>
    );
  }

  if (trimmed.includes("\n")) {
    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
    return (
      <div className="formatted-questions-container">
        {lines.map((line, idx) => (
          <div key={idx} className="formatted-question-line">
            {line}
          </div>
        ))}
      </div>
    );
  }

  return <p className="quiz-desc">{trimmed}</p>;
};

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [notes, setNotes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [myQuizResults, setMyQuizResults] = useState([]);

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Assignment Submit Modal State
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentAnswer, setAssignmentAnswer] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const courseRes = await api.get(`/courses/${courseId}`);
      setCourse(courseRes.data.course);

      // Fetch all course materials and student progress in parallel
      const [notesRes, assignRes, quizRes, subsRes, resultsRes] =
        await Promise.allSettled([
          api.get(`/notes/course/${courseId}`),
          api.get(`/assignments/course/${courseId}`),
          api.get(`/quizzes/student`),
          api.get(`/assignment-submissions/my`),
          api.get(`/quizzes/results/my`),
        ]);

      if (notesRes.status === "fulfilled") {
        setNotes(notesRes.value.data.notes || []);
      }
      if (assignRes.status === "fulfilled") {
        setAssignments(assignRes.value.data.assignments || []);
      }
      if (quizRes.status === "fulfilled") {
        const allQ = quizRes.value.data.quizzes || [];
        setQuizzes(
          allQ.filter((q) => (q.course?._id || q.course) === courseId)
        );
      }
      if (subsRes.status === "fulfilled") {
        setMySubmissions(subsRes.value.data.submissions || []);
      }
      if (resultsRes.status === "fulfilled") {
        setMyQuizResults(resultsRes.value.data.results || []);
      }
    } catch (err) {
      console.error("Course details load error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load course information. Please verify your enrollment or connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setAssignmentAnswer("");
    setSubmissionFile(null);
    setSubmitMessage("");
    setSubmitModalOpen(true);
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment || (!assignmentAnswer.trim() && !submissionFile)) {
      setSubmitMessage("Please provide answer text or attach a deliverable file.");
      return;
    }

    setSubmitting(true);
    setSubmitMessage("");
    try {
      const formData = new FormData();
      formData.append("answer", assignmentAnswer);
      if (submissionFile) {
        formData.append("file", submissionFile);
      }

      const res = await api.post(
        `/assignment-submissions/${selectedAssignment._id}`,
        formData
      );

      setSubmitMessage("Assignment submitted successfully!");
      setMySubmissions((prev) => [...prev, res.data.submission]);
      setTimeout(() => {
        setSubmitModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error("Submit assignment error:", err);
      setSubmitMessage(
        err.response?.data?.message || "Failed to submit assignment deliverable."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openNoteFile = (noteId) => {
    const token = localStorage.getItem("eduverse_token");
    const backendUrl = api.defaults.baseURL || "http://localhost:5000/api";
    window.open(`${backendUrl}/notes/${noteId}/file?token=${token}`, "_blank");
  };

  // Skeleton Loader Component
  if (loading) {
    return (
      <div className="dashboard-layout-container">
        <Sidebar role="student" />
        <div className="dashboard-main-wrapper">
          <Topbar pageTitle="Loading Course..." role="student" />
          <main className="dashboard-content-body">
            <div className="skeleton-hero-card" />
            <div className="stats-overview-grid">
              <div className="skeleton-stat-card" />
              <div className="skeleton-stat-card" />
              <div className="skeleton-stat-card" />
              <div className="skeleton-stat-card" />
            </div>
            <div className="skeleton-content-block" />
          </main>
        </div>
      </div>
    );
  }

  // Error State Component
  if (error || !course) {
    return (
      <div className="dashboard-layout-container">
        <Sidebar role="student" />
        <div className="dashboard-main-wrapper">
          <Topbar pageTitle="Course Details" role="student" />
          <main className="dashboard-content-body">
            <div className="glass-card inner-padding text-center flex-column-center">
              <BookOpen size={48} className="text-muted mb-10" />
              <h2>Unable to load course details</h2>
              <p className="text-secondary max-w-400 mb-20">{error}</p>
              <div className="flex-gap-xs">
                <button
                  type="button"
                  className="secondary-action-btn"
                  onClick={() => navigate("/student/my-courses")}
                >
                  <ArrowLeft size={14} /> Back to My Courses
                </button>
                <button
                  type="button"
                  className="primary-action-btn"
                  onClick={fetchCourseDetails}
                >
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const instructorName = course.teacher?.name || "Faculty Member";

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="student" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle={course.title} role="student" />

        <main className="dashboard-content-body">
          {/* Back Navigation Bar */}
          <div className="flex-between align-center">
            <button
              type="button"
              className="secondary-action-btn sm"
              onClick={() => navigate("/student/my-courses")}
            >
              <ArrowLeft size={14} /> My Courses
            </button>
            <span className="badge badge-success flex-center-gap">
              <Check size={12} /> Enrolled
            </span>
          </div>

          {/* Academic Hero Header Card */}
          <div className="academic-course-hero-card glass-card">
            <div className="hero-icon-box">
              <GraduationCap size={32} />
            </div>
            <div className="hero-details">
              <span className="subject-chip">{course.subject || "General"}</span>
              <h1 className="course-hero-title">{course.title}</h1>
              <p className="course-hero-instructor flex-center-gap">
                <User size={14} /> Instructor: <strong>{instructorName}</strong>
              </p>
              <p className="course-hero-desc">{course.description}</p>
            </div>
          </div>

          {/* Compact Course Statistics Row */}
          <div className="stats-overview-grid">
            <div className="stat-card-widget">
              <div className="stat-card-top">
                <div className="stat-icon-wrapper stat-theme-indigo">
                  <FileText size={22} />
                </div>
                <span className="badge badge-primary">Materials</span>
              </div>
              <div className="stat-value-display">{notes.length}</div>
              <span className="section-subtitle">
                Lecture Note{notes.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="stat-card-widget">
              <div className="stat-card-top">
                <div className="stat-icon-wrapper stat-theme-amber">
                  <CheckSquare size={22} />
                </div>
                <span className="badge badge-warning">Tasks</span>
              </div>
              <div className="stat-value-display">{assignments.length}</div>
              <span className="section-subtitle">Active Assignments</span>
            </div>

            <div className="stat-card-widget">
              <div className="stat-card-top">
                <div className="stat-icon-wrapper stat-theme-cyan">
                  <HelpCircle size={22} />
                </div>
                <span className="badge badge-accent">Tests</span>
              </div>
              <div className="stat-value-display">{quizzes.length}</div>
              <span className="section-subtitle">Published Quizzes</span>
            </div>

            <div className="stat-card-widget">
              <div className="stat-card-top">
                <div className="stat-icon-wrapper stat-theme-emerald">
                  <Users size={22} />
                </div>
                <span className="badge badge-success">Classroom</span>
              </div>
              <div className="stat-value-display">
                {course.enrolledStudents?.length || 0}
              </div>
              <span className="section-subtitle">Enrolled Students</span>
            </div>
          </div>

          {/* Course Navigation Tabs */}
          <div className="course-tab-bar">
            <button
              type="button"
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <BookOpen size={16} /> Overview
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
              onClick={() => setActiveTab("notes")}
            >
              <FileText size={16} /> Notes ({notes.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "assignments" ? "active" : ""}`}
              onClick={() => setActiveTab("assignments")}
            >
              <CheckSquare size={16} /> Assignments ({assignments.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "quizzes" ? "active" : ""}`}
              onClick={() => setActiveTab("quizzes")}
            >
              <HelpCircle size={16} /> Quizzes ({quizzes.length})
            </button>
          </div>

          {/* Tab Content Panes */}
          {activeTab === "overview" && (
            <div className="tab-pane-container">
              <div className="dashboard-section-card glass-card">
                <h3 className="section-title">Course Overview</h3>
                <p className="overview-text">{course.description}</p>
              </div>

              <div className="dashboard-section-card glass-card mt-20">
                <h3 className="section-title">Course Information</h3>
                <div className="course-info-list">
                  <div className="info-row">
                    <span className="info-label">Course Title</span>
                    <span className="info-divider">-</span>
                    <strong className="info-value">{course.title}</strong>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Department / Subject</span>
                    <span className="info-divider">-</span>
                    <strong className="info-value">{course.subject || "General"}</strong>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Instructor</span>
                    <span className="info-divider">-</span>
                    <strong className="info-value">{instructorName}</strong>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Study Notes</span>
                    <span className="info-divider">-</span>
                    <strong className="info-value">{notes.length} PDF Document(s)</strong>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Published Quizzes</span>
                    <span className="info-divider">-</span>
                    <strong className="info-value">{quizzes.length} Evaluation(s)</strong>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Assignments</span>
                    <span className="info-divider">-</span>
                    <strong className="info-value">{assignments.length} Deliverable(s)</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="tab-pane-container">
              {notes.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No lecture notes available"
                  description="Your instructor hasn't uploaded any notes for this course yet."
                />
              ) : (
                <div className="notes-grid-layout">
                  {notes.map((note) => (
                    <div key={note._id} className="note-card glass-card">
                      <div className="note-card-top">
                        <FileText size={28} className="text-primary" />
                        <span className="file-size-badge">PDF</span>
                      </div>
                      <h3 className="note-title">{note.title}</h3>
                      <p className="note-desc">
                        {note.description || "Lecture reference material"}
                      </p>

                      <div className="note-meta-row">
                        <span className="meta-text">
                          Uploaded by: <strong>{instructorName}</strong>
                        </span>
                        <span className="meta-text">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="note-card-footer flex-gap-xs mt-10">
                        <button
                          type="button"
                          className="primary-action-btn full-width sm"
                          onClick={() => openNoteFile(note._id)}
                        >
                          <Download size={14} /> View / Download PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "assignments" && (
            <div className="tab-pane-container">
              {assignments.length === 0 ? (
                <EmptyState
                  icon={CheckSquare}
                  title="No assignments available"
                  description="Your instructor hasn't published any assignments for this course yet."
                />
              ) : (
                <div className="assignments-list flex-column-gap">
                  {assignments.map((assignment) => {
                    const sub = mySubmissions.find(
                      (s) =>
                        (s.assignment?._id || s.assignment) === assignment._id
                    );

                    return (
                      <div key={assignment._id} className="assignment-item-card glass-card">
                        <div className="flex-between align-center mb-8">
                          <h4 className="quiz-title">{assignment.title}</h4>
                          {sub ? (
                            <span
                              className={`badge ${
                                sub.status === "graded"
                                  ? "badge-success"
                                  : "badge-warning"
                              }`}
                            >
                              {sub.status === "graded" ? "Graded" : "Submitted"}
                            </span>
                          ) : (
                            <span className="badge badge-rose">Pending</span>
                          )}
                        </div>

                        {formatAssignmentText(assignment.description)}

                        {sub && sub.status === "graded" && (
                          <div className="graded-feedback-box mt-10">
                            <span className="feedback-marks-title">
                              Evaluation Score: <strong>{sub.marks} / {assignment.totalMarks}</strong>
                            </span>
                            {sub.feedback && (
                              <p className="feedback-text">
                                Teacher Feedback: "{sub.feedback}"
                              </p>
                            )}
                          </div>
                        )}

                        <div className="assignment-card-footer-row flex-between align-center mt-14 pt-12 border-top">
                          <div className="assignment-meta-left flex-center-gap">
                            <span className="meta-item flex-center-gap">
                              <Clock size={14} className="text-primary" /> Due Date:{" "}
                              <strong>
                                {new Date(assignment.dueDate).toLocaleDateString()}
                              </strong>
                            </span>
                            <span className="meta-item flex-center-gap">
                              <Award size={14} className="text-amber" /> Total Marks:{" "}
                              <strong>{assignment.totalMarks}</strong>
                            </span>
                            {sub && sub.submittedAt && (
                              <span className="meta-item flex-center-gap">
                                <FileCheck size={14} className="text-emerald" /> Submitted:{" "}
                                <strong>
                                  {new Date(sub.submittedAt).toLocaleDateString()}
                                </strong>
                              </span>
                            )}
                          </div>

                          <div className="assignment-action-right">
                            {sub ? (
                              <div className="submitted-check-pill">
                                <Check size={16} /> Submitted
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="primary-action-btn sm"
                                onClick={() => openSubmitModal(assignment)}
                              >
                                <Send size={14} /> Submit Work
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "quizzes" && (
            <div className="tab-pane-container">
              {quizzes.length === 0 ? (
                <EmptyState
                  icon={HelpCircle}
                  title="No quizzes available"
                  description="Your instructor hasn't published any quizzes for this course yet."
                />
              ) : (
                <div className="quizzes-grid-layout">
                  {quizzes.map((quiz) => {
                    const result = myQuizResults.find(
                      (r) => (r.quiz?._id || r.quiz) === quiz._id
                    );

                    return (
                      <div key={quiz._id} className="quiz-card glass-card">
                        <div className="quiz-card-top">
                          <span className="subject-chip">
                            {quiz.questions?.length || 0} Questions
                          </span>
                          <span
                            className={`badge ${
                              result ? "badge-success" : "badge-accent"
                            }`}
                          >
                            {result ? "Completed" : "Available"}
                          </span>
                        </div>

                        <h3 className="quiz-title">{quiz.title}</h3>
                        <p className="quiz-desc">
                          {quiz.description || "Course multiple choice evaluation."}
                        </p>

                        <div className="quiz-meta-info-row">
                          <span className="meta-item">
                            Instructor: <strong>{instructorName}</strong>
                          </span>
                          <span className="meta-item">
                            Total Marks: <strong>{quiz.totalMarks || quiz.questions?.length}</strong>
                          </span>
                        </div>

                        {result && (
                          <div className="graded-feedback-box mt-10">
                            <span className="feedback-marks-title">
                              Score: <strong>{result.score} / {result.totalQuestions} ({result.percentage}%)</strong>
                            </span>
                          </div>
                        )}

                        <div className="quiz-card-footer mt-14">
                          <button
                            type="button"
                            className={`full-width ${
                              result ? "secondary-action-btn sm" : "primary-action-btn sm"
                            }`}
                            onClick={() => navigate(`/student/quizzes/${quiz._id}`)}
                          >
                            {result ? (
                              <>
                                <Eye size={14} /> View Result
                              </>
                            ) : (
                              <>Start Quiz</>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Submit Assignment Modal */}
          {submitModalOpen && (
            <Modal
              isOpen={submitModalOpen}
              onClose={() => setSubmitModalOpen(false)}
              title={`Submit Assignment: ${selectedAssignment?.title || ""}`}
            >
              <form onSubmit={handleAssignmentSubmit} className="modal-form">
                {submitMessage && (
                  <div
                    className={
                      submitMessage.includes("success")
                        ? "success-banner"
                        : "error-banner"
                    }
                  >
                    {submitMessage}
                  </div>
                )}

                <div className="form-group">
                  <label>Assignment Task</label>
                  {formatAssignmentText(selectedAssignment?.description)}
                  <div className="quiz-meta-info-row mt-6">
                    <span>
                      Due Date:{" "}
                      <strong>
                        {new Date(selectedAssignment?.dueDate).toLocaleDateString()}
                      </strong>
                    </span>
                    <span>
                      Total Marks: <strong>{selectedAssignment?.totalMarks}</strong>
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="answer">Answer / Notes (Optional)</label>
                  <textarea
                    id="answer"
                    rows={3}
                    placeholder="Provide text details or comments for your deliverable..."
                    value={assignmentAnswer}
                    onChange={(e) => setAssignmentAnswer(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="file">
                    Attach Deliverable File (PDF / JPG / JPEG / PNG) *
                  </label>
                  <input
                    id="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setSubmissionFile(e.target.files[0])}
                  />
                  {submissionFile && (
                    <span className="selected-file-pill mt-4">
                      Selected: <strong>{submissionFile.name}</strong> (
                      {(submissionFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="primary-action-btn full-width mt-10"
                  disabled={submitting}
                >
                  {submitting ? "Submitting Work..." : "Submit Assignment"}
                </button>
              </form>
            </Modal>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseDetails;
