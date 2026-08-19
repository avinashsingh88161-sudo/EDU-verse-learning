const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT token and authenticate user
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request (excluding password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// Restrict access based on user role (case-insensitive with role alias fallback)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "Access denied. User role not found.",
      });
    }

    const userRole = (req.user.role || "").toLowerCase().trim();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase().trim());

    // Expand teacher role aliases: "teacher", "faculty", "instructor", "admin"
    if (normalizedAllowed.includes("teacher")) {
      normalizedAllowed.push("faculty", "instructor", "admin");
    }

    // Expand student role aliases: "student", "admin"
    if (normalizedAllowed.includes("student")) {
      normalizedAllowed.push("admin");
    }

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You do not have permission to perform this action.",
      });
    }

    next();
  };
};

// Role-specific middleware
const teacherOnly = authorizeRoles("teacher");
const studentOnly = authorizeRoles("student");

module.exports = {
  protect,
  authorizeRoles,
  teacherOnly,
  studentOnly,
};
