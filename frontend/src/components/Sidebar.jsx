import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  FileText,
  HelpCircle,
  CheckSquare,
  TrendingUp,
  Settings,
  LogOut,
  GraduationCap,
  Users,
  Award,
  Activity,
  ClipboardList,
} from "lucide-react";

const Sidebar = ({ role = "student" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentRole = role || user?.role || "student";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const adminNavItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Faculty & Teachers", path: "/admin/teachers", icon: Users },
    { label: "Students", path: "/admin/students", icon: GraduationCap },
    { label: "All Courses", path: "/admin/courses", icon: BookOpen },
    { label: "All Quizzes", path: "/admin/quizzes", icon: HelpCircle },
    { label: "All Assignments", path: "/admin/assignments", icon: CheckSquare },
    { label: "Academic Results", path: "/admin/results", icon: Award },
    { label: "System Activity", path: "/admin/activity", icon: Activity },
  ];

  const teacherNavItems = [
    { label: "Dashboard", path: "/teacher/dashboard", icon: LayoutDashboard },
    { label: "My Courses", path: "/teacher/courses", icon: BookOpen },
    { label: "Enrolled Students", path: "/teacher/students", icon: Users },
    { label: "Upload Notes", path: "/teacher/notes", icon: FileText },
    { label: "Quizzes", path: "/teacher/quizzes", icon: HelpCircle },
    { label: "Assignments", path: "/teacher/assignments", icon: CheckSquare },
    { label: "Submissions", path: "/teacher/submissions", icon: ClipboardList },
  ];

  const studentNavItems = [
    { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Courses", path: "/student/my-courses", icon: BookOpen },
    { label: "Explore Courses", path: "/student/courses", icon: Compass },
    { label: "Notes & Docs", path: "/student/notes", icon: FileText },
    { label: "Quizzes", path: "/student/quizzes", icon: HelpCircle },
    { label: "Assignments", path: "/student/assignments", icon: CheckSquare },
    { label: "My Progress", path: "/student/progress", icon: TrendingUp },
  ];

  const navItems =
    currentRole === "admin"
      ? adminNavItems
      : currentRole === "teacher" || currentRole === "faculty"
      ? teacherNavItems
      : studentNavItems;

  const defaultPath =
    currentRole === "admin"
      ? "/admin/dashboard"
      : currentRole === "teacher" || currentRole === "faculty"
      ? "/teacher/dashboard"
      : "/student/dashboard";

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand" onClick={() => navigate(defaultPath)}>
        <div className="brand-logo-glow">
          <GraduationCap className="brand-icon" size={24} />
        </div>
        <div className="brand-text">
          <span className="brand-name">
            Edu<span className="brand-highlight">Verse</span>
          </span>
          <span className="brand-badge">
            {currentRole === "admin"
              ? "ADMIN / HOD"
              : currentRole === "teacher" || currentRole === "faculty"
              ? "FACULTY PORTAL"
              : "STUDENT PORTAL"}
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-menu">
        <div className="menu-section-label">
          {currentRole === "admin"
            ? "ADMINISTRATION"
            : currentRole === "teacher" || currentRole === "faculty"
            ? "FACULTY NAVIGATION"
            : "ACADEMIC NAVIGATION"}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {isActive && <div className="active-pill" />}
              <Icon className="link-icon" size={18} />
              <span className="link-text">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Account */}
      <div className="sidebar-footer">
        <div className="user-profile-pill">
          <div className="profile-avatar-circle">
            {user?.name?.charAt(0)?.toUpperCase() ||
              (currentRole === "admin"
                ? "A"
                : currentRole === "teacher" || currentRole === "faculty"
                ? "F"
                : "S")}
          </div>
          <div className="profile-details">
            <span className="profile-name">{user?.name || "User"}</span>
            <span className="profile-email">{user?.email || "user@eduverse.com"}</span>
          </div>
          <button className="logout-icon-btn" title="Logout" onClick={handleLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
