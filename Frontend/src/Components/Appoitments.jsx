import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Stethoscope, User, AlertCircle, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import Navbar from "./Navbar";
import "./Appointments.css";

const Appointments = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/appointments/patient/${patientId}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          credentials: "include",
        });
        const data = await res.json();

        if (data.success) {
          setAppointments(data.appointments);
        }
      } catch (err) {
        console.error("Error fetching appointments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [patientId]);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner-container">
          <RefreshCw className="animate-spin" size={48} />
          <h2>Loading your appointments...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-layout">
      <Navbar role="patient" patientId={patientId} phone="" />

      <div className="appointments-container">
        <button className="back-btn-float" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className="appointments-header">
          <h1>My Booked Appointments</h1>
          <p>Review the schedule and check the statuses of your pending/approved clinical consultations.</p>
        </div>

        {appointments.length === 0 ? (
          <motion.div 
            className="empty-inline-box glass-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Calendar size={48} className="empty-icon" />
            <h3>No Appointments Booked Yet</h3>
            <p>Go to Patient Home and search for a hospital to schedule one.</p>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>Browse Hospitals</button>
          </motion.div>
        ) : (
          <motion.div 
            className="appointments-grid"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.04 } }
            }}
          >
            <AnimatePresence>
              {appointments.map((app) => (
                <motion.div 
                  className="appointment-card glass-panel"
                  key={app._id}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -3 }}
                >
                  <div className="card-top-row">
                    <div className="doc-avatar-small">
                      <Stethoscope size={18} />
                    </div>
                    <div className="doc-title-block">
                      <h3>Dr. {app.doctor?.name || "Medical Practitioner"}</h3>
                      <span className="spec-text">{app.doctor?.specialization || "General Practitioner"}</span>
                    </div>
                    <span className={`status-tag status-${(app.status || "pending").toLowerCase()}`}>
                      {app.status || "Pending"}
                    </span>
                  </div>

                  <hr className="card-divider" />

                  <div className="card-info-fields">
                    <div className="info-field-item">
                      <Calendar size={14} />
                      <span>{new Date(app.date).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                    </div>
                    <div className="info-field-item">
                      <Clock size={14} />
                      <span>{app.slot}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
