import React from "react";
import { useNavigate } from "react-router-dom";
import "./RoleSelect.css";

const RoleSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Sidebar */}
        <div className="login-left">
        <img src="https://tse2.mm.bing.net/th/id/OIP.EqeLMDQOf9OzQS4qDXLU8wHaD1?rs=1&pid=ImgDetMain&o=7&rm=3" alt="Hospital Logo" className="sidebar-logo" />
        <h1 className="app-title">Hospital Management System</h1>
        <p className="app-subtitle">Choose your role to continue github action done</p>
      </div>

        {/* Right content */}
        <div className="login-right fade-in">
          <h2 className="login-title">Select Your Role</h2>
          <p className="login-caption">How would you like to login?</p>

          <div className="role-options">
            <button className="role-btn glow" onClick={() => navigate("/login/receptionist")}>
              <img src="/receptionist.png" alt="" className="role-icon" />
              Receptionist
            </button>

            <button className="role-btn glow" onClick={() => navigate("/login/doctor")}>
              <img src="/doctor.png" alt="" className="role-icon" />
              Doctor
            </button>

            <button className="role-btn glow" onClick={() => navigate("/login/patient")}>
              <img src="/patient.png" alt="" className="role-icon" />
              Patient
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoleSelect;
