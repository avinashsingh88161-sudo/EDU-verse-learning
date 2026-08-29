import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { warmupBackend } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { Brain, ArrowRight, Loader2, Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react";
import "./LandingPage.css";

const Login = () => {
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
          <div className="mint-card-logo-badge">
            <Brain size={28} className="mint-brand-icon" />
          </div>

          <div className="mint-card-header">
            <h1>Welcome back</h1>
            <p>Sign in to continue your journey</p>
          </div>

          {error && <div className="mint-error-banner">{error}</div>}

          <form className="mint-auth-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="mint-form-field">
              <label htmlFor="email">EMAIL</label>
              <div className="mint-input-wrapper">
                <Mail size={18} className="mint-input-icon" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={warmupBackend}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className="mint-form-field">
              <label htmlFor="password">PASSWORD</label>
              <div className="mint-input-wrapper">
                <Lock size={18} className="mint-input-icon" />
                <input
                  id="password"
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

            <button type="submit" className="mint-primary-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spin-icon" /> Authenticating...
                </>
              ) : (
                <>
                  Sign in <ArrowRight size={17} />
                </>
              )}
            </button>

            {isSlowAuth && (
              <div className="mint-coldstart-notice">
                <Sparkles size={15} className="spin-icon" />
                <span>Waking up cloud database... Logging you in now.</span>
              </div>
            )}

            <div className="mint-switch-text">
              Don't have an account?{" "}
              <Link to="/signup" className="mint-link-btn">
                Sign up
              </Link>
            </div>
          </form>
        </div>

        <p className="mint-terms-text">
          By continuing, you agree to our <a href="#terms">Terms</a> & <a href="#privacy">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
