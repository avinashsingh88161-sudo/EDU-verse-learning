import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { Users, Power, Search, CheckCircle, XCircle, Eye, UserPlus, Clock, UserCheck, Check, CheckCircle2 } from "lucide-react";
import "./Dashboard.css";

const AdminTeachers = () => {
  const [activeTab, setActiveTab] = useState("requests"); // "requests" | "directory"
  const [teachers, setTeachers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [teachersRes, requestsRes] = await Promise.all([
        api.get("/admin/teachers"),
        api.get("/admin/teacher-requests"),
      ]);
      setTeachers(teachersRes.data.teachers || []);
      setRequests(requestsRes.data.requests || []);
    } catch (err) {
      console.error("Fetch admin teachers error:", err);
      setError("Failed to load faculty and request records.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-status`);
      setTeachers((prev) =>
        prev.map((t) =>
          t._id === userId ? { ...t, isActive: res.data.isActive } : t
        )
      );
    } catch (err) {
      console.error("Toggle status error:", err);
      alert("Failed to update user status.");
    }
  };

  const openApproveModal = (reqItem) => {
    setSelectedRequest(reqItem);
    setIsApproveModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await api.put(`/admin/teacher-requests/${selectedRequest._id}/approve`);
      setSuccessMsg(res.data.message || "Teacher request approved successfully.");
      setIsApproveModalOpen(false);
      setSelectedRequest(null);
      await fetchData();
    } catch (err) {
      console.error("Approve error:", err);
      setError(err.response?.data?.message || "Failed to approve teacher request.");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (reqItem) => {
    setSelectedRequest(reqItem);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await api.put(`/admin/teacher-requests/${selectedRequest._id}/reject`, {
        rejectionReason,
      });
      setSuccessMsg(res.data.message || "Teacher request rejected.");
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      await fetchData();
    } catch (err) {
      console.error("Reject error:", err);
      setError(err.response?.data?.message || "Failed to reject teacher request.");
    } finally {
      setActionLoading(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");

  const filteredRequests = requests.filter(
    (r) =>
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.facultyId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teacherId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="admin" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="Faculty & Teachers Management" role="admin" />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card flex-between">
            <div>
              <h2>Faculty Members & Registration Requests</h2>
              <p>Review teacher registration requests, manage faculty access, and monitor teacher accounts.</p>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}
          {successMsg && <div className="success-banner">{successMsg}</div>}

          {/* Navigation Tabs */}
          <div className="admin-tab-bar mb-20 flex gap-12">
            <button
              className={`tab-btn ${activeTab === "requests" ? "active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              <UserPlus size={16} />
              <span>Teacher Requests</span>
              {pendingRequests.length > 0 && (
                <span className="tab-badge text-amber bg-amber-light">
                  {pendingRequests.length} Pending
                </span>
              )}
            </button>
            <button
              className={`tab-btn ${activeTab === "directory" ? "active" : ""}`}
              onClick={() => setActiveTab("directory")}
            >
              <Users size={16} />
              <span>Active Faculty Directory ({teachers.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="topbar-search max-w-full mb-16">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder={
                activeTab === "requests"
                  ? "Filter registration requests by name, email, or department..."
                  : "Filter teachers by name, email, subject, or ID..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <LoadingSpinner message="Loading faculty records..." />
          ) : activeTab === "requests" ? (
            filteredRequests.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No Teacher Registration Requests"
                description="There are currently no teacher registration requests requiring review."
              />
            ) : (
              <div className="dashboard-section-card glass-card overflow-x-auto">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Requested By</th>
                      <th>Department</th>
                      <th>Faculty ID</th>
                      <th>Submitted Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((reqItem) => (
                      <tr key={reqItem._id}>
                        <td>
                          <div className="table-user-cell">
                            <strong>{reqItem.name}</strong>
                            <span>{reqItem.email}</span>
                          </div>
                        </td>
                        <td>{reqItem.department || "Computer Science"}</td>
                        <td>
                          <span className="badge badge-accent">{reqItem.facultyId || "N/A"}</span>
                        </td>
                        <td>{new Date(reqItem.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`badge ${
                              reqItem.status === "approved"
                                ? "badge-success"
                                : reqItem.status === "rejected"
                                ? "badge-rose"
                                : "badge-warning"
                            }`}
                          >
                            {reqItem.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="flex-center gap-8">
                            <button
                              className="secondary-action-btn sm"
                              title="View Details"
                              onClick={() => {
                                setSelectedRequest(reqItem);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              <Eye size={14} /> View Details
                            </button>
                            {reqItem.status === "pending" && (
                              <>
                                <button
                                  className="action-btn success-btn sm"
                                  onClick={() => openApproveModal(reqItem)}
                                >
                                  <CheckCircle size={14} /> Accept
                                </button>
                                <button
                                  className="action-btn danger-btn sm"
                                  onClick={() => openRejectModal(reqItem)}
                                >
                                  <XCircle size={14} /> Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            filteredTeachers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No faculty members found"
                description="No registered teachers matching your search criteria."
              />
            ) : (
              <div className="dashboard-section-card glass-card overflow-x-auto">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Faculty Name</th>
                      <th>Teacher ID</th>
                      <th>Subject</th>
                      <th>Courses</th>
                      <th>Quizzes</th>
                      <th>Assignments</th>
                      <th>Total Students</th>
                      <th>Account Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher._id}>
                        <td>
                          <div className="table-user-cell">
                            <strong>{teacher.name}</strong>
                            <span>{teacher.email}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-accent">{teacher.teacherId || "N/A"}</span>
                        </td>
                        <td>{teacher.subject || "General"}</td>
                        <td>
                          <strong>{teacher.coursesCount}</strong>
                        </td>
                        <td>{teacher.quizzesCount}</td>
                        <td>{teacher.assignmentsCount}</td>
                        <td>
                          <span className="badge badge-primary">{teacher.totalEnrolledStudents}</span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              teacher.isActive ? "badge-success" : "badge-rose"
                            }`}
                          >
                            {teacher.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`secondary-action-btn sm ${
                              teacher.isActive ? "text-rose" : "text-emerald"
                            }`}
                            onClick={() => handleToggleStatus(teacher._id)}
                          >
                            <Power size={13} /> {teacher.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </main>
      </div>

      {/* View Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Teacher Registration Details"
      >
        {selectedRequest && (
          <div className="request-details-container p-16">
            <div className="detail-row mb-12">
              <label className="text-secondary font-500">Full Name:</label>
              <span className="font-600 ml-8">{selectedRequest.name}</span>
            </div>
            <div className="detail-row mb-12">
              <label className="text-secondary font-500">Email Address:</label>
              <span className="font-600 ml-8">{selectedRequest.email}</span>
            </div>
            <div className="detail-row mb-12">
              <label className="text-secondary font-500">Department:</label>
              <span className="font-600 ml-8">{selectedRequest.department || "N/A"}</span>
            </div>
            <div className="detail-row mb-12">
              <label className="text-secondary font-500">Faculty ID:</label>
              <span className="font-600 ml-8">{selectedRequest.facultyId || "Not Provided"}</span>
            </div>
            <div className="detail-row mb-12">
              <label className="text-secondary font-500">Submitted Date:</label>
              <span className="font-600 ml-8">
                {new Date(selectedRequest.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="detail-row mb-16">
              <label className="text-secondary font-500">Status:</label>
              <span
                className={`badge ml-8 ${
                  selectedRequest.status === "approved"
                    ? "badge-success"
                    : selectedRequest.status === "rejected"
                    ? "badge-rose"
                    : "badge-warning"
                }`}
              >
                {selectedRequest.status.toUpperCase()}
              </span>
            </div>
            {selectedRequest.rejectionReason && (
              <div className="detail-row mb-16 p-12 bg-rose-light rounded-8">
                <label className="text-rose font-600">Rejection Reason:</label>
                <p className="mt-4">{selectedRequest.rejectionReason}</p>
              </div>
            )}
            <div className="modal-actions-bar flex-end gap-12 mt-20">
              <button
                className="secondary-action-btn"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </button>
              {selectedRequest.status === "pending" && (
                <>
                  <button
                    className="action-btn danger-btn"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      openRejectModal(selectedRequest);
                    }}
                  >
                    Reject
                  </button>
                  <button
                    className="action-btn success-btn"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      openApproveModal(selectedRequest);
                    }}
                  >
                    Approve Teacher
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Accept Confirmation Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Teacher Registration"
        customClassName="approve-teacher-modal"
        headerIcon={<CheckCircle className="text-emerald" size={24} />}
      >
        {selectedRequest && (
          <div className="approve-modal-container">
            <p className="approve-question-text">
              Are you sure you want to approve this teacher?
            </p>

            <div className="teacher-info-box">
              <div className="teacher-info-avatar">
                <UserCheck size={22} />
              </div>
              <div className="teacher-info-content">
                <strong className="teacher-info-name">{selectedRequest.name}</strong>
                <span className="teacher-info-email">{selectedRequest.email}</span>
              </div>
            </div>

            <div className="approval-status-notice">
              <CheckCircle2 size={16} className="notice-icon" />
              <span>Teacher access will be enabled after approval. This will grant the user Teacher access to EduVerse.</span>
            </div>

            <div className="approve-modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setIsApproveModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-approve"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                <Check size={18} />
                {actionLoading ? "Approving..." : "Approve Teacher"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Teacher Registration"
      >
        {selectedRequest && (
          <div className="p-16">
            <p className="mb-12 text-main">
              Rejecting registration for <strong>{selectedRequest.name}</strong> (
              {selectedRequest.email}).
            </p>
            <div className="form-group mb-20">
              <label className="field-label mb-6 block font-500">
                Rejection Reason (Optional):
              </label>
              <textarea
                className="modal-textarea w-full p-10 border rounded-8"
                rows={3}
                placeholder="e.g. Faculty verification could not be completed."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              ></textarea>
            </div>
            <div className="modal-actions-bar flex-end gap-12">
              <button
                className="secondary-action-btn"
                onClick={() => setIsRejectModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="action-btn danger-btn"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminTeachers;
