import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { User, Phone, ArrowLeft, Heart, RefreshCw, AlertCircle } from "lucide-react";
import Navbar from "./Navbar";
import "./PatientProfile.css";

const PatientProfile = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/patient/me`, {
          withCredentials: true,
        });
        setPatient(res.data.patient);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner-container">
          <RefreshCw className="animate-spin" size={48} />
          <h2>Fetching profile details...</h2>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="error-page">
        <AlertCircle size={64} className="error-icon" />
        <h2>{error || "Profile Not Found"}</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const initials = patient.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="profile-layout">
      <Navbar role="patient" patientId={patient._id} phone="" />

      <div className="profile-container">
        <button className="back-btn-float" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        <motion.div 
          className="profile-info-card glass-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="profile-card-header">
            <div className="avatar-initials-badge">{initials}</div>
            <h2>{patient.name}</h2>
            <span className="patient-portal-tag">Patient Member</span>
          </div>

          <hr className="profile-card-divider" />

          <div className="profile-fields-list">
            <div className="profile-field-row">
              <div className="field-meta">
                <User size={16} />
                <span>Full Name</span>
              </div>
              <strong className="field-value">{patient.name}</strong>
            </div>

            <div className="profile-field-row">
              <div className="field-meta">
                <Phone size={16} />
                <span>Registered Mobile</span>
              </div>
              <strong className="field-value">+91-{patient.phonenumber}</strong>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientProfile;