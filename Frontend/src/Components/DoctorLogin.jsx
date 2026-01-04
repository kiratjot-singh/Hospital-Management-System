import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorLogin.css";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loginMode, setLoginMode] = useState("otp"); 

  const handleLogin = async () => {
    if (!phone) return alert("Please enter phone number");

    // ------- OTP MODE -------
    if (loginMode === "otp") {
      alert("OTP service not added yet. Please use password login.");
      return;
    }

    // ------- PASSWORD LOGIN MODE -------
    if (loginMode === "password") {
      if (!password) return alert("Please enter password");

      try {
        const response = await fetch("http://localhost:5000/api/doctor/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password })
        });

        const data = await response.json();

        if (data.success) {
          alert("Login successful!");
          navigate(`/home/doctor/${phone}`);
        } else {
          alert(data.message || "Login failed");
        }

      } catch (err) {
        console.log(err);
        alert("Error connecting to backend");
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        
        {/* LEFT SIDE */}
        <div className="login-left">
          <h1 className="app-title">Doctor Login</h1>
          <p className="app-subtitle">
            Access your doctor dashboard, manage appointments and patients.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          <h2 className="login-title">Welcome, Doctor</h2>
          <p className="login-caption">Login to continue</p>

          {/* TOGGLE BUTTONS */}
          <div className="toggle-container">
            <button
              className={`toggle-btn ${loginMode === "otp" ? "active" : ""}`}
              onClick={() => setLoginMode("otp")}
            >
              Login with OTP
            </button>
            <button
              className={`toggle-btn ${loginMode === "password" ? "active" : ""}`}
              onClick={() => setLoginMode("password")}
            >
              Login with Password
            </button>
          </div>

          <div className="login-form">

            {/* phone input */}
            <label className="input-label">Phone Number</label>
            <div className="input-group">
              <span className="country-code">+91</span>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>


            {/* password login */}
            {loginMode === "password" && (
              <>
                <label className="input-label">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </>
            )}

            {/* otp info */}
            {loginMode === "otp" && (
              <p className="info-box">You will receive an OTP on your registered phone.</p>
            )}

            {/* primary button */}
            <button className="primary-btn" onClick={handleLogin}>
              Login
            </button>

            {/* signup link */}
            <p className="helper-text">
              Don’t have an account?{" "}
              <span
                className="helper-link"
                onClick={() => navigate("/signup/doctor")}
              >
                Sign up here
              </span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorLogin;
