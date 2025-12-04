import React, { useState } from "react";
import "./PatientLogin.css";

const PatientSignup = () => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const isPhoneValid = phone.trim().length === 10;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPwd) {
      alert("Password and Confirm Password do not match");
      return;
    }

    console.log("Signup data:", {
      fullName,
      phone,
      password,
    });

    alert("Signup successful (UI demo)");
  };

  const isFormValid =
    fullName.trim() &&
    isPhoneValid &&
    password.trim() &&
    confirmPwd.trim() &&
    password === confirmPwd;

  return (
    <div className="login-page">
      <div className="login-card">
        {/* LEFT SIDE */}
        <div className="login-left">
          <h1 className="app-title">Hospital Management System</h1>
          <p className="app-subtitle">
            Create your patient account to book appointments and manage your
            visits easily.
          </p>
        </div>

        {/* RIGHT SIDE – SIGNUP FORM */}
        <div className="login-right">
          <h2 className="login-title">Patient Signup</h2>
          <p className="login-caption">
            Fill the details below to create your account.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="input-label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <label className="input-label" htmlFor="phone">
              Mobile Number
            </label>
            <div className="input-group">
              <span className="country-code">+91</span>
              <input
                id="phone"
                type="tel"
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
                required
              />
            </div>

            <label className="input-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label className="input-label" htmlFor="confirmPwd">
              Confirm Password
            </label>
            <input
              id="confirmPwd"
              type="password"
              placeholder="Re-enter password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              required
            />

            <button
              type="submit"
              className="primary-btn"
              disabled={!isFormValid}
            >
              Create Account
            </button>

            <p className="helper-text">
              Already registered?{" "}
              <span className="helper-link">Login</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientSignup;
