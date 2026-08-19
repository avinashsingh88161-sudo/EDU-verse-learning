import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { GraduationCap, Power, Search } from "lucide-react";
import "./Dashboard.css";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/students");
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Fetch admin students error:", err);
      setError("Failed to load student directory.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-status`);
      setStudents((prev) =>
        prev.map((s) =>
          s._id === userId ? { ...s, isActive: res.data.isActive } : s
        )
      );
    } catch (err) {
      console.error("Toggle status error:", err);
      alert("Failed to update student status.");
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="admin" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Student Records & Management" role="admin" />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card flex-between">
            <div>
              <h2>Campus Student Directory</h2>
              <p>Monitor student course enrollments, quiz evaluation scores, assignment submissions, and manage account status.</p>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {/* Search Bar */}
          <div className="topbar-search max-w-full">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Filter students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching student records..." />
          ) : filteredStudents.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No student records found"
              description="No registered students matching your search criteria."
            />
          ) : (
            <div className="dashboard-section-card glass-card overflow-x-auto">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Enrolled Courses</th>
                    <th>Quiz Attempts</th>
                    <th>Avg Quiz Score</th>
                    <th>Submissions</th>
                    <th>Joined Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td>
                        <strong>{student.name}</strong>
                      </td>
                      <td>{student.email}</td>
                      <td>
                        <span className="badge badge-primary">{student.enrolledCount}</span>
                      </td>
                      <td>{student.quizAttemptsCount}</td>
                      <td>
                        <span className="badge badge-success">{student.avgQuizScore}%</span>
                      </td>
                      <td>{student.submissionsCount}</td>
                      <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            student.isActive ? "badge-success" : "badge-rose"
                          }`}
                        >
                          {student.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`secondary-action-btn sm ${
                            student.isActive ? "text-rose" : "text-emerald"
                          }`}
                          onClick={() => handleToggleStatus(student._id, student.isActive)}
                        >
                          <Power size={13} /> {student.isActive ? "Deactivate" : "Activate"}
                        </button>
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

export default AdminStudents;
