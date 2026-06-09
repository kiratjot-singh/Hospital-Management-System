import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, User, Mail, Phone, Lock, RefreshCw, AlertCircle } from "lucide-react";
import "./ReceptionistLogin.css";

const ReceptionistSignup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [hospital, setHospital] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [mesg, setMesg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const isPhoneValid = phone.trim().length === 10;

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
    fetchHospitals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMesg("");

    if (password !== confirmPwd) {
      setMesg("Password and Confirm Password do not match");
      return;
    }

    if (!hospital) {
      setMesg("Please select a hospital");
      return;
    }

    setIsLoading(true);
    const payload = {
      name: fullName,
      email,
      phone,
      hospitalId: hospital,
      password,
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
        navigate("/login/receptionist");
      } else {
        setMesg(data.message);
      }
    } catch (err) {
      console.error(err);
      setMesg("Error during signup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    fullName.trim() &&
    isPhoneValid &&
    password.trim() &&
    confirmPwd.trim() &&
    password === confirmPwd &&
    hospital;

  return (
    <div className="login-page">
      <motion.div 
        className="login-card glass-panel"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* LEFT SIDE */}
        <div className="login-left receptionist-theme-bg">
          <div className="brand-header">
            <Heart className="brand-logoanimate animate-pulse" />
            <span className="brand-name">CareFlow Support</span>
          </div>
          <h1 className="left-title">Front Desk Operations</h1>
          <p className="left-subtitle">
            Create an account to coordinate appointments, maintain patient queues, and update doctor shifts.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          <h2 className="login-title">Receptionist Signup</h2>
          <p className="login-caption">Fill in the details to register your front-desk terminal.</p>

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

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="input-label">Full Name</label>
              <div className="input-group no-prefix">
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <User size={18} className="input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Email Address</label>
              <div className="input-group no-prefix">
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={18} className="input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Mobile Number</label>
              <div className="input-group">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  required
                />
                <Phone size={18} className="input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Select Hospital</label>
              <select value={hospital} onChange={(e) => setHospital(e.target.value)} required>
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
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={18} className="input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Confirm Password</label>
              <div className="input-group no-prefix">
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  required
                />
                <Lock size={18} className="input-icon" />
              </div>
            </div>

            <button className="primary-btn" type="submit" disabled={!isFormValid || isLoading}>
              {isLoading ? <RefreshCw className="animate-spin" size={18} /> : "Sign Up"}
            </button>

            <p className="helper-text">
              Already have an account?{" "}
              <Link className="helper-link" to="/login/receptionist">Login</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ReceptionistSignup;