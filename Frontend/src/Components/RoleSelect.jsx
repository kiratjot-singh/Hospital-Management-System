import React from "react";
import { useNavigate } from "react-router-dom";
import "./RoleSelect.css";

const RoleSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="role-page">
      <div className="role-card">
        <h1 className="role-title">Select Your Role</h1>
        <p className="role-subtitle">Choose how you want to continue</p>

        <div className="role-options">
          <button
            className="role-btn"
            onClick={() => navigate("/login/receptionist")}
          >
            Receptionist
          </button>

          <button
            className="role-btn"
            onClick={() => navigate("/login/doctor")}
          >
            Doctor
          </button>
          

          <button
            className="role-btn"
            onClick={() => navigate("/login/patient")}
          >
            Patient
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
