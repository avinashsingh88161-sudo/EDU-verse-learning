import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import FormattedStudentAnswer from "../components/FormattedStudentAnswer";
import { CheckSquare, Award, MessageSquare, Edit3, FileText, Download } from "lucide-react";
import "./Dashboard.css";

const TeacherSubmissions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(
    searchParams.get("assignmentId") || ""
  );
  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Grade Modal State
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [marks, setMarks] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [grading, setGrading] = useState(false);

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
      if (myC.length > 0 && !selectedCourseId) {
        setSelectedCourseId(myC[0]._id);
      }
    } catch (err) {
      console.error("Fetch courses error:", err);
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCourseId) {
      setAssignments([]);
      return;
    }

    const fetchAssignments = async () => {
      try {
        const res = await api.get(`/assignments/course/${selectedCourseId}`);
        const list = res.data.assignments || [];
        setAssignments(list);
        if (list.length > 0 && !selectedAssignmentId) {
          setSelectedAssignmentId(list[0]._id);
        }
      } catch (err) {
        console.error("Fetch assignments error:", err);
        setAssignments([]);
      }
    };

    fetchAssignments();
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedAssignmentId) {
      setSubmissions([]);
      return;
    }

    const fetchSubmissions = async () => {
      setLoadingSubmissions(true);
      try {
        const res = await api.get(`/assignment-submissions/assignment/${selectedAssignmentId}`);
        setSubmissions(res.data.submissions || []);
      } catch (err) {
        console.error("Fetch submissions error:", err);
        setSubmissions([]);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [selectedAssignmentId]);

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setMarks(submission.marks !== null ? submission.marks : 0);
    setFeedback(submission.feedback || "");
    setGradeModalOpen(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setGrading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await api.put(`/assignment-submissions/${selectedSubmission._id}/grade`, {
        marks: Number(marks),
        feedback,
      });

      setSuccessMsg("Assignment graded successfully!");
      setGradeModalOpen(false);

      setSubmissions((prev) =>
        prev.map((s) => (s._id === selectedSubmission._id ? res.data.submission : s))
      );
    } catch (err) {
      console.error("Grade submission error:", err);
      setError(err.response?.data?.message || "Failed to grade submission.");
    } finally {
      setGrading(false);
    }
  };

  const handleOpenFile = (sub) => {
    if (!sub) return;
    if (typeof sub === "string") {
      const token = localStorage.getItem("eduverse_token");
      const backendUrl = api.defaults.baseURL || "http://localhost:5000/api";
      window.open(`${backendUrl}/assignment-submissions/${sub}/file?token=${token}`, "_blank");
      return;
    }
    if (sub.fileUrl && sub.fileUrl.startsWith("http")) {
      window.open(sub.fileUrl, "_blank");
      return;
    }
    const token = localStorage.getItem("eduverse_token");
    const backendUrl = api.defaults.baseURL || "http://localhost:5000/api";
    window.open(`${backendUrl}/assignment-submissions/${sub._id}/file?token=${token}`, "_blank");
  };

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="teacher" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Student Submissions Hub" role="teacher" />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card">
            <h2>Submission Evaluation & Grading</h2>
            <p>Review student deliverable files & answers, award numerical marks, and enter constructive feedback.</p>

            {courses.length > 0 && (
              <div className="course-select-bar-wrapper mt-16">
                <div className="course-select-group">
                  <label>Selected Course:</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setSelectedAssignmentId("");
                    }}
                    className="course-dropdown-input"
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} ({c.subject})
                      </option>
                    ))}
                  </select>
                </div>

                {assignments.length > 0 && (
                  <div className="course-select-group">
                    <label>Assignment Task:</label>
                    <select
                      value={selectedAssignmentId}
                      onChange={(e) => setSelectedAssignmentId(e.target.value)}
                      className="course-dropdown-input"
                    >
                      {assignments.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.title} ({a.totalMarks} Marks)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <div className="error-banner">{error}</div>}
          {successMsg && <div className="success-banner">{successMsg}</div>}

          {loading ? (
            <LoadingSpinner message="Loading courses..." />
          ) : courses.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No courses created yet"
              description="Create a course first before managing student assignment submissions."
              actionLabel="Create Course"
              onAction={() => navigate("/teacher/courses")}
            />
          ) : assignments.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No assignments created for this course"
              description="Create an assignment for this course to start receiving student submissions."
              actionLabel="Create Assignment"
              onAction={() => navigate("/teacher/assignments")}
            />
          ) : !selectedAssignmentId ? (
            <EmptyState
              icon={CheckSquare}
              title="Select an assignment task"
              description="Choose an assignment task from the dropdown above to view student submissions."
            />
          ) : loadingSubmissions ? (
            <LoadingSpinner message="Fetching student submissions..." />
          ) : submissions.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No student submissions yet"
              description="No students have submitted deliverables for this assignment task so far."
            />
          ) : (
            <div className="submissions-list-layout">
              {submissions.map((sub) => {
                const isGraded = sub.status === "graded";

                return (
                  <div key={sub._id} className="submission-card glass-card">
                    {/* Header Section */}
                    <div className="submission-card-header flex-between align-start pb-12 border-bottom">
                      <div className="student-info-meta">
                        <h3 className="submission-title">
                          Student: {sub.student?.name || "Student"}
                        </h3>
                        <p className="submission-desc mt-2">{sub.student?.email}</p>
                      </div>

                      <span
                        className={`badge ${
                          isGraded ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {isGraded
                          ? `Graded: ${sub.marks} Marks`
                          : "Pending Evaluation"}
                      </span>
                    </div>

                    {/* Body Section */}
                    <div className="submission-body pt-14">
                      {sub.answer && (
                        <div className="answer-preview-wrapper mt-6">
                          <FormattedStudentAnswer rawAnswer={sub.answer} />
                        </div>
                      )}

                      {sub.file && (
                        <div className="deliverable-file-box mt-14">
                          <FileText size={16} className="text-accent" />
                          <span>
                            Deliverable: <strong>{sub.file}</strong>
                          </span>
                          <button
                            type="button"
                            className="secondary-action-btn sm ml-auto"
                            onClick={() => handleOpenFile(sub)}
                          >
                            <Download size={13} /> View / Download Deliverable
                          </button>
                        </div>
                      )}

                      {isGraded && (
                        <div className="graded-evaluation-section mt-14">
                          <div className="grade-score-row">
                            <Award size={18} className="text-amber flex-shrink-0" />
                            <span className="grade-score-text">
                              Awarded Marks:{" "}
                              <strong>
                                {sub.marks} /{" "}
                                {assignments.find(
                                  (a) => a._id === selectedAssignmentId
                                )?.totalMarks ||
                                  sub.assignment?.totalMarks ||
                                  100}
                              </strong>
                            </span>
                          </div>

                          {sub.feedback && (
                            <div className="grade-feedback-row mt-8">
                              <MessageSquare
                                size={18}
                                className="text-primary flex-shrink-0 mt-2"
                              />
                              <span className="grade-feedback-text">
                                Feedback: <em>"{sub.feedback}"</em>
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Section with Submitted Date and Bottom-Right Action Button */}
                    <div className="submission-card-footer mt-16 pt-12 border-top flex-between align-center">
                      <span className="footer-timestamp-text">
                        Submitted:{" "}
                        {sub.createdAt
                          ? new Date(sub.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                      <button
                        type="button"
                        className="primary-action-btn sm ml-auto"
                        onClick={() => openGradeModal(sub)}
                      >
                        <Edit3 size={14} />{" "}
                        {isGraded ? "Edit Grade" : "Review & Grade"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grade Submission Modal */}
          <Modal
            isOpen={gradeModalOpen}
            onClose={() => setGradeModalOpen(false)}
            title={`Grade Submission: ${selectedSubmission?.student?.name || ""}`}
          >
            <form onSubmit={handleGradeSubmit} className="modal-form">
              {selectedSubmission?.file && (
                <div className="deliverable-file-box">
                  <FileText size={16} className="text-accent" />
                  <span>File: <strong>{selectedSubmission.file}</strong></span>
                  <button
                    type="button"
                    className="secondary-action-btn sm ml-auto"
                    onClick={() => handleOpenFile(selectedSubmission)}
                  >
                    <Download size={13} /> View Deliverable
                  </button>
                </div>
              )}

              {selectedSubmission?.answer && (
                <div className="form-group">
                  <label>Student Answer</label>
                  <div className="modal-answer-scroll">
                    <FormattedStudentAnswer rawAnswer={selectedSubmission.answer} />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="marks">
                  Award Marks (Out of {assignments.find(a => a._id === selectedAssignmentId)?.totalMarks || 100})
                </label>
                <input
                  id="marks"
                  type="number"
                  min="0"
                  max={assignments.find(a => a._id === selectedAssignmentId)?.totalMarks || 100}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="feedback">Faculty Feedback</label>
                <textarea
                  id="feedback"
                  rows={4}
                  placeholder="Provide constructive feedback for the student..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="primary-action-btn full-width"
                disabled={grading}
              >
                {grading ? "Saving Grade..." : "Submit Grade & Feedback"}
              </button>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default TeacherSubmissions;
