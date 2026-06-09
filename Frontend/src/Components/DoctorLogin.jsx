import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Lock, Heart, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import "./DoctorLogin.css";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState("otp");
  const [mesg, setMesg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMesg("");

    if (!phone) {
      setMesg("Please enter phone number");
      return;
    }

    if (loginMode === "otp") {
      setMesg("OTP service not added yet. Please use password login.");
      return;
    }

    if (loginMode === "password") {
      if (!password) {
        setMesg("Please enter password");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctor/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password })
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem("role", "doctor");
          localStorage.setItem("doctorId", data.doctor._id);
          navigate(`/doctor/${data.doctor._id}`);
        } else {
          setMesg(data.message || "Login failed");
        }
      } catch (err) {
        console.log(err);
        setMesg("Error connecting to backend");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-page">
      <motion.div 
        className="login-card glass-panel"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* LEFT SIDE: Doctor Branding */}
        <div className="login-left doctor-theme-bg">
          <div className="brand-header">
            <Heart className="brand-logoanimate animate-pulse" />
            <span className="brand-name">CareFlow Pro</span>
          </div>
          <h1 className="left-title">Physician Workspace</h1>
          <p className="left-subtitle">
            Access patient records, handle schedules, update available slots, and coordinate appointments in real-time.
          </p>
          <div className="features-bullets">
            <div className="bullet-item">
              <span className="bullet-dot">✓</span>
              <span>Advanced Slot Management</span>
            </div>
            <div className="bullet-item">
              <span className="bullet-dot">✓</span>
              <span>Patient Consultation Logs</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="login-right">
          <h2 className="login-title">Welcome, Doctor</h2>
          <p className="login-caption">Sign in to your clinical workspace.</p>

          <div className="toggle-container">
            <button
              type="button"
              className={`toggle-btn ${loginMode === "otp" ? "active" : ""}`}
              onClick={() => { setLoginMode("otp"); setMesg(""); }}
            >
              Secure OTP
            </button>
            <button
              type="button"
              className={`toggle-btn ${loginMode === "password" ? "active" : ""}`}
              onClick={() => { setLoginMode("password"); setMesg(""); }}
            >
              Password
            </button>
          </div>

          {mesg && (
            <motion.div 
              className="error-box"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={16} />
              <span>{mesg}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="input-label">Phone Number</label>
              <div className="input-group">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  placeholder="Enter registered mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Phone size={18} className="input-icon" />
              </div>
            </div>

            {loginMode === "password" && (
              <div className="form-group">
                <label className="input-label">Password</label>
                <div className="input-group no-prefix">
                  <input
                    type="password"
                    placeholder="Enter clinical password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock size={18} className="input-icon" />
                </div>
              </div>
            )}

            {loginMode === "otp" && (
              <div className="info-badge">
                OTP verification is currently offline. Please use Password login.
              </div>
            )}

            <button
              type="submit"
              className="primary-btn"
              disabled={isLoading || !phone || (loginMode === "password" && !password)}
            >
              {isLoading ? <RefreshCw className="animate-spin" size={18} /> : "Login"}
              {!isLoading && <ArrowRight size={18} />}
            </button>

            <p className="helper-text">
              New to the panel?{" "}
              <span className="helper-link" onClick={() => navigate("/signup/doctor")} style={{ cursor: "pointer" }}>
                Register clinic here
              </span>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorLogin;
