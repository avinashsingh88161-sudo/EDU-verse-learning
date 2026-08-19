import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import {
  Users,
  Search,
  Eye,
  Award,
  CheckSquare,
  BookOpen,
  Mail,
  Calendar,
  RefreshCw,
} from "lucide-react";
import "./Dashboard.css";

const TeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Student Details
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/teacher/students");
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Fetch teacher students error:", err);
      setError("Failed to load enrolled students directory.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (studentId) => {
    setSelectedStudentId(studentId);
    setIsModalOpen(true);
    setLoadingDetails(true);
    setDetailsError("");
    setStudentDetails(null);

    try {
      const res = await api.get(`/teacher/students/${studentId}`);
      setStudentDetails(res.data);
    } catch (err) {
      console.error("Fetch student details error:", err);
      setDetailsError(
        err.response?.data?.message || "Failed to load student detailed records."
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudentId(null);
    setStudentDetails(null);
    setDetailsError("");
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const courseTitles = (s.courses || []).map((c) => c.title).join(" ").toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      courseTitles.includes(q)
    );
  });

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="teacher" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Enrolled Students" role="teacher" />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card flex-between">
            <div>
              <h2>Course Enrolled Students Directory</h2>
              <p>
                Real-time academic performance, quiz evaluations, and deliverable submission history for students in your courses.
              </p>
            </div>
            <button
              type="button"
              className="secondary-action-btn sm"
              onClick={fetchStudents}
            >
              <RefreshCw size={14} /> Refresh Directory
            </button>
          </div>

          {error && (
            <div className="error-banner flex-between">
              <span>{error}</span>
              <button
                type="button"
                className="secondary-action-btn sm"
                onClick={fetchStudents}
              >
                Retry
              </button>
            </div>
          )}

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
            <LoadingSpinner message="Fetching enrolled students directory..." />
          ) : filteredStudents.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No enrolled students found"
              description="No students match your search filter or have registered for your courses yet."
            />
          ) : (
            <div className="dashboard-section-card glass-card overflow-x-auto">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Enrolled Course(s)</th>
                    <th>Quiz Attempts</th>
                    <th>Avg Quiz Score</th>
                    <th>Submissions</th>
                    <th>Enrollment Date</th>
                    <th>Actions</th>
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
                        <div className="flex-gap-xs">
                          {student.courses && student.courses.length > 0 ? (
                            student.courses.map((c) => (
                              <span key={c._id} className="subject-chip">
                                {c.title}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted">No courses</span>
                          )}
                        </div>
                      </td>
                      <td>{student.quizAttempts}</td>
                      <td>
                        {student.quizAttempts > 0 ? (
                          <span
                            className={`badge ${
                              student.averageQuizScore >= 70
                                ? "badge-success"
                                : student.averageQuizScore >= 50
                                ? "badge-warning"
                                : "badge-rose"
                            }`}
                          >
                            {student.averageQuizScore}%
                          </span>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>{student.assignmentSubmissions}</td>
                      <td>
                        {student.enrollmentDate
                          ? new Date(student.enrollmentDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="secondary-action-btn sm"
                          onClick={() => handleOpenDetails(student._id)}
                        >
                          <Eye size={14} /> View Details
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

      {/* Student Details Modal */}
      {isModalOpen && (
        <Modal title="Student Academic Record" onClose={closeModal}>
          {loadingDetails ? (
            <LoadingSpinner message="Fetching detailed academic history..." />
          ) : detailsError ? (
            <div className="error-banner">{detailsError}</div>
          ) : studentDetails ? (
            <div className="student-details-modal-content">
              {/* Profile Card */}
              <div className="glass-card inner-padding">
                <div className="modal-profile-header">
                  <div className="avatar-chip lg">
                    {studentDetails.student?.name
                      ? studentDetails.student.name.charAt(0).toUpperCase()
                      : "S"}
                  </div>
                  <div>
                    <h3 className="profile-name-title">
                      {studentDetails.student?.name}
                    </h3>
                    <p className="profile-email-sub flex-center-gap">
                      <Mail size={14} /> {studentDetails.student?.email}
                    </p>
                    <p className="profile-date-sub flex-center-gap">
                      <Calendar size={14} /> Registered:{" "}
                      {studentDetails.student?.createdAt
                        ? new Date(studentDetails.student.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="modal-section-divider" />

                {/* Enrolled Courses */}
                <div>
                  <h4 className="modal-section-subtitle flex-center-gap">
                    <BookOpen size={16} /> Enrolled Courses ({studentDetails.courses?.length || 0})
                  </h4>
                  <div className="chip-group-row">
                    {studentDetails.courses?.map((c) => (
                      <span key={c._id} className="subject-chip">
                        {c.title} ({c.subject})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quiz Performance Table */}
              <div className="modal-section-box">
                <h4 className="modal-section-subtitle flex-center-gap">
                  <Award size={16} /> Quiz Evaluation History
                </h4>
                {studentDetails.quizPerformance?.length === 0 ? (
                  <p className="empty-inline-text">No quiz attempts recorded for your courses.</p>
                ) : (
                  <table className="admin-data-table compact">
                    <thead>
                      <tr>
                        <th>Quiz Title</th>
                        <th>Course</th>
                        <th>Attempt Date</th>
                        <th>Score</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentDetails.quizPerformance?.map((qp) => (
                        <tr key={qp._id}>
                          <td>{qp.quizTitle}</td>
                          <td>{qp.courseTitle}</td>
                          <td>{new Date(qp.attemptDate).toLocaleDateString()}</td>
                          <td>
                            {qp.score} / {qp.totalQuestions}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                qp.percentage >= 70
                                  ? "badge-success"
                                  : qp.percentage >= 50
                                  ? "badge-warning"
                                  : "badge-rose"
                              }`}
                            >
                              {qp.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Assignment Submissions Table */}
              <div className="modal-section-box">
                <h4 className="modal-section-subtitle flex-center-gap">
                  <CheckSquare size={16} /> Assignment Submissions & Deliverables
                </h4>
                {studentDetails.assignments?.length === 0 ? (
                  <p className="empty-inline-text">No assignment submissions uploaded yet.</p>
                ) : (
                  <table className="admin-data-table compact">
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Course</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Marks</th>
                        <th>Teacher Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentDetails.assignments?.map((as) => (
                        <tr key={as._id}>
                          <td>{as.assignmentTitle}</td>
                          <td>{as.courseTitle}</td>
                          <td>{new Date(as.submissionDate).toLocaleDateString()}</td>
                          <td>
                            <span
                              className={`badge ${
                                as.status === "graded" ? "badge-success" : "badge-warning"
                              }`}
                            >
                              {as.status}
                            </span>
                          </td>
                          <td>
                            {as.marks !== null && as.marks !== undefined
                              ? `${as.marks} / ${as.totalMarks}`
                              : "Pending Review"}
                          </td>
                          <td>{as.feedback || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
};

export default TeacherStudents;
