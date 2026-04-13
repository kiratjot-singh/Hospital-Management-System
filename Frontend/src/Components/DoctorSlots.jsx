import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
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
    return <h3 className="error-text">❌ Invalid doctor or hospital</h3>;
  }

  return (
    <div className="slots-section">
      <h2 className="title">Select Appointment Date</h2>

      <input
        type="date"
        className="date-picker"
        min={new Date().toISOString().split("T")[0]}
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {loading && <p className="info-text">Loading slots...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && date && slots.length === 0 && (
        <p className="info-text">No slots available</p>
      )}

      <div className="slots-grid">
        {slots.map((slot) => (
          <div key={slot} className="slot-card">
            <span className="slot-time">{slot}</span>

            <button
              className="slot-book-btn"
              onClick={() => {
                navigate(
                  `/confirm-appointment/${doctorId}/${hospitalId}/${date}/${encodeURIComponent(
                    slot
                  )}`
                );
              }}
            >
              Book
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorSlots;
