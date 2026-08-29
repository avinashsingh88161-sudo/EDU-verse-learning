import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  CheckCircle,
  BookOpen,
  FileText,
  CheckSquare,
  HelpCircle,
  Award,
  CheckCheck,
  Loader2,
} from "lucide-react";

const Topbar = ({ pageTitle = "Dashboard", role = "student", onSearch }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  // Clear any legacy dark theme preference from storage
  useEffect(() => {
    localStorage.removeItem("eduverse_theme");
    document.documentElement.removeAttribute("data-theme");
  }, []);

  // Fetch notifications on mount & user change
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  // Click outside listener for closing dropdown panels
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search API trigger with 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setSearchLoading(true);
    setShowSearchDropdown(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data.results || []);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchResultClick = (targetRoute) => {
    setShowSearchDropdown(false);
    setSearchQuery("");
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.put(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
    setShowNotifications(false);
    if (notif.targetRoute) {
      navigate(notif.targetRoute);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (onSearch) onSearch(q);
  };


  const getResultIcon = (type) => {
    switch (type) {
      case "course":
        return <BookOpen size={16} className="text-primary" />;
      case "note":
        return <FileText size={16} className="text-purple" />;
      case "assignment":
        return <CheckSquare size={16} className="text-rose" />;
      case "quiz":
        return <HelpCircle size={16} className="text-accent" />;
      default:
        return <BookOpen size={16} />;
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "ASSIGNMENT_GRADED":
        return <Award size={16} className="text-emerald" />;
      case "NEW_ASSIGNMENT":
        return <CheckSquare size={16} className="text-rose" />;
      case "NEW_QUIZ":
        return <HelpCircle size={16} className="text-amber" />;
      case "NEW_NOTE":
        return <FileText size={16} className="text-purple" />;
      default:
        return <Bell size={16} className="text-primary" />;
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const effectiveRole = (user?.role || role || "").toLowerCase();
  const displayRoleLabel =
    effectiveRole === "admin"
      ? "Admin HOD"
      : effectiveRole === "teacher" || effectiveRole === "faculty"
      ? "Teacher"
      : "Student";

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() ||
    (effectiveRole === "admin" ? "A" : effectiveRole === "teacher" ? "T" : "S");

  return (
    <header className="app-topbar">
      {/* Title & Breadcrumb */}
      <div className="topbar-left">
        <h1 className="topbar-title">{pageTitle}</h1>
        <div className="topbar-breadcrumb">
          <span>EduVerse</span> / <span className="breadcrumb-active">{pageTitle}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="topbar-search" ref={searchRef}>
        <Search className="search-icon" size={16} />
        <input
          type="text"
          placeholder="Search courses, notes, assignments..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => {
            if (searchQuery.trim().length >= 2) setShowSearchDropdown(true);
          }}
        />
        <span className="search-shortcut-badge">⌘ K</span>

        {/* Search Results Dropdown Panel */}
        {showSearchDropdown && (
          <div className="search-dropdown-menu glass-card animate-fade-in">
            {searchLoading ? (
              <div className="search-loading-state">
                <Loader2 size={18} className="animate-spin text-primary" />
                <span>Searching academic content...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="search-empty-state">
                <p className="empty-title">No results found</p>
                <p className="empty-desc">
                  Try searching for another course, note, assignment, or quiz.
                </p>
              </div>
            ) : (
              <div className="search-results-list">
                <div className="search-results-header">
                  <span>Matching Results ({searchResults.length})</span>
                </div>
                {searchResults.map((res) => (
                  <button
                    key={`${res.type}-${res.id}`}
                    className="search-result-item"
                    onClick={() => handleSearchResultClick(res.targetRoute)}
                  >
                    <div className="result-icon-wrap">{getResultIcon(res.type)}</div>
                    <div className="result-info">
                      <div className="result-title-row">
                        <span className="result-title">{res.title}</span>
                        <span className={`result-type-chip chip-${res.type}`}>
                          {res.type}
                        </span>
                      </div>
                      <span className="result-subtitle">{res.subtitle}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="topbar-right">
        {/* Notifications */}
        <div className="notification-dropdown-wrap" ref={notifRef}>
          <button
            className={`topbar-action-btn ${showNotifications ? "active" : ""}`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
              setShowSearchDropdown(false);
            }}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-dot" />}
          </button>

          {showNotifications && (
            <div className="notifications-menu animate-fade-in">
              <div className="menu-header flex-between">
                <div className="notif-header-title">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="badge badge-rose">{unreadCount} new</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
                    <CheckCheck size={14} /> Mark all as read
                  </button>
                )}
              </div>

              <div className="notifications-list-wrapper">
                {notifications.length === 0 ? (
                  <div className="notifications-empty-state">
                    <CheckCircle size={24} className="text-muted" />
                    <p>No notifications yet.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif._id}
                      className={`notification-item ${!notif.isRead ? "unread" : ""}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="notif-icon-chip">{getNotifIcon(notif.type)}</div>
                      <div className="notif-content">
                        <div className="notif-title-row">
                          <strong className="notif-title">{notif.title}</strong>
                          <span className="notif-time">{formatTimeAgo(notif.createdAt)}</span>
                        </div>
                        <p className="notif-message">{notif.message}</p>
                      </div>
                      {!notif.isRead && <span className="unread-dot" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="profile-dropdown-wrap" ref={profileRef}>
          <button
            className={`profile-pill-btn ${showProfileMenu ? "active" : ""}`}
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
              setShowSearchDropdown(false);
            }}
          >
            <div className="avatar-chip">{userInitial}</div>
            <div className="profile-text-wrap">
              <span className="profile-display-name">{user?.name || "User"}</span>
              <span className="profile-role-tag">{displayRoleLabel}</span>
            </div>
            <ChevronDown size={14} className="profile-arrow" />
          </button>

          {showProfileMenu && (
            <div className="profile-menu animate-fade-in">
              <div className="profile-menu-header">
                <div className="profile-avatar-large">{userInitial}</div>
                <div className="profile-info-content">
                  <div className="profile-name-row">
                    <span className="profile-header-name">{user?.name || "User"}</span>
                    <span className={`profile-header-role-badge badge-${effectiveRole}`}>
                      {displayRoleLabel}
                    </span>
                  </div>
                  <span className="profile-header-email">{user?.email || "user@eduverse.com"}</span>
                </div>
              </div>

              <div className="profile-menu-divider" />

              <button className="profile-menu-item danger" onClick={handleLogout}>
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
