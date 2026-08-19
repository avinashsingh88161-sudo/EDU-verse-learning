import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { Award, CheckSquare, Search } from "lucide-react";
import "./Dashboard.css";

const AdminResults = () => {
  const [activeTab, setActiveTab] = useState("quizzes");
  const [quizResults, setQuizResults] = useState([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/results");
      setQuizResults(res.data.quizResults || []);
      setAssignmentSubmissions(res.data.assignmentSubmissions || []);
    } catch (err) {
      console.error("Fetch admin results error:", err);
      setError("Failed to load campus results.");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizResults = quizResults.filter(
    (r) =>
      r.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.quiz?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.quiz?.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubmissions = assignmentSubmissions.filter(
    (s) =>
      s.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.assignment?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.assignment?.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="admin" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Academic Results Audit" role="admin" />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card flex-between">
            <div>
              <h2>Global Academic Results Audit</h2>
              <p>Audit student performance across all online quizzes and evaluated course assignments.</p>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {/* Tab Navigation */}
          <div className="tab-bar">
            <button
              className={`tab-btn ${activeTab === "quizzes" ? "active" : ""}`}
              onClick={() => setActiveTab("quizzes")}
            >
              <Award size={16} /> Quiz Attempt Scores ({quizResults.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "assignments" ? "active" : ""}`}
              onClick={() => setActiveTab("assignments")}
            >
              <CheckSquare size={16} /> Assignment Submissions & Grades ({assignmentSubmissions.length})
            </button>
          </div>

          {/* Search Filter */}
          <div className="topbar-search max-w-full">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Filter results by student name, quiz/assignment title, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching campus results..." />
          ) : activeTab === "quizzes" ? (
            filteredQuizResults.length === 0 ? (
              <EmptyState
                icon={Award}
                title="No quiz results found"
                description="No quiz attempt records matching your query."
              />
            ) : (
              <div className="dashboard-section-card glass-card overflow-x-auto">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Quiz Title</th>
                      <th>Course</th>
                      <th>Faculty</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuizResults.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <strong>{r.student?.name || "Student"}</strong>
                          <div className="text-muted text-xs">{r.student?.email}</div>
                        </td>
                        <td>{r.quiz?.title || "Quiz"}</td>
                        <td>
                          <span className="subject-chip">{r.quiz?.course?.title || "N/A"}</span>
                        </td>
                        <td>{r.quiz?.teacher?.name || "Faculty"}</td>
                        <td>
                          <strong>{r.score} / {r.totalQuestions}</strong>
                        </td>
                        <td>
                          <span className="badge badge-success">{r.percentage}%</span>
                        </td>
                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            filteredSubmissions.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="No assignment submissions found"
                description="No submission records matching your query."
              />
            ) : (
              <div className="dashboard-section-card glass-card overflow-x-auto">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Assignment Title</th>
                      <th>Course</th>
                      <th>Faculty</th>
                      <th>Marks</th>
                      <th>Status</th>
                      <th>Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((s) => (
                      <tr key={s._id}>
                        <td>
                          <strong>{s.student?.name || "Student"}</strong>
                          <div className="text-muted text-xs">{s.student?.email}</div>
                        </td>
                        <td>{s.assignment?.title || "Assignment"}</td>
                        <td>
                          <span className="subject-chip">{s.assignment?.course?.title || "N/A"}</span>
                        </td>
                        <td>{s.assignment?.teacher?.name || "Faculty"}</td>
                        <td>
                          {s.marks !== null ? (
                            <strong>{s.marks} / {s.assignment?.totalMarks || 0}</strong>
                          ) : (
                            <span className="text-muted">Not Graded</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              s.status === "graded" ? "badge-success" : "badge-warning"
                            }`}
                          >
                            {s.status === "graded" ? "Graded" : "Submitted"}
                          </span>
                        </td>
                        <td>{new Date(s.submittedAt || s.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminResults;
