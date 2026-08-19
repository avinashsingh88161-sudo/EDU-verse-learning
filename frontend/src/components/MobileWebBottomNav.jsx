import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  BookOpen,
  CheckSquare,
  Bell,
  User,
  HelpCircle,
  Users,
} from "lucide-react";

const MobileWebBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const role = (user?.role || "student").toLowerCase();

  const studentTabs = [
    { label: "Home", path: "/student/dashboard", icon: Home },
    { label: "Courses", path: "/student/my-courses", icon: BookOpen },
    { label: "Tasks", path: "/student/assignments", icon: CheckSquare },
    { label: "Progress", path: "/student/progress", icon: HelpCircle },
    { label: "Profile", path: "#profile", isProfileTrigger: true, icon: User },
  ];

  const teacherTabs = [
    { label: "Home", path: "/teacher/dashboard", icon: Home },
    { label: "Courses", path: "/teacher/courses", icon: BookOpen },
    { label: "Tasks", path: "/teacher/assignments", icon: CheckSquare },
    { label: "Students", path: "/teacher/students", icon: Users },
    { label: "Profile", path: "#profile", isProfileTrigger: true, icon: User },
  ];

  const adminTabs = [
    { label: "Home", path: "/admin/dashboard", icon: Home },
    { label: "Teachers", path: "/admin/teachers", icon: Users },
    { label: "Students", path: "/admin/students", icon: Users },
    { label: "Courses", path: "/admin/courses", icon: BookOpen },
    { label: "Profile", path: "#profile", isProfileTrigger: true, icon: User },
  ];

  const tabs =
    role === "admin"
      ? adminTabs
      : role === "teacher" || role === "faculty"
      ? teacherTabs
      : studentTabs;

  const handleTabClick = (tab) => {
    if (tab.isProfileTrigger) {
      // Scroll to top or trigger profile panel
      window.scrollTo({ top: 0, behavior: "smooth" });
      const profileBtn = document.querySelector(".profile-pill-btn");
      if (profileBtn) profileBtn.click();
    } else {
      navigate(tab.path);
    }
  };

  return (
    <nav className="mobile-web-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;

        return (
          <button
            key={tab.label}
            className={`mobile-tab-item ${isActive ? "active" : ""}`}
            onClick={() => handleTabClick(tab)}
          >
            <Icon size={20} className="tab-icon" />
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileWebBottomNav;
