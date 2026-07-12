import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Calendar, Clock, ClipboardList, CheckCircle2, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import Navbar from "./Navbar";
import "./ConfirmAppointment.css";

const ConfirmAppointment = () => {
  const navigate = useNavigate();
  const { doctorId, hospitalId, date, slot } = useParams();
  const decodedSlot = decodeURIComponent(slot);

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const patientId = localStorage.getItem("patientId");

  if (!doctorId || !hospitalId || !date || !decodedSlot || !patientId) {
    return (
      <div className="error-page">
        <AlertCircle size={64} className="error-icon" />
        <h2>Invalid Appointment Credentials</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/appointments/book`,
        {
          doctor: doctorId,
          hospital: hospitalId,
          date,
          slot: decodedSlot,
          reason,
          patient: patientId,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        alert("✅ Appointment booked successfully");
        navigate(`/appointments/${patientId}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="confirm-layout">
      <Navbar role="patient" phone="" />

      <div className="confirm-container">
        <button className="back-btn-float" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        <motion.div 
          className="confirm-booking-card glass-panel"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="confirm-card-header">
            <CheckCircle2 className="confirm-header-icon" />
            <div>
              <h2>Verify Appointment Details</h2>
              <p>Please review your session timings and state your check-up details below.</p>
            </div>
          </div>

          <div className="booking-summary-grid">
            <div className="summary-field">
              <Calendar size={18} />
              <div>
                <span className="summary-label">Date Selected</span>
                <span className="summary-value">{date}</span>
              </div>
            </div>

            <div className="summary-field">
              <Clock size={18} />
              <div>
                <span className="summary-label">Time Slot</span>
                <span className="summary-value">{decodedSlot}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleConfirm} className="confirm-form">
            <div className="form-group">
              <label className="input-label">Reason for Visit (Optional)</label>
              <div className="textarea-wrapper">
                <textarea
                  placeholder="Tell your doctor about symptoms, followups, or requirements..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                />
                <ClipboardList size={18} className="textarea-icon" />
              </div>
            </div>

            {error && (
              <div className="error-box">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="primary-btn submit-confirm-btn" disabled={loading}>
              {loading ? <RefreshCw className="animate-spin" size={18} /> : "Confirm & Book Appointment"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmAppointment;
