import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#090d16",
          color: "#f8fafc",
          fontFamily: "var(--font-sans), sans-serif",
        }}
      >
        <p>Verifying Academic Session...</p>
      </div>
    );
  }

  // Not logged in -> send to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role strings
  let normalizedUserRole = (user?.role || "student").toLowerCase().trim();
  if (normalizedUserRole === "faculty") {
    normalizedUserRole = "teacher";
  }

  const normalizedAllowed = allowedRoles
    ? allowedRoles.map((r) => {
        const lower = r.toLowerCase().trim();
        return lower === "faculty" ? "teacher" : lower;
      })
    : null;

  // Logged in, but wrong role -> send to their role's dashboard!
  if (normalizedAllowed && !normalizedAllowed.includes(normalizedUserRole)) {
    let defaultDashboard = "/student/dashboard";
    if (normalizedUserRole === "admin") {
      defaultDashboard = "/admin/dashboard";
    } else if (normalizedUserRole === "teacher") {
      defaultDashboard = "/teacher/dashboard";
    }
    return <Navigate to={defaultDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
