import React from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorSlots.css";

const DoctorSlots = () => {
  const navigate = useNavigate();

  const dummySlots = [
    "10:00 AM - 10:30 AM",
    "10:30 AM - 11:00 AM",
    "11:00 AM - 11:30 AM",
    "11:30 AM - 12:00 PM",
    "02:00 PM - 02:30 PM",
    "02:30 PM - 03:00 PM",
    "03:00 PM - 03:30 PM",
  ];

  const handleBook = (slot) => {
    navigate("/confirm-appointment", {
      state: { slot },
    });
  };

  return (
    <div className="slots-section">
      <h2>Available Slots</h2>

      <div className="slots-grid">
        {dummySlots.map((slot, index) => (
          <div className="slot-card" key={index}>
            <span className="slot-time">{slot}</span>

            <button
              className="slot-book-btn"
              onClick={() => handleBook(slot)}
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

