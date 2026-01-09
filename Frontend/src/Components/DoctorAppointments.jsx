import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./DoctorAppointments.css";

const DoctorAppointments = () => {
  const { id } = useParams(); // doctorId
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const hospitalId = query.get("hospital");
  const initialDate = query.get("date") || new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(initialDate);
  const [slots, setSlots] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/appointments/slots?doctor=${id}&hospital=${hospitalId}&date=${date}`
      );
      const data = await res.json();
      if (data.success) setSlots(data.slots);
    } catch (err) {
      console.error(err);
      alert("Failed to load slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hospitalId) fetchSlots();
  }, [id, date, hospitalId]);

  useEffect(() => {
    fetch("http://localhost:5000/api/patient")
      .then((r) => r.json())
      .then((d) => setPatients(d.patients || []));
  }, []);

  const bookSlot = async () => {
    if (!selectedPatient || !selectedSlot) return alert("Select patient and slot");

    try {
      setBooking(true);
      const res = await fetch("http://localhost:5000/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor: id,
          patient: selectedPatient,
          hospital: hospitalId,
          date,
          slot: selectedSlot,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      alert("Appointment booked successfully");
      setSelectedSlot(null);
      setSelectedPatient("");
      fetchSlots();
    } catch (err) {
      alert(err.message);
    } finally {
      setBooking(false);
    }
  };

    return (
  <div className="appointments-page">
    <h2>Doctor Schedule</h2>

    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

    {loading ? (
      <div className="loading">Loading slots...</div>
    ) : (
      <div className="appointments-grid">
        {slots.map((s) => (
          <div key={s.slot} className={`appointment-card ${s.status}`}>
            <div className="appt-row">
              <span className="appt-label">Slot</span>
              <span className="appt-value">{s.slot}</span>
            </div>

            <div className="appt-row">
              <span className="appt-label">Status</span>
              <span className={`status ${s.status}`}>{s.status}</span>
            </div>

            <div className="appt-row">
              <span className="appt-label">Patient</span>
              <span className="appt-value">{s.patientName || "-"}</span>
            </div>

            {s.status === "free" && (
              <button
                className="slot-book-btn"
                disabled={booking}
                onClick={() => setSelectedSlot(s.slot)}
              >
                Book
              </button>
            )}
          </div>
        ))}
      </div>
    )}

    {selectedSlot && (
      <div className="booking-modal">
        <h3>Book {selectedSlot}</h3>

        <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
          <option value="">Select Patient</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="modal-actions">
          <button disabled={booking} onClick={bookSlot}>
            {booking ? "Booking..." : "Confirm Booking"}
          </button>
          <button disabled={booking} onClick={() => setSelectedSlot(null)}>
            Cancel
          </button>
        </div>
      </div>
    )}
  </div>
);

};

export default DoctorAppointments;
