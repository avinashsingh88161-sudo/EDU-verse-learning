import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, ArrowRight } from "lucide-react";
import "./Login.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "admin@eduverse.com",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", formData);
      const { user, token } = res.data;

      if (user.role !== "admin") {
        setError("Access denied. Authorized Admin/HOD account required.");
        setLoading(false);
        return;
      }

      login(user, token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Admin email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="brand-top">
          <div className="brand-logo">
            <ShieldCheck size={24} />
          </div>
          <span className="brand-name">EduVerse HOD</span>
        </div>

        <div className="brand-content">
          <span className="brand-eyebrow">Campus Administration</span>
          <h1>
            Head of Department
            <br />
            <span>Control Panel.</span>
          </h1>
          <p className="brand-description">
            Centralized portal for managing campus faculty, monitoring student academic progress, auditing course content, and governing evaluations.
          </p>
        </div>

        <div className="brand-footer">EduVerse HOD Governance System</div>
      </div>

      <div className="login-panel">
        <div className="login-card glass-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <span className="login-eyebrow">HOD / Admin Portal</span>
            <h2>Sign in as Admin</h2>
            <p className="login-subtitle">Enter HOD administrative credentials to continue.</p>

            {error && <div className="login-error-banner">{error}</div>}

            <div className="login-field">
              <label htmlFor="email">Administrative Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="admin@eduverse.com"
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
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? "Authenticating..." : "Access Admin Panel"} <ArrowRight size={16} />
            </button>

            <p className="login-switch">
              Standard User? <Link to="/login">Go to Standard Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
