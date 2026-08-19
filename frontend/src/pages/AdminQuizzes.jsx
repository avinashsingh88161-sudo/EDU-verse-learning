import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { HelpCircle, Search } from "lucide-react";
import "./Dashboard.css";

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/quizzes");
      setQuizzes(res.data.quizzes || []);
    } catch (err) {
      console.error("Fetch admin quizzes error:", err);
      setError("Failed to load quizzes.");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="admin" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="All Campus Quizzes" role="admin" />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card flex-between">
            <div>
              <h2>Quiz Evaluations Oversight</h2>
              <p>Audit all multiple-choice quizzes created by faculty, question counts, and student attempt statistics.</p>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {/* Search Bar */}
          <div className="topbar-search max-w-full">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by quiz title, course, or faculty name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching campus quizzes..." />
          ) : filteredQuizzes.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              title="No quizzes found"
              description="No registered quizzes matching your search criteria."
            />
          ) : (
            <div className="dashboard-section-card glass-card overflow-x-auto">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Quiz Title</th>
                    <th>Course</th>
                    <th>Created By (Faculty)</th>
                    <th>Questions</th>
                    <th>Total Attempts</th>
                    <th>Status</th>
                    <th>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map((quiz) => (
                    <tr key={quiz._id}>
                      <td>
                        <strong>{quiz.title}</strong>
                      </td>
                      <td>
                        <span className="subject-chip">{quiz.course?.title || "N/A"}</span>
                      </td>
                      <td>
                        <div className="table-user-cell">
                          <strong>{quiz.teacher?.name || "Faculty"}</strong>
                          <span>{quiz.teacher?.email || "N/A"}</span>
                        </div>
                      </td>
                      <td>{quiz.questionsCount}</td>
                      <td>
                        <span className="badge badge-primary">{quiz.attemptsCount}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            quiz.isPublished ? "badge-success" : "badge-warning"
                          }`}
                        >
                          {quiz.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td>{new Date(quiz.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminQuizzes;
