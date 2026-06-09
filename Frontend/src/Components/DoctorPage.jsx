import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Stethoscope, Briefcase, Award, Building, User, Calendar, RefreshCw, ToggleLeft, ToggleRight, ArrowLeft, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import Navbar from "./Navbar";
import "./DoctorPage.css";

const DoctorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // doctorId
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const hospitalId = query.get("hospital");
  const initialDate = query.get("date") || new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(initialDate);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // If hospitalId is present in query string, the receptionist is accessing this page.
  // Otherwise, the doctor themselves is logged in.
  const isReceptionist = !!hospitalId;

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctor/getDoctor/${id}`);
      const data = await res.json();
      if (data.success) setDoctor(data.doctor);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/appointments/doctor/${id}`);
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDoctor();
      await fetchAppointments();
      setLoading(false);
    };
    loadData();
  }, [id]);

  const toggleAvailability = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/receptionist/${id}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !doctor.available }),
      });

      const data = await res.json();
      if (data.success) setDoctor(data.doctor);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Appointment status updated to ${newStatus}`);
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner-container">
          <RefreshCw className="animate-spin" size={48} />
          <h2>Syncing medical workspace...</h2>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="error-page">
        <Stethoscope size={64} className="error-icon" />
        <h2>Physician Profile Not Found</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  // Filter appointments for the selected date
  const filteredAppointments = appointments.filter((app) => {
    const appDate = new Date(app.date).toISOString().split("T")[0];
    return appDate === date;
  });

  const completedCount = filteredAppointments.filter(a => a.status === "completed").length;
  const pendingCount = filteredAppointments.filter(a => a.status === "booked").length;

  return (
    <div className="doctor-page-layout">
      <Navbar 
        userName={doctor.name} 
        role={isReceptionist ? "receptionist" : "doctor"} 
        phone={doctor.phone} 
      />

      <div className="doctor-page-container">
        {isReceptionist && (
          <button className="back-btn-float" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
        )}

        {/* PROFILE SUMMARY BAR */}
        <motion.div 
          className="doctor-profile-card glass-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="doctor-card-left">
            <div className="doctor-image-wrapper">
              <img
                src={doctor.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"}
                alt={doctor.name}
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300";
                }}
              />
            </div>
            <h2>Dr. {doctor.name}</h2>
            <p className="doctor-dept-sub">
              {doctor.departments?.map((d) => d.name).join(", ") || "General Medicine"}
            </p>
          </div>

          <div className="doctor-card-right">
            <div className="practitioner-header-row">
              <h3>{isReceptionist ? "Clinical Practitioner Bio" : "Physician Workspace Dashboard"}</h3>
              {!isReceptionist && (
                <div className="date-picker-inline glass-panel">
                  <Calendar size={14} />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              )}
            </div>
            
            <div className="practitioner-details-grid">
              <div className="detail-item">
                <Award className="detail-icon" />
                <div>
                  <span className="detail-label">Experience</span>
                  <strong className="detail-value">{doctor.experience} Years</strong>
                </div>
              </div>

              <div className="detail-item">
                <Building className="detail-icon" />
                <div>
                  <span className="detail-label">Base Hospital</span>
                  <strong className="detail-value">{doctor.hospital?.name || "Facility Center"}</strong>
                </div>
              </div>

              <div className="detail-item">
                <Stethoscope className="detail-icon" />
                <div>
                  <span className="detail-label">Qualifications</span>
                  <strong className="detail-value">{doctor.qualifications || "MBBS"}</strong>
                </div>
              </div>

              <div className="detail-item">
                <Clock className="detail-icon" />
                <div>
                  <span className="detail-label">Shift Hours</span>
                  <strong className="detail-value">{doctor.workingHours?.start} - {doctor.workingHours?.end} ({doctor.slotDuration}m slots)</strong>
                </div>
              </div>
            </div>

            <div className="availability-toggle-row glass-panel">
              <div className="availability-info">
                <span>Duty Availability</span>
                <p className="avail-desc">Toggle availability status for daily queues.</p>
              </div>

              <button 
                className={`avail-toggle-btn ${doctor.available ? "active" : ""}`}
                onClick={toggleAvailability}
              >
                {doctor.available ? (
                  <>
                    <span>Available</span>
                    <ToggleRight size={32} />
                  </>
                ) : (
                  <>
                    <span>Unavailable</span>
                    <ToggleLeft size={32} />
                  </>
                )}
              </button>
            </div>

            {isReceptionist && (
              <div className="doctor-card-actions">
                <button
                  className="btn btn-primary schedule-btn"
                  onClick={() =>
                    navigate(`/receptionist/doctor/${id}/appointments?hospital=${hospitalId}&date=${date}`)
                  }
                >
                  <Calendar size={18} /> Manage Appointment Schedule
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* DOCTOR EXCLUSIVE INTERACTIVE SCHEDULE BOARD */}
        {!isReceptionist && (
          <motion.section 
            className="doctor-schedule-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Clinical Stats counters */}
            <div className="clinical-stats-row">
              <div className="stat-pill glass-panel">
                <span className="stat-val blue">{filteredAppointments.length}</span>
                <span className="stat-lbl">Today's Visits</span>
              </div>
              <div className="stat-pill glass-panel">
                <span className="stat-val yellow">{pendingCount}</span>
                <span className="stat-lbl">Pending Queue</span>
              </div>
              <div className="stat-pill glass-panel">
                <span className="stat-val green">{completedCount}</span>
                <span className="stat-lbl">Consulted</span>
              </div>
            </div>

            <div className="section-title-row">
              <Calendar className="section-title-icon" />
              <h2>Daily Consultations - {date}</h2>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="empty-inline-box glass-panel">
                <Clock size={40} className="empty-icon" />
                <h3>No appointments booked for this date</h3>
                <p>Enjoy your downtime or pick another shift date to review queues.</p>
              </div>
            ) : (
              <div className="doctor-appointments-list">
                <AnimatePresence>
                  {filteredAppointments.map((app, idx) => (
                    <motion.div 
                      key={app._id} 
                      className={`doctor-appt-row glass-panel status-${(app.status || "booked").toLowerCase()}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                    >
                      <div className="appt-meta-block">
                        <div className="appt-time">
                          <Clock size={16} />
                          <span>{app.slot}</span>
                        </div>
                        <div className="patient-name-label">
                          <User size={16} />
                          <span>{app.patient?.name || "Patient Member"}</span>
                        </div>
                      </div>

                      <div className="appt-reason">
                        <FileText size={16} className="reason-icon" />
                        <span>Reason: <strong>{app.reason || "General Consultation"}</strong></span>
                      </div>

                      <div className="appt-actions-row">
                        <span className={`status-badge status-${(app.status || "booked").toLowerCase()}`}>
                          {app.status}
                        </span>

                        {app.status === "booked" && (
                          <div className="action-buttons-grp">
                            <button 
                              className="btn-action-small success"
                              onClick={() => updateStatus(app._id, "completed")}
                              disabled={actionLoading}
                              title="Mark Visited"
                            >
                              <CheckCircle2 size={16} />
                              <span>Visited</span>
                            </button>
                            <button 
                              className="btn-action-small danger"
                              onClick={() => updateStatus(app._id, "cancelled")}
                              disabled={actionLoading}
                              title="Cancel Appointment"
                            >
                              <XCircle size={16} />
                              <span>Cancel</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default DoctorPage;
