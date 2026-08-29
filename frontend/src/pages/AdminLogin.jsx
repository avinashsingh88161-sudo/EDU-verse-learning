import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { warmupBackend } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, ArrowRight, Loader2, Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react";
import "./LandingPage.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSlowAuth, setIsSlowAuth] = useState(false);

  useEffect(() => {
    warmupBackend();
  }, []);

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
    setIsSlowAuth(false);

    const timer = setTimeout(() => {
      setIsSlowAuth(true);
    }, 2500);

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
      clearTimeout(timer);
      setIsSlowAuth(false);
      setLoading(false);
    }
  };

  return (
    <div className="mint-auth-page-root">
      <div className="mint-bg-orb orb-emerald-1"></div>
      <div className="mint-bg-orb orb-emerald-2"></div>

      <div className="mint-auth-card-wrapper animate-fade-in">
        <div className="mint-auth-card">
          <div className="mint-card-logo-badge" style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" }}>
            <ShieldCheck size={28} className="mint-brand-icon" />
          </div>

          <div className="mint-card-header">
            <h1>Admin / HOD Portal</h1>
            <p>Enter institutional governance credentials</p>
          </div>

          {error && <div className="mint-error-banner">{error}</div>}

          <form className="mint-auth-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="mint-form-field">
              <label htmlFor="admin-email">ADMIN EMAIL</label>
              <div className="mint-input-wrapper">
                <Mail size={18} className="mint-input-icon" />
                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  placeholder="admin@eduverse.com"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={warmupBackend}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className="mint-form-field">
              <label htmlFor="admin-password">PASSWORD</label>
              <div className="mint-input-wrapper">
                <Lock size={18} className="mint-input-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={warmupBackend}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="mint-pw-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="mint-primary-btn" disabled={loading} style={{ background: "#0284c7" }}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spin-icon" /> Authenticating...
                </>
              ) : (
                <>
                  Access Admin Panel <ArrowRight size={17} />
                </>
              )}
            </button>

            {isSlowAuth && (
              <div className="mint-coldstart-notice">
                <Sparkles size={15} className="spin-icon" />
                <span>Waking up cloud database... Logging in now.</span>
              </div>
            )}

            <div className="mint-switch-text">
              Standard User?{" "}
              <Link to="/login" className="mint-link-btn">
                Standard Login
              </Link>
            </div>
          </form>
        </div>

        <p className="mint-terms-text">
          EduVerse Campus Institutional Administration System
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
