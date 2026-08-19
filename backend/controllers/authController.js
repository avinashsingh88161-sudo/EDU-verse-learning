const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const TeacherRegistrationRequest = require("../models/TeacherRegistrationRequest");
const Notification = require("../models/Notification");

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password, role, department, facultyId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const requestedRole = (role || "").toLowerCase().trim();

    // PART 4 & 18: Disable public Admin creation
    if (requestedRole === "admin") {
      return res.status(403).json({
        success: false,
        message: "Public creation of Admin accounts is strictly forbidden.",
      });
    }

    if (!["student", "teacher", "faculty"].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email exists in User collection
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists in EduVerse.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // PART 6 & 8: Teacher Registration Approval Flow
    if (requestedRole === "teacher" || requestedRole === "faculty") {
      // PART 20: Prevent Duplicate Pending Teacher Registration Requests
      const existingPending = await TeacherRegistrationRequest.findOne({
        email: normalizedEmail,
        status: "pending",
      });

      if (existingPending) {
        return res.status(400).json({
          success: false,
          pending: true,
          message: "Your Teacher registration request is already pending Admin/HOD approval.",
        });
      }

      // Create Teacher Registration Request
      const teacherRequest = await TeacherRegistrationRequest.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        department: department || "Computer Science",
        facultyId: facultyId || "",
        status: "pending",
      });

      // PART 10: Persistent Admin Notification
      const adminUser = await User.findOne({ role: "admin" });
      if (adminUser) {
        await Notification.create({
          recipient: adminUser._id,
          type: "TEACHER_REGISTRATION_REQUEST",
          title: "🔔 New Teacher Registration Request",
          message: `${name} (${normalizedEmail}) has requested to register as a Teacher.`,
          referenceId: teacherRequest._id,
          targetRoute: "/admin/teachers",
        });
      }

      return res.status(202).json({
        success: true,
        pending: true,
        message: "Your Teacher registration request has been submitted and is pending Admin/HOD approval.",
        requestId: teacherRequest._id,
      });
    }

    // PART 7: Student Signup (Immediate Access)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
      isActive: true,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Student account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration.",
    });
  }
};

// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check active User collection first
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Your user account is deactivated.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const token = generateToken(user._id, user.role);

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subject: user.subject,
          teacherId: user.teacherId,
        },
      });
    }

    // PART 16 & 17: Check Pending or Rejected Teacher Requests
    const pendingOrRejectedRequest = await TeacherRegistrationRequest.findOne({
      email: normalizedEmail,
    }).sort({ createdAt: -1 });

    if (pendingOrRejectedRequest) {
      const isMatch = await bcrypt.compare(password, pendingOrRejectedRequest.password);

      if (isMatch) {
        if (pendingOrRejectedRequest.status === "pending") {
          return res.status(403).json({
            success: false,
            pending: true,
            message: "Your Teacher registration request is pending Admin/HOD approval.",
          });
        }

        if (pendingOrRejectedRequest.status === "rejected") {
          const reasonMessage = pendingOrRejectedRequest.rejectionReason
            ? ` Reason: ${pendingOrRejectedRequest.rejectionReason}`
            : "";
          return res.status(403).json({
            success: false,
            rejected: true,
            rejectionReason: pendingOrRejectedRequest.rejectionReason,
            message: `Your Teacher registration request was rejected.${reasonMessage}`,
          });
        }
      }
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject,
        teacherId: user.teacherId,
      },
    });
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  signup,
  login,
  getMe,
};
