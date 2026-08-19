import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { CheckSquare, Search } from "lucide-react";
import "./Dashboard.css";

const AdminAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/assignments");
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error("Fetch admin assignments error:", err);
      setError("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(
    (a) =>
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="admin" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="All Campus Assignments" role="admin" />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card flex-between">
            <div>
              <h2>Assignment Tasks Oversight</h2>
              <p>Audit all course deliverables, faculty assignment postings, student submission counts, and due dates.</p>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {/* Search Bar */}
          <div className="topbar-search max-w-full">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by assignment title, course, or faculty name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching campus assignments..." />
          ) : filteredAssignments.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No assignments found"
              description="No registered assignments matching your search criteria."
            />
          ) : (
            <div className="dashboard-section-card glass-card overflow-x-auto">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Assignment Title</th>
                    <th>Course</th>
                    <th>Created By (Faculty)</th>
                    <th>Total Marks</th>
                    <th>Submissions</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assign) => (
                    <tr key={assign._id}>
                      <td>
                        <strong>{assign.title}</strong>
                      </td>
                      <td>
                        <span className="subject-chip">{assign.course?.title || "N/A"}</span>
                      </td>
                      <td>
                        <div className="table-user-cell">
                          <strong>{assign.teacher?.name || "Faculty"}</strong>
                          <span>{assign.teacher?.email || "N/A"}</span>
                        </div>
                      </td>
                      <td>{assign.totalMarks} Marks</td>
                      <td>
                        <span className="badge badge-primary">{assign.submissionsCount}</span>
                      </td>
                      <td>{new Date(assign.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            assign.isPublished ? "badge-success" : "badge-warning"
                          }`}
                        >
                          {assign.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
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

export default AdminAssignments;
