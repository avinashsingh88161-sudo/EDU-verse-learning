import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { BookOpen, Check, UserCheck } from "lucide-react";
import "./Dashboard.css";

const ExploreCourses = () => {
  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [allRes, enrolledRes] = await Promise.all([
          api.get("/courses"),
          api.get("/courses/enrolled"),
        ]);

        const list = allRes.data.courses || [];
        const enrolledList = enrolledRes.data.courses || [];
        const enrolledIds = new Set(enrolledList.map((c) => c._id));

        setAllCourses(list);
        setFilteredCourses(list);
        setEnrolledCourseIds(enrolledIds);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setError("Could not load course catalog.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredCourses(allCourses);
    } else {
      const q = query.toLowerCase();
      setFilteredCourses(
        allCourses.filter(
          (c) =>
            c.title?.toLowerCase().includes(q) ||
            c.subject?.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q)
        )
      );
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    setError("");
    setSuccessMsg("");

    try {
      await api.post(`/courses/${courseId}/enroll`);
      setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
      setSuccessMsg("Enrolled in course successfully!");
    } catch (err) {
      console.error("Enroll error:", err);
      setError(err.response?.data?.message || "Failed to enroll in course.");
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="student" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Explore Courses" role="student" onSearch={handleSearch} />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card">
            <h2>Course Catalog</h2>
            <p>Browse available faculty-designed courses and enroll to gain full access to course materials, quizzes, and assignments.</p>
          </div>

          {error && <div className="error-banner">{error}</div>}
          {successMsg && <div className="success-banner">{successMsg}</div>}

          {loading ? (
            <LoadingSpinner message="Fetching course catalog..." />
          ) : filteredCourses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses found"
              description="There are currently no courses matching your query."
            />
          ) : (
            <div className="courses-grid-layout">
              {filteredCourses.map((course) => {
                const isEnrolled = enrolledCourseIds.has(course._id);
                const isEnrolling = enrollingId === course._id;

                return (
                  <div key={course._id} className="course-card glass-card">
                    <div className="course-card-top">
                      <span className="subject-chip">{course.subject || "General"}</span>
                      {course.teacher?.name && (
                        <span className="instructor-badge">
                          <UserCheck size={12} /> {course.teacher.name}
                        </span>
                      )}
                    </div>

                    <h3 className="course-card-title">{course.title}</h3>
                    <p className="course-card-desc">{course.description}</p>

                    <div className="course-card-footer">
                      {isEnrolled ? (
                        <button
                          className="secondary-action-btn full-width"
                          onClick={() => navigate(`/student/courses/${course._id}`)}
                        >
                          <Check size={14} /> Enrolled (Open)
                        </button>
                      ) : (
                        <button
                          className="primary-action-btn full-width"
                          onClick={() => handleEnroll(course._id)}
                          disabled={isEnrolling}
                        >
                          {isEnrolling ? "Enrolling..." : "Enroll in Course"}
                        </button>
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

export default ExploreCourses;
