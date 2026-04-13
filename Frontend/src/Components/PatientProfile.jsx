import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

  if (loading) return <div className="profile-state">Loading...</div>;
  if (error)   return <div className="profile-state">{error}</div>;
  if (!patient) return <div className="profile-state">No profile found</div>;

  const initials = patient.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="profile-page">
      <button className="profile-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">{initials}</div>
          <h2 className="profile-name">{patient.name}</h2>
        </div>

        <hr className="profile-divider" />

        <div className="profile-info-list">
          <div className="profile-info-item">
            <span className="profile-info-label">Phone</span>
            <span className="profile-info-value">{patient.phonenumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;