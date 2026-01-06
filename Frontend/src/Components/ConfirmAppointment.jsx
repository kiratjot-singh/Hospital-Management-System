import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./ConfirmAppointment.css";

const ConfirmAppointment = () => {
  const navigate = useNavigate();
  const { doctorId, hospitalId, date } = useParams();
  const params=useParams();
const slot = decodeURIComponent(params.slot);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const patientId = localStorage.getItem("patientId");

  if (!doctorId || !hospitalId || !date || !slot) {
    return <h3 className="error-text">❌ Invalid appointment data</h3>;
  }


  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post("http://localhost:5000/api/appointments/book",
  {
    doctor: doctorId,
    hospital: hospitalId,
    date,
    slot,
    reason,
  },
  {
    withCredentials: true, 
  }
);

      if (res.data.success) {
        alert("✅ Appointment booked successfully");
        navigate("/my-appointments");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="confirm-container">
      <h2>Confirm Appointment</h2>

      <div className="summary-card">
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Slot:</strong> {slot}</p>
      </div>

      <textarea
        placeholder="Reason for visit (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      {error && <p className="error-text">{error}</p>}

      <button
        className="confirm-btn"
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? "Booking..." : "Confirm Appointment"}
      </button>
    </div>
  );
};

export default ConfirmAppointment;
