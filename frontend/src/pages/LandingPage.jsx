import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { warmupBackend } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { 
  GraduationCap, 
  ArrowRight, 
  UserCheck, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  Loader2, 
  Sparkles,
  Eye,
  EyeOff,
  Shield,
  Brain
} from "lucide-react";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Mode: "login" or "signup"
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  // Login Form State
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [isSlowAuth, setIsSlowAuth] = useState(false);

  // Pre-warm the backend on initial landing page load
  useEffect(() => {
    warmupBackend();
  }, []);

  // Signup Form State
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "Computer Science",
    facultyId: "",
  });
  const [signupError, setSignupError] = useState("");
  const [successPending, setSuccessPending] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // Handlers
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };

  const selectSignupRole = (role) => {
    setSignupData({
      ...signupData,
      role,
    });
    setSignupError("");
    setSuccessPending("");
  };

  // Quick 1-click Demo Fill
  const fillDemo = (role) => {
    setActiveTab("login");
    setLoginError("");
    if (role === "teacher") {
      setLoginData({
        email: "avinashsingh88161@gmail.com",
        password: "Avinash@123",
      });
    } else if (role === "student") {
      setLoginData({
        email: "ashutosh123@gmail.com",
        password: "Avinash@123",
      });
    } else if (role === "admin") {
      navigate("/admin/login");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    setIsSlowAuth(false);

    // Show friendly cloud server wake-up notice if request takes > 2.5s
    const timer = setTimeout(() => {
      setIsSlowAuth(true);
    }, 2500);

    try {
      const res = await api.post("/auth/login", loginData);
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
      setLoginError(msg);
    } finally {
      clearTimeout(timer);
      setIsSlowAuth(false);
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError("");
    setSuccessPending("");
    setSignupLoading(true);

    try {
      const res = await api.post("/auth/signup", signupData);

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
      setSignupError(
        err.response?.data?.message || "Registration failed. Please check your details."
      );
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="mint-auth-page-root">
      {/* Background Soft Glow Orbs */}
      <div className="mint-bg-orb orb-emerald-1"></div>
      <div className="mint-bg-orb orb-emerald-2"></div>

      {/* Main Centered Minimalist White Card */}
      <div className="mint-auth-card-wrapper animate-fade-in">
        <div className="mint-auth-card">
          {/* Top Emerald Squircle Logo Badge */}
          <div className="mint-card-logo-badge">
            <Brain size={28} className="mint-brand-icon" />
          </div>

          {/* Heading */}
          <div className="mint-card-header">
            <h1>{activeTab === "login" ? "Welcome back" : "Create an account"}</h1>
            <p>
              {activeTab === "login"
                ? "Sign in to continue your journey"
                : "Start your AI-powered learning experience"}
            </p>
          </div>

          {/* Error Banner */}
          {(loginError || signupError) && (
            <div className="mint-error-banner">
              {activeTab === "login" ? loginError : signupError}
            </div>
          )}

          {/* SIGN IN VIEW */}
          {activeTab === "login" ? (
            <form className="mint-auth-form" onSubmit={handleLoginSubmit} autoComplete="off">
              {/* Email */}
              <div className="mint-form-field">
                <label htmlFor="email">EMAIL</label>
                <div className="mint-input-wrapper">
                  <Mail size={18} className="mint-input-icon" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    onFocus={warmupBackend}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mint-form-field">
                <label htmlFor="password">PASSWORD</label>
                <div className="mint-input-wrapper">
                  <Lock size={18} className="mint-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    onFocus={warmupBackend}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="mint-pw-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Primary Green Submit Button */}
              <button type="submit" className="mint-primary-btn" disabled={loginLoading}>
                {loginLoading ? (
                  <>
                    <Loader2 size={18} className="spin-icon" /> Authenticating...
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight size={17} />
                  </>
                )}
              </button>

              {/* Cold Start Notice */}
              {isSlowAuth && (
                <div className="mint-coldstart-notice">
                  <Sparkles size={15} className="spin-icon" />
                  <span>Waking up cloud database... Logging you in now.</span>
                </div>
              )}

              {/* Switch to Signup */}
              <div className="mint-switch-text">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="mint-link-btn"
                  onClick={() => {
                    setActiveTab("signup");
                    setLoginError("");
                  }}
                >
                  Sign up
                </button>
              </div>

              {/* Quick 1-Click Demo Pills */}
              <div className="mint-quick-demo-pills">
                <span className="demo-hint-label">Quick Demo:</span>
                <button type="button" className="mint-demo-pill" onClick={() => fillDemo("student")}>
                  Student
                </button>
                <button type="button" className="mint-demo-pill" onClick={() => fillDemo("teacher")}>
                  Teacher
                </button>
                <button type="button" className="mint-demo-pill admin" onClick={() => fillDemo("admin")}>
                  Admin
                </button>
              </div>
            </form>
          ) : (
            /* CREATE ACCOUNT VIEW */
            successPending ? (
              <div className="mint-pending-success">
                <div className="mint-pending-icon">
                  <Clock size={44} />
                </div>
                <h2>Registration Submitted!</h2>
                <p className="pending-msg">{successPending}</p>
                <div className="pending-notice-box">
                  <CheckCircle2 size={16} />
                  <span>Admin/HOD will review your details. You can sign in once verified.</span>
                </div>
                <button
                  type="button"
                  className="mint-primary-btn"
                  onClick={() => {
                    setSuccessPending("");
                    setActiveTab("login");
                  }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form className="mint-auth-form" onSubmit={handleSignupSubmit}>
                {/* Account Type Selector */}
                <div className="mint-form-field">
                  <label>ACCOUNT TYPE</label>
                  <div className="mint-role-pills-row">
                    <button
                      type="button"
                      className={`mint-role-btn ${signupData.role === "student" ? "active" : ""}`}
                      onClick={() => selectSignupRole("student")}
                    >
                      <BookOpen size={15} /> Student
                    </button>
                    <button
                      type="button"
                      className={`mint-role-btn ${signupData.role === "teacher" ? "active" : ""}`}
                      onClick={() => selectSignupRole("teacher")}
                    >
                      <UserCheck size={15} /> Teacher
                    </button>
                  </div>
                </div>

                {signupData.role === "teacher" && (
                  <div className="mint-teacher-alert">
                    🔔 Faculty registrations require HOD approval before dashboard activation.
                  </div>
                )}

                {/* Username / Full Name */}
                <div className="mint-form-field">
                  <label htmlFor="signup-name">USERNAME</label>
                  <div className="mint-input-wrapper">
                    <User size={18} className="mint-input-icon" />
                    <input
                      id="signup-name"
                      type="text"
                      name="name"
                      placeholder="John"
                      value={signupData.name}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="mint-form-field">
                  <label htmlFor="signup-email">EMAIL</label>
                  <div className="mint-input-wrapper">
                    <Mail size={18} className="mint-input-icon" />
                    <input
                      id="signup-email"
                      type="email"
                      name="email"
                      placeholder="john@timetoprogam.com"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                </div>

                {/* Teacher specific */}
                {signupData.role === "teacher" && (
                  <>
                    <div className="mint-form-field">
                      <label htmlFor="dept">DEPARTMENT</label>
                      <div className="mint-input-wrapper">
                        <input
                          id="dept"
                          type="text"
                          name="department"
                          placeholder="School of Computing"
                          value={signupData.department}
                          onChange={handleSignupChange}
                          style={{ paddingLeft: "14px" }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Password */}
                <div className="mint-form-field">
                  <label htmlFor="signup-pw">PASSWORD</label>
                  <div className="mint-input-wrapper">
                    <Lock size={18} className="mint-input-icon" />
                    <input
                      id="signup-pw"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={handleSignupChange}
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

                {/* Submit button */}
                <button type="submit" className="mint-primary-btn" disabled={signupLoading}>
                  {signupLoading ? (
                    <>
                      <Loader2 size={18} className="spin-icon" /> Creating account...
                    </>
                  ) : (
                    <>
                      Create account <ArrowRight size={17} />
                    </>
                  )}
                </button>

                {/* Switch to Login */}
                <div className="mint-switch-text">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="mint-link-btn"
                    onClick={() => {
                      setActiveTab("login");
                      setSignupError("");
                    }}
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )
          )}
        </div>

        {/* Bottom Terms & Privacy Text */}
        <p className="mint-terms-text">
          By continuing, you agree to our <a href="#terms">Terms</a> & <a href="#privacy">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
