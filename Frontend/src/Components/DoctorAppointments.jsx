import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./DoctorAppointments.css";

const DoctorAppointments = () => {
  const { id } = useParams(); // doctorId
  const hospitalId = "HOSPITAL_ID"; // replace with real one

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSlots = async () => {
    setLoading(true);
    const res = await fetch(
      `http://localhost:5000/api/appointments/doctor-slots?doctor=${id}&hospital=${hospitalId}&date=${date}`
    );
    const data = await res.json();
    if (data.success) setSlots(data.slots);
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();
  }, [id, date]);

  useEffect(() => {
    fetch("http://localhost:5000/api/patients")
      .then((r) => r.json())
      .then((d) => setPatients(d.patients || []));
  }, []);

  const bookSlot = async () => {
    if (!selectedPatient || !selectedSlot) return alert("Select patient and slot");

    await fetch("http://localhost:5000/api/appointments/book", {
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

    setSelectedSlot(null);
    setSelectedPatient("");
    fetchSlots();
  };

  return (
    <div className="appointments-page">
      <h2>Doctor Schedule</h2>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <table className="appointments-table">
        <thead>
          <tr>
            <th>Slot</th>
            <th>Status</th>
            <th>Patient</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((s) => (
            <tr key={s.slot} className={s.status}>
              <td>{s.slot}</td>
              <td>{s.status}</td>
              <td>{s.patientName || "-"}</td>
              <td>
                {s.status === "free" && (
                  <button onClick={() => setSelectedSlot(s.slot)}>Book</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
            <button onClick={bookSlot}>Confirm Booking</button>
            <button onClick={() => setSelectedSlot(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
