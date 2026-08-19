import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import FormattedStudentAnswer from "../components/FormattedStudentAnswer";
import { CheckSquare, Clock, Award, MessageSquare, CheckCircle, FileText, Download } from "lucide-react";
import "./Dashboard.css";

// Helper to format assignment questions line-by-line
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

  return <p className="submission-desc">{trimmed}</p>;
};

const StudentAssignments = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/assignment-submissions/my");
        const list = res.data.submissions || [];
        setSubmissions(list);
        setFilteredSubmissions(list);
      } catch (err) {
        console.error("Fetch submissions error:", err);
        setError("Failed to load assignment submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredSubmissions(submissions);
    } else {
      const q = query.toLowerCase();
      setFilteredSubmissions(
        submissions.filter(
          (s) =>
            s.assignment?.title?.toLowerCase().includes(q) ||
            s.assignment?.description?.toLowerCase().includes(q) ||
            s.feedback?.toLowerCase().includes(q)
        )
      );
    }
  };

  const handleOpenFile = (sub) => {
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
      <Sidebar role="student" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Assignments & Work" role="student" onSearch={handleSearch} />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card">
            <h2>Assignment Submissions</h2>
            <p>Track your submitted course deliverables, grading status, total marks, and faculty feedback.</p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <LoadingSpinner message="Fetching your submissions..." />
          ) : filteredSubmissions.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No assignment submissions yet"
              description="Submissions deliverable from course pages will be displayed here."
            />
          ) : (
            <div className="submissions-list-layout">
              {filteredSubmissions.map((sub) => {
                const isGraded = sub.status === "graded";

                return (
                  <div key={sub._id} className="submission-card glass-card">
                    <div className="submission-card-header">
                      <div>
                        <h3 className="submission-title">
                          {sub.assignment?.title || "Course Assignment"}
                        </h3>
                        {formatAssignmentText(sub.assignment?.description)}
                      </div>

                      <span className={`status-badge ${isGraded ? "graded" : "pending"}`}>
                        {isGraded ? <CheckCircle size={14} /> : <Clock size={14} />}
                        {isGraded ? "Graded" : "Submitted (Pending Grade)"}
                      </span>
                    </div>

                    <div className="submission-body">
                      {sub.answer && (
                        <div className="student-solution-container mt-14">
                          <span className="section-label mb-8">YOUR SOLUTION</span>
                          <FormattedStudentAnswer rawAnswer={sub.answer} isStudentView={true} />
                        </div>
                      )}

                      {sub.file && (
                        <div className="deliverable-file-box mt-10">
                          <FileText size={16} className="text-accent" />
                          <span>Deliverable: <strong>{sub.file}</strong></span>
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
                        <div className="student-grading-result-card mt-16 pt-14 border-top">
                          <span className="section-label mb-10">GRADING RESULT</span>

                          <div className="grading-details-grid">
                            <div className="grading-item-box">
                              <div className="grading-item-header">
                                <Award size={18} className="text-amber" />
                                <span className="grading-item-label">Marks Awarded</span>
                              </div>
                              <div className="grading-item-value marks-value">
                                <strong>{sub.marks}</strong> / {sub.assignment?.totalMarks || 100}
                              </div>
                            </div>

                            {sub.feedback && (
                              <div className="grading-item-box">
                                <div className="grading-item-header">
                                  <MessageSquare size={18} className="text-primary" />
                                  <span className="grading-item-label">Instructor Feedback</span>
                                </div>
                                <div className="grading-item-value feedback-value">
                                  "{sub.feedback}"
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentAssignments;
