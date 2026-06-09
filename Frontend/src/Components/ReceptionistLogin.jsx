import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Lock, Heart, ArrowRight, RefreshCw, AlertCircle, ShieldAlert, Mail, User } from "lucide-react";
import "./ReceptionistLogin.css";

const ReceptionistLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("phone");
  const [mode, setMode] = useState("otp");
  const [showSignup, setShowSignup] = useState(false);
  const [mesg, setMesg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);

  const isPhoneValid = phone.trim().length === 10;
  const navigate = useNavigate();

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/hospital/getHospitals`);
      const data = await res.json();
      if (data.success) setHospitals(data.hospitals);
    } catch (err) {
      console.log("Error fetching hospitals", err);
    }
  };

  useEffect(() => {
    if (showSignup) fetchHospitals();
  }, [showSignup]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMesg("");
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/receptionist/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (data.success) {
        setStep("otp");
      } else {
        setMesg(data.message);
      }
    } catch (err) {
      console.error(err);
      setMesg("Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMesg("");
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/receptionist/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();
      if (data.success) {
        navigate(`/home/${phone}`);
      } else {
        setMesg(data.message);
      }
    } catch (err) {
      console.error(err);
      setMesg("Error verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setMesg("");
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/receptionist/login-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (data.success) {
        navigate(`/home/receptionist/${phone}`);
      } else {
        setMesg(data.message);
      }
    } catch (err) {
      console.error(err);
      setMesg("Error connecting to backend");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMesg("");
    setIsLoading(true);

    const form = new FormData(e.target);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      hospitalId: form.get("hospital"),
      password: form.get("password"),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/receptionist/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert("Signup successful!");
        setShowSignup(false);
      } else {
        setMesg(data.message);
      }
    } catch (err) {
      console.error(err);
      setMesg("Error signing up receptionist");
    } finally {
      setIsLoading(false);
    }
  };

  const switchToOtp = () => {
    setMode("otp");
    setStep("phone");
    setOtp("");
    setPassword("");
    setMesg("");
  };

  const switchToPassword = () => {
    setMode("password");
    setStep("phone");
    setOtp("");
    setPassword("");
    setMesg("");
  };

  return (
    <div className="login-page">
      <motion.div 
        className="login-card glass-panel"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* LEFT SIDE: Brand */}
        <div className="login-left receptionist-theme-bg">
          <div className="brand-header">
            <Heart className="brand-logoanimate animate-pulse" />
            <span className="brand-name">CareFlow Support</span>
          </div>
          <h1 className="left-title">Front Desk Operations</h1>
          <p className="left-subtitle">
            Manage registrations, doctor availabilities, verify patient queues, and orchestrate physical visit schedules.
          </p>
          <div className="features-bullets">
            <div className="bullet-item">
              <span className="bullet-dot">✓</span>
              <span>Patient Admission Control</span>
            </div>
            <div className="bullet-item">
              <span className="bullet-dot">✓</span>
              <span>Doctor Shifts Coordinator</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          {mesg && (
            <motion.div 
              className="error-box"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertCircle size={16} />
              <span>{mesg}</span>
            </motion.div>
          )}

          {!showSignup ? (
            <>
              <h2 className="login-title">Receptionist Login</h2>
              <p className="login-caption">Access front desk schedules and dashboards.</p>

              <div className="toggle-container">
                <button
                  type="button"
                  className={`toggle-btn ${mode === "otp" ? "active" : ""}`}
                  onClick={switchToOtp}
                >
                  Secure OTP
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${mode === "password" ? "active" : ""}`}
                  onClick={switchToPassword}
                >
                  Password
                </button>
              </div>

              {mode === "otp" && step === "phone" && (
                <form className="login-form" onSubmit={handleSendOtp}>
                  <div className="form-group">
                    <label className="input-label">Mobile Number</label>
                    <div className="input-group">
                      <span className="country-code">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit number"
                        required
                      />
                      <Phone size={18} className="input-icon" />
                    </div>
                  </div>
                  <button className="primary-btn" disabled={!isPhoneValid || isLoading}>
                    {isLoading ? <RefreshCw className="animate-spin" size={18} /> : "Send OTP"}
                  </button>
                </form>
              )}

              {mode === "otp" && step === "otp" && (
                <form className="login-form" onSubmit={handleVerifyOtp}>
                  <div className="info-badge">
                    OTP sent to <strong>+91-{phone}</strong>
                  </div>
                  <div className="form-group">
                    <label className="input-label">Enter OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="6-digit OTP"
                      required
                    />
                  </div>
                  <button className="primary-btn" disabled={isLoading}>
                    {isLoading ? <RefreshCw className="animate-spin" size={18} /> : "Verify & Login"}
                  </button>
                </form>
              )}

              {mode === "password" && (
                <form className="login-form" onSubmit={handlePasswordLogin}>
                  <div className="form-group">
                    <label className="input-label">Mobile Number</label>
                    <div className="input-group">
                      <span className="country-code">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit number"
                        required
                      />
                      <Phone size={18} className="input-icon" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Password</label>
                    <div className="input-group no-prefix">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                      />
                      <Lock size={18} className="input-icon" />
                    </div>
                  </div>

                  <button className="primary-btn" disabled={!isPhoneValid || !password || isLoading}>
                    {isLoading ? <RefreshCw className="animate-spin" size={18} /> : "Login"}
                  </button>
                </form>
              )}

              <p className="helper-text">
                Don't have an account?{" "}
                <span className="helper-link" onClick={() => { setShowSignup(true); setMesg(""); }} style={{ cursor: "pointer" }}>
                  Sign Up
                </span>
              </p>
            </>
          ) : (
            <form className="login-form" onSubmit={handleSignup}>
              <h2 className="login-title">Create Front Desk Account</h2>
              <p className="login-caption">Register a receptionist credentials.</p>

              <div className="form-group">
                <label className="input-label">Full Name</label>
                <div className="input-group no-prefix">
                  <input name="name" type="text" placeholder="Enter full name" required />
                  <User size={18} className="input-icon" />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Email</label>
                <div className="input-group no-prefix">
                  <input name="email" type="email" placeholder="Enter email" required />
                  <Mail size={18} className="input-icon" />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Mobile Number</label>
                <div className="input-group">
                  <span className="country-code">+91</span>
                  <input name="phone" type="tel" maxLength={10} placeholder="10-digit number" required />
                  <Phone size={18} className="input-icon" />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Select Hospital</label>
                <select name="hospital" required>
                  <option value="">Choose Hospital</option>
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Create Password</label>
                <div className="input-group no-prefix">
                  <input name="password" type="password" placeholder="Enter secure password" required />
                  <Lock size={18} className="input-icon" />
                </div>
              </div>

              <button className="primary-btn" disabled={isLoading}>
                {isLoading ? <RefreshCw className="animate-spin" size={18} /> : "Sign Up"}
              </button>

              <button
                className="link-btn"
                type="button"
                onClick={() => { setShowSignup(false); setMesg(""); }}
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReceptionistLogin;
