require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const seedDemoUsers = require("./seed/seedDemoUsers");
const seedTeachers = require("./seed/seedTeacher");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const noteRoutes = require("./routes/noteRoutes");
const quizRoutes = require("./routes/quizRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const assignmentSubmissionRoutes = require("./routes/assignmentSubmissionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const searchRoutes = require("./routes/searchRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Connect to MongoDB and seed default demo accounts & Teachers asynchronously in background
connectDB().then(() => {
  Promise.all([seedDemoUsers(), seedTeachers()]).catch((err) =>
    console.error("Background seeding warning:", err.message)
  );
});

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Fast Health Check Endpoints (Warm-up support)
app.get(["/health", "/api/health"], (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: "EduVerse API is live and healthy",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/assignment-submissions", assignmentSubmissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("EduVerse API is running...");
});

// Handle Unknown Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Keep-alive mechanism to prevent Render free tier instance from sleeping during usage
  const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
  if (keepAliveUrl && process.env.NODE_ENV === "production") {
    const pingTarget = keepAliveUrl.replace(/\/+$/, "") + "/health";
    console.log(`📡 Initialized keep-alive ping worker for: ${pingTarget}`);
    // Ping every 13 minutes (Render sleeps after 15 min inactivity)
    setInterval(async () => {
      try {
        const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
        await fetch(pingTarget);
        console.log(`💓 Keep-alive ping dispatched to ${pingTarget}`);
      } catch (pingErr) {
        // Silent catch for network hiccups
      }
    }, 13 * 60 * 1000);
  }
});
