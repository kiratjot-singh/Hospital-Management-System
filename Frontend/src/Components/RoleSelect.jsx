import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Stethoscope, User, Heart, Sun, Moon } from "lucide-react";
import "./RoleSelect.css";

const RoleSelect = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="role-select-page">
      <div className="theme-toggle-fixed">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <motion.div 
        className="role-select-card glass-panel"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
      >
        {/* Left Side: Healthcare Illustration */}
        <div className="role-select-left">
          <div className="brand-logo-container">
            <Heart className="heart-icon animate-pulse" />
            <h1 className="brand-title">CareFlow</h1>
          </div>
          <p className="brand-tagline">
            Next-generation Hospital Management & SaaS portal connecting patients, doctors, and support staff.
          </p>
          <div className="illustration-wrapper">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-illustration">
              <circle cx="100" cy="100" r="80" fill="url(#grad)" opacity="0.15" />
              <path d="M60 100 H140 M100 60 V140" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round" opacity="0.75" />
              <circle cx="100" cy="100" r="45" stroke="var(--secondary)" strokeWidth="3" strokeDasharray="5 5" />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--secondary)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Right Side: Options */}
        <div className="role-select-right">
          <h2 className="title">Select Portal</h2>
          <p className="caption">Choose your access role to continue authentication</p>

          <div className="role-grid">
            <motion.button 
              className="role-card-btn"
              onClick={() => navigate("/login/receptionist")}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="role-icon-bg receptionist-color">
                <Shield className="role-icon" />
              </div>
              <div className="role-info">
                <h3>Receptionist</h3>
                <p>Register patients, manage bookings, and schedule slots.</p>
              </div>
            </motion.button>

            <motion.button 
              className="role-card-btn"
              onClick={() => navigate("/login/doctor")}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="role-icon-bg doctor-color">
                <Stethoscope className="role-icon" />
              </div>
              <div className="role-info">
                <h3>Doctor</h3>
                <p>Track visits, check appointments, and manage slots.</p>
              </div>
            </motion.button>

            <motion.button 
              className="role-card-btn"
              onClick={() => navigate("/login/patient")}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="role-icon-bg patient-color">
                <User className="role-icon" />
              </div>
              <div className="role-info">
                <h3>Patient Portal</h3>
                <p>Book online slots, view history, and talk to CareBot.</p>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelect;
