import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Calendar, Clock, ArrowLeft, Heart, RefreshCw, AlertCircle } from "lucide-react";
import Navbar from "./Navbar";
import "./DoctorSlots.css";

const DoctorSlots = () => {
  const navigate = useNavigate();
  const { doctorId, hospitalId } = useParams();

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!date) return;

    const fetchSlots = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/appointments/free-slots`,
          {
            params: {
              doctor: doctorId,
              hospital: hospitalId,
              date,
            },
          }
        );

        if (res.data.success) {
          setSlots(res.data.freeSlots || []);
        } else {
          setError("Failed to load slots");
        }
      } catch (err) {
        console.error(err);
        setError("Server error while fetching slots");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [date, doctorId, hospitalId]);

  if (!doctorId || !hospitalId) {
    return (
      <div className="error-page">
        <AlertCircle size={64} className="error-icon" />
        <h2>Invalid Doctor or Hospital Parameters</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="slots-layout">
      <Navbar role="patient" phone="" />

      <div className="slots-container">
        <button className="back-btn-float" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        <motion.div 
          className="slots-selector-card glass-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="slots-card-header">
            <Calendar className="slots-header-icon" />
            <div>
              <h2>Select Consultation Schedule</h2>
              <p>Choose a date to review available time slots for your visit.</p>
            </div>
          </div>

          <div className="date-picker-row">
            <label className="input-label">Appointment Date</label>
            <input
              type="date"
              className="date-picker-input"
              min={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {error && (
            <div className="error-box">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <hr className="slots-divider" />

          {/* SLOTS DISPLAY */}
          <div className="slots-display-area">
            {loading && (
              <div className="loading-inline">
                <RefreshCw className="animate-spin" />
                <span>Fetching free slots...</span>
              </div>
            )}

            {!loading && !date && (
              <div className="prompt-select-date">
                <Clock size={32} />
                <p>Please select an appointment date to fetch available slots.</p>
              </div>
            )}

            {!loading && date && slots.length === 0 && (
              <div className="prompt-select-date empty-slots">
                <Clock size={32} />
                <p>No free consultation slots available for this date. Please try another day.</p>
              </div>
            )}

            {!loading && date && slots.length > 0 && (
              <motion.div 
                className="slots-time-grid"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.03 } }
                }}
              >
                {slots.map((slot) => (
                  <motion.div 
                    key={slot} 
                    className="time-slot-card glass-panel"
                    variants={{
                      hidden: { opacity: 0, scale: 0.95 },
                      visible: { opacity: 1, scale: 1 }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Clock size={16} className="slot-clock-icon" />
                    <span className="slot-time-text">{slot}</span>
                    <button
                      className="btn btn-primary slot-action-btn"
                      onClick={() => {
                        navigate(
                          `/confirm-appointment/${doctorId}/${hospitalId}/${date}/${encodeURIComponent(
                            slot
                          )}`
                        );
                      }}
                    >
                      Book Slot
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorSlots;
