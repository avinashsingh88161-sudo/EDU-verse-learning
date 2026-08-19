import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { FileText, Upload, Download, Trash2 } from "lucide-react";
import "./Dashboard.css";

const TeacherNotes = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [notes, setNotes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

      const myC = all.filter((c) => {
        const tId = (c.teacher?._id || c.teacher || "").toString();
        return tId === currentUserId || user?.role === "admin";
      });

      setCourses(myC);
      if (myC.length > 0) {
        setSelectedCourseId(myC[0]._id);
      }
    } catch (err) {
      console.error("Fetch teacher courses error:", err);
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCourseId) {
      setNotes([]);
      return;
    }

    const fetchNotes = async () => {
      setLoadingNotes(true);
      try {
        const res = await api.get(`/notes/course/${selectedCourseId}`);
        setNotes(res.data.notes || []);
      } catch (err) {
        console.error("Fetch notes error:", err);
        setNotes([]);
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [selectedCourseId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        setPdfFile(null);
        return;
      }
      setError("");
      setPdfFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setError("Please select a course.");
      return;
    }
    if (!noteTitle.trim()) {
      setError("Please enter a note title.");
      return;
    }
    if (!pdfFile) {
      setError("Please select a PDF file.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("title", noteTitle);
    formData.append("description", noteDesc);
    formData.append("course", selectedCourseId);
    formData.append("courseId", selectedCourseId);
    formData.append("file", pdfFile);
    formData.append("pdfFile", pdfFile);

    try {
      const res = await api.post("/notes", formData);

      setSuccessMsg("Upload successful!");
      setUploadModalOpen(false);
      setNoteTitle("");
      setNoteDesc("");
      setPdfFile(null);

      // Refresh notes list immediately
      if (res.data.note) {
        setNotes((prev) => [res.data.note, ...prev]);
      }
    } catch (err) {
      console.error("Upload note error:", err);
      setError(
        err.response?.data?.message || "Upload failed. Please check the file and try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const openNoteFile = (note) => {
    if (note.fileUrl && note.fileUrl.startsWith("http")) {
      window.open(note.fileUrl, "_blank");
      return;
    }
    const token = localStorage.getItem("eduverse_token");
    const backendUrl = api.defaults.baseURL || "http://localhost:5000/api";
    window.open(`${backendUrl}/notes/${note._id}/file?token=${token}`, "_blank");
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this lecture note?")) return;
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      setSuccessMsg("Note deleted successfully.");
    } catch (err) {
      console.error("Delete note error:", err);
      setError(err.response?.data?.message || "Failed to delete note.");
    }
  };

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="teacher" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Upload Notes" role="teacher" />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card flex-between">
            <div>
              <h2>Faculty Document Manager</h2>
              <p>Upload lecture slides, reading materials, and PDFs for your courses.</p>
              {courses.length > 0 && (
                <div className="course-select-bar mt-12">
                  <label>Select Course:</label>
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

            {courses.length > 0 && (
              <button className="primary-action-btn" onClick={() => setUploadModalOpen(true)}>
                <Upload size={16} /> Upload PDF Note
              </button>
            )}
          </div>

          {error && <div className="error-banner">{error}</div>}
          {successMsg && <div className="success-banner">{successMsg}</div>}

          {loading ? (
            <LoadingSpinner message="Fetching courses..." />
          ) : courses.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No courses created yet"
              description="Create a course first before uploading notes."
            />
          ) : loadingNotes ? (
            <LoadingSpinner message="Loading course notes..." />
          ) : notes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No notes uploaded for this course"
              description="Click 'Upload PDF Note' to add course lecture material."
              actionLabel="Upload PDF Note"
              onAction={() => setUploadModalOpen(true)}
            />
          ) : (
            <div className="notes-grid-layout">
              {notes.map((note) => (
                <div key={note._id} className="note-card glass-card">
                  <div className="note-card-top">
                    <FileText size={28} className="text-primary" />
                    <span className="file-size-badge">PDF</span>
                  </div>
                  <h3 className="note-title">{note.title}</h3>
                  <p className="note-desc">{note.description || "PDF Document"}</p>

                  <div className="note-card-footer flex-gap-8">
                    <button
                      className="primary-action-btn flex-1"
                      onClick={() => openNoteFile(note)}
                    >
                      <Download size={14} /> Open PDF
                    </button>
                    <button
                      className="danger-action-btn icon-only"
                      title="Delete Note"
                      onClick={() => handleDeleteNote(note._id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Modal */}
          <Modal
            isOpen={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            title="Upload Lecture Note PDF"
          >
            <form onSubmit={handleUpload} className="modal-form">
              <div className="form-group">
                <label>Target Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="course-dropdown full-width"
                  required
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="noteTitle">Document Title</label>
                <input
                  id="noteTitle"
                  type="text"
                  placeholder="e.g. Chapter 4 - Binary Trees"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="noteDesc">Description (Optional)</label>
                <textarea
                  id="noteDesc"
                  rows={3}
                  placeholder="Brief note description..."
                  value={noteDesc}
                  onChange={(e) => setNoteDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pdfFile">Choose PDF Document</label>
                <input
                  id="pdfFile"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="primary-action-btn full-width"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload PDF Note"}
              </button>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default TeacherNotes;
