import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, ArrowRight, UserCheck, BookOpen, Clock, CheckCircle2, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import "./LandingPage.css";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "Computer Science",
    facultyId: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successPending, setSuccessPending] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const selectRole = (role) => {
    setFormData({
      ...formData,
      role,
    });
    setError("");
    setSuccessPending("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessPending("");
    setLoading(true);

    try {
      const res = await api.post("/auth/signup", formData);

      if (res.data?.pending) {
        setSuccessPending(
          res.data.message ||
            "Your Teacher registration request has been submitted and is pending Admin/HOD approval."
        );
      } else if (res.data?.user && res.data?.token) {
        const { user, token } = res.data;
        login(user, token);
        if (user.role === "teacher" || user.role === "faculty") {
          navigate("/teacher/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please check your details."
      );
    } finally {
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
            <GraduationCap size={30} className="mint-brand-icon" />
          </div>

          <div className="mint-card-header">
            <h1>Create an account</h1>
            <p>Start your AI-powered learning experience</p>
          </div>

          {error && <div className="mint-error-banner">{error}</div>}

          {successPending ? (
            <div className="mint-pending-success">
              <div className="mint-pending-icon">
                <Clock size={44} />
              </div>
              <h2>Registration Submitted!</h2>
              <p className="pending-msg">{successPending}</p>
              <div className="pending-notice-box">
                <CheckCircle2 size={16} />
                <span>The Admin/HOD will review your details. You will be able to log in once approved.</span>
              </div>
              <Link to="/login" className="mint-primary-btn" style={{ textDecoration: "none" }}>
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form className="mint-auth-form" onSubmit={handleSubmit}>
              <div className="mint-form-field">
                <label>ACCOUNT TYPE</label>
                <div className="mint-role-pills-row">
                  <button
                    type="button"
                    className={`mint-role-btn ${formData.role === "student" ? "active" : ""}`}
                    onClick={() => selectRole("student")}
                  >
                    <BookOpen size={15} /> Student
                  </button>
                  <button
                    type="button"
                    className={`mint-role-btn ${formData.role === "teacher" ? "active" : ""}`}
                    onClick={() => selectRole("teacher")}
                  >
                    <UserCheck size={15} /> Teacher
                  </button>
                </div>
              </div>

              {formData.role === "teacher" && (
                <div className="mint-teacher-alert">
                  🔔 Faculty accounts require Admin/HOD verification before activation.
                </div>
              )}

              <div className="mint-form-field">
                <label htmlFor="name">USERNAME</label>
                <div className="mint-input-wrapper">
                  <User size={18} className="mint-input-icon" />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="John"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mint-form-field">
                <label htmlFor="email">EMAIL</label>
                <div className="mint-input-wrapper">
                  <Mail size={18} className="mint-input-icon" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john@timetoprogam.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {formData.role === "teacher" && (
                <>
                  <div className="mint-form-field">
                    <label htmlFor="department">DEPARTMENT</label>
                    <div className="mint-input-wrapper">
                      <input
                        id="department"
                        type="text"
                        name="department"
                        placeholder="School of Computing"
                        value={formData.department}
                        onChange={handleChange}
                        style={{ paddingLeft: "14px" }}
                      />
                    </div>
                  </div>
                  <div className="mint-form-field">
                    <label htmlFor="facultyId">FACULTY ID (OPTIONAL)</label>
                    <div className="mint-input-wrapper">
                      <input
                        id="facultyId"
                        type="text"
                        name="facultyId"
                        placeholder="FAC-2026-09"
                        value={formData.facultyId}
                        onChange={handleChange}
                        style={{ paddingLeft: "14px" }}
                      />
                    </div>
                  </div>
                </>
              )}

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
                    required
                    minLength={6}
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
                    <Loader2 size={18} className="spin-icon" /> Submitting...
                  </>
                ) : (
                  <>
                    {formData.role === "teacher" ? "Submit Registration Request" : "Create account"}{" "}
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="mint-switch-text">
                Already have an account?{" "}
                <Link to="/login" className="mint-link-btn">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>

        <p className="mint-terms-text">
          By continuing, you agree to our <a href="#terms">Terms</a> & <a href="#privacy">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
