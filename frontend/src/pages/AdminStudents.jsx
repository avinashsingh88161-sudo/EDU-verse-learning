import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { GraduationCap, Power, Search, Eye, BookOpen, Award, CheckSquare, Mail, Calendar } from "lucide-react";
import "./Dashboard.css";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Student Details
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleOpenDetails = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const courseTitles = (s.enrolledCourses || []).map((c) => c.title).join(" ").toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      courseTitles.includes(q)
    );
  });

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
              placeholder="Filter students by name, email, or enrolled course..."
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
                    <th>Enrolled Course(s)</th>
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
                        <div className="flex-gap-xs flex-wrap">
                          <span className="badge badge-primary font-700 mr-4">
                            {student.enrolledCount} {student.enrolledCount === 1 ? "Course" : "Courses"}
                          </span>
                          {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                            student.enrolledCourses.map((c) => (
                              <span key={c._id} className="subject-chip">
                                {c.title}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted fs-xs">None</span>
                          )}
                        </div>
                      </td>
                      <td>{student.quizAttemptsCount}</td>
                      <td>
                        {student.quizAttemptsCount > 0 ? (
                          <span
                            className={`badge ${
                              student.avgQuizScore >= 70
                                ? "badge-success"
                                : student.avgQuizScore >= 50
                                ? "badge-warning"
                                : "badge-rose"
                            }`}
                          >
                            {student.avgQuizScore}%
                          </span>
                        ) : (
                          <span className="text-muted fs-xs">N/A</span>
                        )}
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
                        <div className="flex-center gap-8">
                          <button
                            className="secondary-action-btn sm"
                            title="View Student Academic Record"
                            onClick={() => handleOpenDetails(student)}
                          >
                            <Eye size={14} /> View Details
                          </button>
                          <button
                            className={`secondary-action-btn sm ${
                              student.isActive ? "text-rose" : "text-emerald"
                            }`}
                            onClick={() => handleToggleStatus(student._id, student.isActive)}
                          >
                            <Power size={13} /> {student.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Student Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Student Academic Profile"
      >
        {selectedStudent && (
          <div className="student-details-modal-content p-16">
            <div className="glass-card inner-padding">
              <div className="modal-profile-header">
                <div className="avatar-chip lg">
                  {selectedStudent.name ? selectedStudent.name.charAt(0).toUpperCase() : "S"}
                </div>
                <div>
                  <h3 className="profile-name-title">{selectedStudent.name}</h3>
                  <p className="profile-email-sub flex-center-gap">
                    <Mail size={14} /> {selectedStudent.email}
                  </p>
                  <p className="profile-date-sub flex-center-gap">
                    <Calendar size={14} /> Registered:{" "}
                    {selectedStudent.createdAt
                      ? new Date(selectedStudent.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="modal-section-divider" />

              {/* Enrolled Courses list */}
              <div>
                <h4 className="modal-section-subtitle flex-center-gap">
                  <BookOpen size={16} /> Enrolled Courses ({selectedStudent.enrolledCount})
                </h4>
                {selectedStudent.enrolledCourses && selectedStudent.enrolledCourses.length > 0 ? (
                  <div className="chip-group-row mt-8">
                    {selectedStudent.enrolledCourses.map((c) => (
                      <span key={c._id} className="subject-chip">
                        {c.title} ({c.subject})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="empty-inline-text">Student has not enrolled in any courses yet.</p>
                )}
              </div>
            </div>

            {/* Performance Summary Metrics */}
            <div className="modal-section-box mt-16">
              <h4 className="modal-section-subtitle flex-center-gap">
                <Award size={16} /> Performance Metrics
              </h4>
              <div className="quiz-settings-grid">
                <div className="setting-box">
                  <span className="setting-label">Quiz Attempts</span>
                  <span className="setting-val">{selectedStudent.quizAttemptsCount}</span>
                </div>
                <div className="setting-box">
                  <span className="setting-label">Avg Quiz Score</span>
                  <span className="setting-val">{selectedStudent.avgQuizScore}%</span>
                </div>
                <div className="setting-box">
                  <span className="setting-label">Submissions</span>
                  <span className="setting-val">{selectedStudent.submissionsCount}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions-bar flex-end mt-20">
              <button
                type="button"
                className="secondary-action-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminStudents;
