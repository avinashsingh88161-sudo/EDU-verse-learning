import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { FileText, Download, BookOpen } from "lucide-react";
import "./Dashboard.css";

const StudentNotes = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/courses/enrolled");
        const list = res.data.courses || [];
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourseId(list[0]._id);
        }
      } catch (err) {
        console.error("Fetch enrolled error:", err);
        setError("Could not fetch enrolled courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setNotes([]);
      setFilteredNotes([]);
      return;
    }

    const fetchNotes = async () => {
      setLoadingNotes(true);
      try {
        const res = await api.get(`/notes/course/${selectedCourseId}`);
        const list = res.data.notes || [];
        setNotes(list);
        setFilteredNotes(list);
      } catch (err) {
        console.error("Fetch notes error:", err);
        setNotes([]);
        setFilteredNotes([]);
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [selectedCourseId]);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredNotes(notes);
    } else {
      const q = query.toLowerCase();
      setFilteredNotes(
        notes.filter(
          (n) =>
            n.title?.toLowerCase().includes(q) ||
            n.description?.toLowerCase().includes(q)
        )
      );
    }
  };

  const openNoteFile = (note) => {
    let url = note.fileUrl || note.pdfFile || "";
    if (url && url.startsWith("http")) {
      if (url.includes("cloudinary.com") && url.includes("/image/upload/") && url.toLowerCase().endsWith(".pdf")) {
        url = url.replace("/image/upload/", "/raw/upload/");
      }
      window.open(url, "_blank");
      return;
    }
    const token = localStorage.getItem("eduverse_token");
    const backendUrl = api.defaults.baseURL || "http://localhost:5000/api";
    window.open(`${backendUrl}/notes/${note._id}/file?token=${token}`, "_blank");
  };

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="student" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Notes & Documents" role="student" onSearch={handleSearch} />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card">
            <h2>Course Lecture Notes</h2>
            <p>Access downloadable reference documents, slides, and lecture notes published by your instructors.</p>

            {courses.length > 0 && (
              <div className="course-select-bar">
                <label>Select Enrolled Course:</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="course-dropdown"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.subject})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <LoadingSpinner message="Loading courses..." />
          ) : courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses enrolled"
              description="Enroll in a course first to access study notes."
            />
          ) : loadingNotes ? (
            <LoadingSpinner message="Loading course notes..." />
          ) : filteredNotes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No lecture notes found"
              description="Your instructor has not uploaded any notes for this course yet."
            />
          ) : (
            <div className="notes-grid-layout">
              {filteredNotes.map((note) => (
                <div key={note._id} className="note-card glass-card">
                  <div className="note-card-top">
                    <FileText size={28} className="text-primary" />
                    <span className="file-size-badge">PDF</span>
                  </div>
                  <h3 className="note-title">{note.title}</h3>
                  <p className="note-desc">{note.description || "Lecture PDF document"}</p>

                  <div className="note-card-footer">
                    <button
                      className="primary-action-btn full-width"
                      onClick={() => openNoteFile(note)}
                    >
                      <Download size={14} /> Open / Download PDF
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

export default StudentNotes;
