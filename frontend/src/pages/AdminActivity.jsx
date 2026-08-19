import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { Activity, Clock } from "lucide-react";
import "./Dashboard.css";

const AdminActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/activity");
      setActivities(res.data.activities || []);
    } catch (err) {
      console.error("Fetch activity error:", err);
      setError("Failed to load audit activity feed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout-container">
      <Sidebar role="admin" />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle="System Activity Audit Log" role="admin" />

        <main className="dashboard-content-body">
          <div className="page-header-card glass-card flex-between">
            <div>
              <h2>System Audit & Event Feed</h2>
              <p>Audit user registrations, course publications, quiz attempts, and student deliverable submissions.</p>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <LoadingSpinner message="Loading audit feed..." />
          ) : activities.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity recorded yet"
              description="System event log is currently empty."
            />
          ) : (
            <div className="dashboard-section-card glass-card">
              <div className="side-list">
                {activities.map((item) => (
                  <div key={item.id} className="side-item">
                    <div className="side-item-content">
                      <h4>{item.message}</h4>
                      <span className="side-item-sub">
                        <Clock size={12} className="inline mr-1" />
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <span className="badge badge-accent">{item.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminActivity;
