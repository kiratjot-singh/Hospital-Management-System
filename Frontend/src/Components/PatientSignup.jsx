import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { User, Phone, Lock, Heart, AlertCircle, RefreshCw } from "lucide-react";
import "./PatientLogin.css";

const PatientSignup = () => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [mesg, setMesg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const isPhoneValid = /^\d{10}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMesg("");

    if (password !== confirmPwd) {
      setMesg("Password and Confirm Password do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/patient/signup`, {
        name: fullName,
        phonenumber: phone,
        password: password,
      });

      if (res.data.success) {
        setMesg(res.data.message);
        navigate("/login/patient"); // Navigate to patient login page on success
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

  const isFormValid =
    fullName.trim().length > 0 &&
    isPhoneValid === true &&
    password.trim().length > 0 &&
    confirmPwd.trim().length > 0;

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
          <h1 className="left-title">Join Our Health Community</h1>
          <p className="left-subtitle">
            Create an account to unlock booking slot options, keep track of all appointments, and consult doctors.
          </p>
          <div className="features-bullets">
            <div className="bullet-item">
              <span className="bullet-dot">✓</span>
              <span>100% Secure Encrypted Data</span>
            </div>
            <div className="bullet-item">
              <span className="bullet-dot">✓</span>
              <span>Manage Family Appointments</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Signup Form */}
        <div className="login-right">
          <h2 className="login-title">Create Account</h2>
          <p className="login-caption">Sign up as a patient below.</p>

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

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="input-label" htmlFor="name">Full Name</label>
              <div className="input-group no-prefix">
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <User size={18} className="input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label" htmlFor="phone">Mobile Number</label>
              <div className="input-group">
                <span className="country-code">+91</span>
                <input
                  id="phone"
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
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={18} className="input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label" htmlFor="confirmPwd">Confirm Password</label>
              <div className="input-group no-prefix">
                <input
                  id="confirmPwd"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  required
                />
                <Lock size={18} className="input-icon" />
              </div>
            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? <RefreshCw className="animate-spin" size={18} /> : "Create Account"}
            </button>

            <p className="helper-text">
              Already have an account?{" "}
              <Link className="helper-link" to="/login/patient">Login</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PatientSignup;
