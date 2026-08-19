import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, ArrowRight, UserCheck, BookOpen, ShieldCheck } from "lucide-react";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fillQuickAccount = (email, password) => {
    setFormData({ email, password });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", formData);
      const { user, token } = res.data;

      login(user, token);

      const userRole = (user.role || "").toLowerCase();
      if (userRole === "teacher" || userRole === "faculty") {
        navigate("/teacher/dashboard", { replace: true });
      } else if (userRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/student/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || "Invalid email or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Branding Section */}
      <div className="login-brand">
        <div className="brand-top">
          <div className="brand-logo">
            <GraduationCap size={24} />
          </div>
          <span className="brand-name">EduVerse</span>
        </div>

        <div className="brand-content">
          <span className="brand-eyebrow">Academic Learning Portal</span>
          <h1>
            Empowering Campus
            <br />
            <span>Education.</span>
          </h1>
          <p className="brand-description">
            Access your registered courses, lecture notes, assignments, and online quizzes through a centralized platform.
          </p>
        </div>

        <div className="brand-footer">EduVerse Academic LMS</div>
      </div>

      {/* Right Login Form */}
      <div className="login-panel">
        <div className="login-card glass-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <span className="login-eyebrow">Account Access</span>
            <h2>Sign in to EduVerse</h2>
            <p className="login-subtitle">Enter your institutional email and password to continue.</p>

            {/* Quick Fill Demo Selector */}
            <div className="quick-demo-accounts mt-10 mb-16">
              <span className="quick-demo-label">Quick Account Select:</span>
              <div className="quick-demo-pills">
                <button
                  type="button"
                  className="demo-pill student"
                  onClick={() => fillQuickAccount("ashutosh123@gmail.com", "Avinash@123")}
                >
                  <BookOpen size={12} /> Student Account
                </button>
                <button
                  type="button"
                  className="demo-pill teacher"
                  onClick={() => fillQuickAccount("avinashsingh88161@gmail.com", "Avinash@123")}
                >
                  <UserCheck size={12} /> Faculty / Teacher
                </button>
                <button
                  type="button"
                  className="demo-pill admin"
                  onClick={() => fillQuickAccount("admin@eduverse.com", "Admin@123")}
                >
                  <ShieldCheck size={12} /> Admin HOD
                </button>
              </div>
            </div>

            {error && <div className="login-error-banner">{error}</div>}

            <div className="login-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="student@college.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In"} <ArrowRight size={16} />
            </button>

            <p className="login-switch">
              Don't have an account? <Link to="/signup">Register now</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
