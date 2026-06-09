import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Phone, Lock, AlertCircle, Heart, ArrowRight, RefreshCw } from "lucide-react";
import "./PatientLogin.css";

const PatientLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [mode, setMode] = useState("otp");   // "otp" | "password"
  const [mesg, setMesg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const isPhoneValid = phone.trim().length === 10;

  const handleSendOtp = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      console.log("Send OTP to:", phone);
      setStep("otp");
      setIsLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      console.log("Verify OTP:", otp, "for phone:", phone);
      alert("Login successful with OTP (UI demo)");
      setIsLoading(false);
    }, 1000);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMesg("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/patient/login`,
        {
          phonenumber: phone,
          password: password,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        const patientId = res.data.patient.id;
        localStorage.setItem("patientId", patientId);
        setMesg(res.data.message);
        navigate(`/home/patient/${phone}`);
      } else {
        setMesg(res.data.message);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      console.log(err);
      setMesg(msg);
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
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* LEFT SIDE: Brand Branding */}
        <div className="login-left">
          <div className="brand-header">
            <Heart className="brand-logoanimate animate-pulse" />
            <span className="brand-name">CareFlow</span>
          </div>
          <h1 className="left-title">Empowering Your Health Journey</h1>
          <p className="left-subtitle">
            Securely access your records, book real-time appointments, check prescription histories, and chat with CareBot.
          </p>
          <div className="features-bullets">
            <div className="bullet-item">
              <span className="bullet-dot">✓</span>
              <span>Real-time Doctor Slot Booking</span>
            </div>
            <div className="bullet-item">
              <span className="bullet-dot">✓</span>
              <span>Direct AI Health Chat Agent</span>
            </div>
            <div className="bullet-item">
              <span className="bullet-dot">✓</span>
              <span>Secure Patient & Reports Portal</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Interactive Login Forms */}
        <div className="login-right">
          <h2 className="login-title">Patient Login</h2>
          <p className="login-caption">Select your preferred login method below.</p>

          {/* TOGGLE METHOD */}
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

          {/* OTP METHOD FORM */}
          {mode === "otp" && step === "phone" && (
            <form onSubmit={handleSendOtp} className="login-form">
              <div className="form-group">
                <label className="input-label" htmlFor="phone">Mobile Number</label>
                <div className="input-group">
                  <span className="country-code">+91</span>
                  <input
                    id="phone"
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                  <Phone size={18} className="input-icon" />
                </div>
              </div>

              <button
                type="submit"
                className="primary-btn"
                disabled={!isPhoneValid || isLoading}
              >
                {isLoading ? <RefreshCw className="animate-spin" size={18} /> : "Send OTP"}
                {!isLoading && <ArrowRight size={18} />}
              </button>

              <p className="helper-text">
                New to CareFlow?{" "}
                <Link className="helper-link" to="/signup/patient">Create an account</Link>
              </p>
            </form>
          )}

          {mode === "otp" && step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="login-form">
              <div className="info-badge">
                OTP sent to <strong>+91-{phone}</strong>
              </div>

              <div className="form-group">
                <label className="input-label" htmlFor="otp">Enter Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              <button type="submit" className="primary-btn" disabled={isLoading}>
                {isLoading ? <RefreshCw className="animate-spin" size={18} /> : "Verify & Login"}
              </button>

              <button
                type="button"
                className="link-btn"
                onClick={() => setStep("phone")}
              >
                Change mobile number
              </button>
            </form>
          )}

          {/* PASSWORD METHOD FORM */}
          {mode === "password" && (
            <form onSubmit={handlePasswordLogin} className="login-form">
              <div className="form-group">
                <label className="input-label" htmlFor="phonePwd">Mobile Number</label>
                <div className="input-group">
                  <span className="country-code">+91</span>
                  <input
                    id="phonePwd"
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                  <Phone size={18} className="input-icon" />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label" htmlFor="password">Password</label>
                <div className="input-group no-prefix">
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock size={18} className="input-icon" />
                </div>
              </div>

              <button
                type="submit"
                className="primary-btn"
                disabled={!isPhoneValid || !password || isLoading}
              >
                {isLoading ? <RefreshCw className="animate-spin" size={18} /> : "Login"}
                {!isLoading && <ArrowRight size={18} />}
              </button>

              <p className="helper-text">
                New to CareFlow?{" "}
                <Link className="helper-link" to="/signup/patient">Create an account</Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PatientLogin;
