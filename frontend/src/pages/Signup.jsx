import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, ArrowRight, UserCheck, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import "./Signup.css";

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
    <div className="signup-page">
      {/* Left Branding */}
      <div className="signup-brand">
        <div className="brand-top">
          <div className="brand-logo">
            <GraduationCap size={24} />
          </div>
          <span className="brand-name">EduVerse</span>
        </div>

        <div className="brand-content">
          <span className="brand-eyebrow">Academic Learning Portal</span>
          <h1>
            Create Account.
            <br />
            <span>Start Learning.</span>
          </h1>
          <p className="brand-description">
            Join EduVerse to access course materials, submit assignments, take quizzes, and track academic progress.
          </p>
        </div>

        <div className="brand-footer">EduVerse Academic LMS</div>
      </div>

      {/* Right Signup Panel */}
      <div className="signup-panel">
        <div className="signup-card glass-card">
          {successPending ? (
            <div className="pending-success-card">
              <div className="pending-icon-wrapper">
                <Clock size={48} className="text-amber" />
              </div>
              <h2>Registration Submitted!</h2>
              <p className="pending-message">{successPending}</p>
              <div className="pending-info-box">
                <CheckCircle2 size={16} />
                <span>The Admin/HOD will review your details. You will be able to log in once approved.</span>
              </div>
              <Link to="/login" className="signup-submit-btn block text-center mt-20">
                Return to Login
              </Link>
            </div>
          ) : (
            <form className="signup-form" onSubmit={handleSubmit}>
              <span className="signup-eyebrow">Registration</span>
              <h2>Create your EduVerse Account</h2>

              {error && <div className="signup-error-banner">{error}</div>}

              <div className="role-selector-group">
                <label className="field-label">Account Role</label>
                <div className="role-options">
                  <button
                    type="button"
                    className={`role-btn ${formData.role === "student" ? "active" : ""}`}
                    onClick={() => selectRole("student")}
                  >
                    <BookOpen size={16} /> Student
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${formData.role === "teacher" ? "active" : ""}`}
                    onClick={() => selectRole("teacher")}
                  >
                    <UserCheck size={16} /> Teacher
                  </button>
                </div>
              </div>

              {formData.role === "teacher" && (
                <div className="role-info-banner">
                  🔔 <strong>Teacher Account Approval:</strong> Submitting this form creates a registration request. Your account will be activated after Admin/HOD verification.
                </div>
              )}

              <div className="signup-field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Avinash Singh"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {formData.role === "teacher" && (
                <>
                  <div className="signup-field">
                    <label htmlFor="department">Department</label>
                    <input
                      id="department"
                      type="text"
                      name="department"
                      placeholder="School of Computing"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="signup-field">
                    <label htmlFor="facultyId">Faculty / Employee ID (Optional)</label>
                    <input
                      id="facultyId"
                      type="text"
                      name="facultyId"
                      placeholder="e.g. FAC-2026-09"
                      value={formData.facultyId}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <div className="signup-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="signup-submit-btn" disabled={loading}>
                {loading
                  ? "Submitting..."
                  : formData.role === "teacher"
                  ? "Submit Registration Request"
                  : "Create Account"}{" "}
                <ArrowRight size={16} />
              </button>

              <p className="signup-switch">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
