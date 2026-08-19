import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { BookOpen, ArrowRight } from "lucide-react";
import "./Dashboard.css";

const MyCourses = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/courses/enrolled");
        const list = res.data.courses || [];
        setCourses(list);
        setFilteredCourses(list);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Could not load enrolled courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredCourses(courses);
    } else {
      const q = query.toLowerCase();
      setFilteredCourses(
        courses.filter(
          (c) =>
            c.title?.toLowerCase().includes(q) ||
            c.subject?.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q)
        )
      );
    }
  };

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="student" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="My Courses" role="student" onSearch={handleSearch} />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card">
            <h2>Enrolled Courses</h2>
            <p>Access learning materials, lecture notes, assignments, and quizzes for your enrolled modules.</p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <LoadingSpinner message="Fetching your enrolled courses..." />
          ) : filteredCourses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No enrolled courses"
              description={
                courses.length === 0
                  ? "You have not enrolled in any courses yet. Explore available catalog items to start."
                  : "No courses match your search criteria."
              }
              actionLabel={courses.length === 0 ? "Explore Available Courses" : null}
              onAction={courses.length === 0 ? () => navigate("/student/courses") : null}
            />
          ) : (
            <div className="courses-grid-layout">
              {filteredCourses.map((course) => (
                <div key={course._id} className="course-card glass-card">
                  <div className="course-card-top">
                    <span className="subject-chip">{course.subject || "Course"}</span>
                  </div>
                  <h3 className="course-card-title">{course.title}</h3>
                  <p className="course-card-desc">{course.description}</p>

                  <div className="course-card-footer">
                    <button
                      className="primary-action-btn full-width"
                      onClick={() => navigate(`/student/courses/${course._id}`)}
                    >
                      Open Course <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyCourses;
