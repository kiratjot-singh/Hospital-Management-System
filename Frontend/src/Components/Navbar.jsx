import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon, LogOut, Calendar, User, HeartPulse, Menu, X } from "lucide-react";
import axios from "axios";
import "./Navbar.css";

const Navbar = ({ userName, role, patientId, phone }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      if (role === "patient") {
        await axios.post(`${backendUrl}/api/patient/logout`, {}, { withCredentials: true });
      } else if (role === "doctor") {
        await axios.post(`${backendUrl}/api/doctor/logout`, {}, { withCredentials: true });
      } else if (role === "receptionist") {
        await axios.post(`${backendUrl}/api/receptionist/logout`, {}, { withCredentials: true });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear credentials/localstorage
      localStorage.removeItem("patientId");
      localStorage.removeItem("doctorId");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    }
  };

  const getHomePath = () => {
    if (role === "patient" && phone) return `/home/patient/${phone}`;
    if (role === "receptionist" && phone) return `/home/receptionist/${phone}`;
    if (role === "doctor" && phone) return `/doctor/${phone}`;
    return "/";
  };

  return (
    <nav className="glass-nav">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => navigate(getHomePath())}>
          <HeartPulse className="brand-icon animate-pulse" />
          <span className="brand-text">CareFlow</span>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-menu desktop-menu">
          {role === "patient" && patientId && (
            <>
              <button 
                className={`nav-link-btn ${location.pathname.startsWith("/appointments") ? "active" : ""}`}
                onClick={() => navigate(`/appointments/${patientId}`)}
              >
                <Calendar size={16} />
                My Appointments
              </button>
              <button 
                className={`nav-link-btn ${location.pathname.includes(`/patient/me/`) ? "active" : ""}`}
                onClick={() => navigate(`/patient/me/${patientId}`)}
              >
                <User size={16} />
                Profile
              </button>
            </>
          )}

          {role === "receptionist" && (
            <button 
              className="nav-link-btn"
              onClick={() => alert("Booked appointments log (Receptionist view)")}
            >
              <Calendar size={16} />
              Hospital Schedule
            </button>
          )}

          {userName && (
            <span className="user-badge">
              Hi, <strong className="user-name">{userName}</strong>
              <span className="role-tag">{role}</span>
            </span>
          )}

          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {userName && (
              <button className="logout-btn" onClick={handleLogout} title="Sign Out">
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu trigger */}
        <div className="mobile-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="menu-toggle-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-drawer">
          {role === "patient" && patientId && (
            <>
              <button 
                className="mobile-link"
                onClick={() => {
                  navigate(`/appointments/${patientId}`);
                  setMenuOpen(false);
                }}
              >
                <Calendar size={18} />
                My Appointments
              </button>
              <button 
                className="mobile-link"
                onClick={() => {
                  navigate(`/patient/me/${patientId}`);
                  setMenuOpen(false);
                }}
              >
                <User size={18} />
                Profile
              </button>
            </>
          )}
          {userName && (
            <div className="mobile-user">
              <span>Logged in as <strong>{userName}</strong> ({role})</span>
            </div>
          )}
          {userName && (
            <button className="mobile-logout" onClick={handleLogout}>
              <LogOut size={18} /> Log Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
