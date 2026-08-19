import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { BookOpen, FileText, HelpCircle, CheckSquare, TrendingUp, Settings, Sparkles, PlusCircle } from "lucide-react";
import "./Dashboard.css";

const FeaturePage = ({ title = "Module", role = "student", icon: Icon = FileText, description = "Manage your module content and resources." }) => {
  return (
    <div className="dashboard-layout-container">
      <Sidebar role={role} />

      <div className="dashboard-main-wrapper">
        <Topbar pageTitle={title} role={role} />

        <main className="dashboard-content-body">
          {/* Header Banner */}
          <div className="welcome-banner-card glass-card">
            <div className="welcome-banner-glow" />
            <div className="welcome-banner-content">
              <div className="welcome-eyebrow">
                <span className="badge badge-accent">
                  <Sparkles size={13} /> EDUVERSE MODULE
                </span>
              </div>
              <h1 className="welcome-title">
                {title} <span className="text-gradient-primary">Portal</span>
              </h1>
              <p className="welcome-subtitle">{description}</p>
            </div>
          </div>

          {/* Main Feature Content Card */}
          <div className="dashboard-section-card glass-card" style={{ minHeight: "360px" }}>
            <div className="section-header">
              <div>
                <h2 className="section-title">{title} Workspace</h2>
                <p className="section-subtitle">All active resources, files, and tools for {title.toLowerCase()}.</p>
              </div>
              <button className="primary-action-btn sm">
                <PlusCircle size={15} /> Add New {title.slice(0, -1)}
              </button>
            </div>

            <div className="empty-courses-state">
              <div className="empty-icon-wrap" style={{ width: "64px", height: "64px", background: "rgba(99, 102, 241, 0.15)", color: "var(--brand-primary)" }}>
                <Icon size={32} />
              </div>
              <h3 style={{ fontSize: "1.1rem", marginTop: "8px" }}>{title} Dashboard Ready</h3>
              <p style={{ maxWidth: "420px" }}>
                All your {title.toLowerCase()} materials are synced and ready. Select a course or filter by subject to view detailed records.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FeaturePage;
