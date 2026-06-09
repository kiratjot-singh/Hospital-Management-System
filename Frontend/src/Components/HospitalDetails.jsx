import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "framer-motion";
import axios from "axios";
import { Phone, Mail, MapPin, Calendar, Building, Award, ShieldAlert, ArrowLeft } from "lucide-react";
import Navbar from "./Navbar";
import "./HospitalDetails.css";

const HospitalDetails = () => {
  const { id } = useParams();

  const [hospital, setHospital] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getDetails = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/patient/hospitaldetails/${id}`
        );

        if (res.data.success) {
          setHospital(res.data.hospital);
          setDepartments(res.data.departments || []);
        }
      } catch (err) {
        console.log("❌ Error fetching hospital details:", err);
      } finally {
        setLoading(false);
      }
    };

    getDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner-container">
          <RefreshCw className="animate-spin" size={48} />
          <h2>Loading hospital info...</h2>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="error-page">
        <ShieldAlert size={64} className="error-icon" />
        <h2>Hospital Not Found</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="details-layout">
      <Navbar role="patient" phone="" />

      <div className="details-container">
        <button className="back-btn-float" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        {/* HERO SECTION */}
        <motion.div 
          className="hospital-details-hero"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hero-info-pane">
            <div className="type-badge">
              {hospital.isPrivate ? "Private Healthcare" : "Government Health Center"}
            </div>
            <h1>{hospital.name}</h1>
            
            <div className="info-meta-list">
              <div className="meta-item">
                <MapPin size={16} />
                <span>{hospital.address.city}, {hospital.address.state} – {hospital.address.pincode}</span>
              </div>
              <div className="meta-item">
                <Calendar size={16} />
                <span>Established in {hospital.establishedYear}</span>
              </div>
            </div>

            <hr className="pane-divider" />

            <div className="contact-meta">
              <h3>Contact Desk</h3>
              <div className="meta-item">
                <Phone size={16} />
                <span>{hospital.contact.phone}</span>
              </div>
              <div className="meta-item">
                <Mail size={16} />
                <span>{hospital.contact.email}</span>
              </div>
            </div>
          </div>

          <div className="hero-image-pane">
            <img
              src={hospital.image || "https://images.unsplash.com/photo-1586773860418-d37222d8fce3"}
              alt={hospital.name}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1586773860418-d37222d8fce3";
              }}
            />
          </div>
        </motion.div>

        {/* DEPARTMENTS LIST */}
        <motion.section 
          className="departments-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="section-title-row">
            <Award className="section-title-icon" />
            <h2>Clinical Departments</h2>
          </div>

          {departments.length === 0 ? (
            <div className="empty-inline-box glass-panel">
              <Building size={32} />
              <p>No active departments registered for this hospital.</p>
            </div>
          ) : (
            <div className="dept-grid">
              {departments.map((dept, idx) => (
                <motion.div
                  className="dept-link-card glass-panel"
                  key={dept._id}
                  onClick={() => navigate(`/hospital/${id}/department/${dept._id}`)}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <span className="card-dot"></span>
                  <span className="dept-name-text">{dept.name}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

import { RefreshCw } from "lucide-react"; // Inline resolve dependency
export default HospitalDetails;
