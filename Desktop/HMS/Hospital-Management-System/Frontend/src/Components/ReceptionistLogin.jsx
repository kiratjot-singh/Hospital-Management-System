import React, { useState, useEffect } from "react";
import "./ReceptionistLogin.css";
import { useNavigate } from "react-router-dom";

const ReceptionistLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("phone");
  const [mode, setMode] = useState("otp");
  const [showSignup, setShowSignup] = useState(false);

  const [hospitals, setHospitals] = useState([]);

  const isPhoneValid = phone.trim().length === 10;
  const navigate = useNavigate();

  // ==========================================================
  // Fetch hospitals ONLY when signup page opens
  // ==========================================================
  const fetchHospitals = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/hospital/getHospitals");
      const data = await res.json();
      if (data.success) setHospitals(data.hospitals);
    } catch (err) {
      console.log("Error fetching hospitals", err);
    }
  };

  useEffect(() => {
    if (showSignup) fetchHospitals();
  }, [showSignup]);

  // ==========================================================
  // SEND OTP
  // ==========================================================
  const handleSendOtp = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/receptionist/send-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();
    if (data.success) setStep("otp");
    else alert(data.message);
  };

  // ==========================================================
  // VERIFY OTP
  // ==========================================================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/receptionist/verify-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });

    const data = await res.json();

    if (data.success) navigate(`/home/${phone}`);
    else alert(data.message);
  };

  // ==========================================================
  // PASSWORD LOGIN
  // ==========================================================
  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/receptionist/login-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    const data = await res.json();

    if (data.success) navigate(`/home/receptionist/${phone}`);
    else alert(data.message);
  };

  // ==========================================================
  // SIGNUP
  // ==========================================================
  const handleSignup = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      hospitalId: form.get("hospital"), // IMPORTANT: backend expects hospitalId
      password: form.get("password"),
    };

    const res = await fetch("http://localhost:5000/api/receptionist/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      alert("Signup successful!");
      setShowSignup(false);
    } else alert(data.message);
  };

  const switchToOtp = () => {
    setMode("otp");
    setStep("phone");
    setOtp("");
    setPassword("");
  };

  const switchToPassword = () => {
    setMode("password");
    setStep("phone");
    setOtp("");
    setPassword("");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* LEFT SIDE */}
        <div className="login-left">
          <h1 className="app-title">Hospital Management System</h1>
          <p className="app-subtitle">Receptionist portal – booking & updates.</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">

          {/* ================= Login Section ================= */}
          {!showSignup && (
            <>
              <h2 className="login-title">Receptionist Login</h2>

              {/* MODE SWITCH */}
              <div className="toggle-container">
                <button
                  className={`toggle-btn ${mode === "otp" ? "active" : ""}`}
                  onClick={switchToOtp}
                >
                  Login with OTP
                </button>

                <button
                  className={`toggle-btn ${mode === "password" ? "active" : ""}`}
                  onClick={switchToPassword}
                >
                  Login with Password
                </button>
              </div>

              {/* ----------------- OTP LOGIN ------------------ */}
              {mode === "otp" && step === "phone" && (
                <form className="login-form" onSubmit={handleSendOtp}>
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
                  </div>
                  <button className="primary-btn" disabled={!isPhoneValid}>
                    Send OTP
                  </button>
                </form>
              )}

              {/* ----------------- OTP VERIFY ------------------ */}
              {mode === "otp" && step === "otp" && (
                <form className="login-form" onSubmit={handleVerifyOtp}>
                  <label className="input-label">Enter OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit OTP"
                    required
                  />
                  <button className="primary-btn">Verify & Login</button>
                </form>
              )}

              {/* ---------------- PASSWORD LOGIN ---------------- */}
              {mode === "password" && (
                <form className="login-form" onSubmit={handlePasswordLogin}>
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
                  </div>

                  <label className="input-label">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />

                  <button className="primary-btn" disabled={!isPhoneValid || !password}>
                    Login
                  </button>
                </form>
              )}

              {/* ---------------- SIGNUP LINK ---------------- */}
              <p className="signup-link">
                Don't have an account?
                <button className="link-btn" onClick={() => setShowSignup(true)}>
                  Sign Up
                </button>
              </p>
            </>
          )}

          {/* ================= Signup Section ================= */}
          {showSignup && (
            <form className="login-form" onSubmit={handleSignup}>
              <h2>Create Receptionist Account</h2>

              <label className="input-label">Full Name</label>
              <input name="name" type="text" placeholder="Enter full name" required />

              <label className="input-label">Email</label>
              <input name="email" type="email" placeholder="Enter email" required />

              <label className="input-label">Mobile Number</label>
              <div className="input-group">
                <span className="country-code">+91</span>
                <input name="phone" type="tel" maxLength={10} placeholder="10-digit number" required />
              </div>

              {/* HOSPITAL DROPDOWN */}
              <label className="input-label">Select Hospital</label>
              <select name="hospital" required>
                <option value="">Select Hospital</option>
                {hospitals.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>

              <label className="input-label">Create Password</label>
              <input name="password" type="password" placeholder="Enter password" required />

              <button className="primary-btn">Sign Up</button>

              <button
                className="link-btn"
                type="button"
                onClick={() => setShowSignup(false)}
              >
                Back to Login
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReceptionistLogin;
