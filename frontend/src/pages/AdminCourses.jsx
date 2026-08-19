import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { BookOpen, Search } from "lucide-react";
import "./Dashboard.css";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/courses");
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error("Fetch admin courses error:", err);
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="admin" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="All Campus Courses" role="admin" />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card flex-between">
            <div>
              <h2>Course Catalog Oversight</h2>
              <p>Audit all published academic courses, faculty ownership, enrolled students count, and learning resources.</p>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {/* Search Bar */}
          <div className="topbar-search max-w-full">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by course title, subject, or faculty name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching campus courses..." />
          ) : filteredCourses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses found"
              description="No registered courses matching your search criteria."
            />
          ) : (
            <div className="dashboard-section-card glass-card overflow-x-auto">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th>Subject</th>
                    <th>Created By (Faculty)</th>
                    <th>Enrolled Students</th>
                    <th>Notes</th>
                    <th>Quizzes</th>
                    <th>Assignments</th>
                    <th>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course._id}>
                      <td>
                        <strong>{course.title}</strong>
                      </td>
                      <td>
                        <span className="subject-chip">{course.subject}</span>
                      </td>
                      <td>
                        <div className="table-user-cell">
                          <strong>{course.teacher?.name || "Faculty Member"}</strong>
                          <span>{course.teacher?.email || "N/A"}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{course.studentsCount}</span>
                      </td>
                      <td>{course.notesCount}</td>
                      <td>{course.quizzesCount}</td>
                      <td>{course.assignmentsCount}</td>
                      <td>{new Date(course.createdAt).toLocaleDateString()}</td>
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

export default AdminCourses;
