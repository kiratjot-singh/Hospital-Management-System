import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { motion } from "framer-motion";
import axios from "axios";
import { Stethoscope, Award, Calendar, ShieldAlert, ArrowLeft, Heart, RefreshCw } from "lucide-react";
import Navbar from "./Navbar";
import "./DepartmentDoctors.css";

const DepartmentDoctors = () => {
  const { departmentId, hospitalId } = useParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/doctor/deptdoctors/${departmentId}`
        );

        if (res.data.success) {
          setDoctors(res.data.doctors);
        }
      } catch (err) {
        console.error("❌ Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [departmentId]);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner-container">
          <RefreshCw className="animate-spin" size={48} />
          <h2>Finding doctors...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="doctors-list-layout">
      <Navbar role="patient" phone="" />

      <div className="doctors-container">
        <button className="back-btn-float" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className="dept-header-section">
          <h1>Clinical Specialists</h1>
          <p>Consult with highly qualified doctors and schedule appointments.</p>
        </div>

        {doctors.length === 0 ? (
          <div className="empty-inline-box glass-panel">
            <ShieldAlert size={48} className="empty-icon" />
            <h3>No doctors assigned</h3>
            <p>There are no doctors listed under this department currently.</p>
          </div>
        ) : (
          <div className="doctors-grid">
            {doctors.map((doc, idx) => (
              <motion.div 
                key={doc._id} 
                className="doctor-card-item glass-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }}
              >
                <div className="doctor-avatar-block">
                  <img
                    src={doc.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"}
                    alt={doc.name}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300";
                    }}
                  />
                  <span className={`status-pill ${doc.available ? "online" : "offline"}`}>
                    {doc.available ? "Active" : "Away"}
                  </span>
                </div>

                <div className="doctor-detail-block">
                  <div className="doctor-title-row">
                    <h3>Dr. {doc.name}</h3>
                    <div className="specialty-badge">{doc.qualifications || "Specialist"}</div>
                  </div>

                  <div className="doc-meta-row">
                    <div className="meta-pill">
                      <Award size={14} />
                      <span>{doc.experience || 0} Yrs Experience</span>
                    </div>
                  </div>

                  <div className="card-action-row">
                    <button
                      className="btn btn-primary btn-full-width"
                      disabled={!doc.available}
                      onClick={() => navigate(`/hospital/${hospitalId}/doctor/${doc._id}/slots`)}
                    >
                      <Calendar size={16} />
                      Book Consultation
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentDoctors;
