import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { BookOpen, PlusCircle, Edit3, Trash2 } from "lucide-react";
import "./Dashboard.css";

const TeacherCourses = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMyCourses();
  }, [user]);

  const fetchMyCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/courses");
      const all = res.data.courses || [];
      const currentUserId = (user?._id || user?.id || "").toString();

      setCourses(
        all.filter((c) => {
          const tId = (c.teacher?._id || c.teacher || "").toString();
          return tId === currentUserId || user?.role === "admin";
        })
      );
    } catch (err) {
      console.error("Fetch teacher courses error:", err);
      if (err.response?.status === 403) {
        setError("Access Denied (403): You do not have permission to view faculty courses.");
      } else {
        setError("Failed to load courses.");
      }
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({ title: "", subject: "", description: "" });
    setModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      subject: course.subject,
      description: course.description,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse._id}`, formData);
        setSuccessMsg("Course updated successfully!");
      } else {
        await api.post("/courses", formData);
        setSuccessMsg("Course created successfully!");
      }
      setModalOpen(false);
      fetchMyCourses();
    } catch (err) {
      console.error("Save course error:", err);
      if (err.response?.status === 403) {
        setError(
          "Access Denied (403): Your account does not have Faculty/Teacher permissions to create courses."
        );
      } else {
        setError(err.response?.data?.message || "Failed to save course.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    setError("");
    setSuccessMsg("");
    try {
      await api.delete(`/courses/${courseId}`);
      setSuccessMsg("Course deleted successfully.");
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (err) {
      console.error("Delete course error:", err);
      if (err.response?.status === 403) {
        setError("Access Denied (403): Permission denied to delete this course.");
      } else {
        setError(err.response?.data?.message || "Failed to delete course.");
      }
    }
  };

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="teacher" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Manage Courses" role="teacher" />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card flex-between">
            <div>
              <h2>Faculty Course Management</h2>
              <p>Design learning paths, edit course information, and manage student offerings.</p>
            </div>
            <button className="primary-action-btn" onClick={openCreateModal}>
              <PlusCircle size={16} /> Create Course
            </button>
          </div>

          {error && <div className="error-banner">{error}</div>}
          {successMsg && <div className="success-banner">{successMsg}</div>}

          {loading ? (
            <LoadingSpinner message="Fetching your courses..." />
          ) : courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses created yet"
              description="Click 'Create Course' to add your first course module."
              actionLabel="Create Course"
              onAction={openCreateModal}
            />
          ) : (
            <div className="courses-grid-layout">
              {courses.map((course) => (
                <div key={course._id} className="course-card glass-card">
                  <div className="course-card-top">
                    <span className="subject-chip">{course.subject}</span>
                  </div>
                  <h3 className="course-card-title">{course.title}</h3>
                  <p className="course-card-desc">{course.description}</p>

                  <div className="course-card-footer flex-gap">
                    <button
                      className="secondary-action-btn sm flex-1"
                      onClick={() => openEditModal(course)}
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      className="danger-action-btn sm flex-1"
                      onClick={() => handleDelete(course._id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal for Create/Edit Course */}
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editingCourse ? "Edit Course" : "Create New Course"}
          >
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Course Title</label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Data Structures & Algorithms"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject / Department</label>
                <input
                  id="subject"
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Course Description</label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Enter detailed description of course objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="primary-action-btn full-width"
                disabled={saving}
              >
                {saving ? "Saving Course..." : editingCourse ? "Update Course" : "Create Course"}
              </button>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default TeacherCourses;
