import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./DoctorAppointments.css";

const DoctorAppointments = () => {
  const { id } = useParams();
  console.log("Doctor ID from params:", id);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      const res = await fetch(`http://localhost:5000/api/receptionist/doctor/${id}/appointments`);
      const data = await res.json();
      if (data.success) setAppointments(data.appointments);
      setLoading(false);
    };

    fetchAppointments();
  }, [id]);

  if (loading) return <div className="loading">Loading appointments…</div>;

  return (
    <div className="appointments-page">
      <h2>Doctor Appointments</h2>

      {appointments.length === 0 ? (
        <p className="empty">No appointments found.</p>
      ) : (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Slot</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id}>
                <td>{a.doctorName || "-"}</td>
                <td>{a.patientName || "-"}</td>
                <td>{new Date(a.date).toLocaleDateString()}</td>
                <td>{a.slot}</td>
                <td>
                  <span className={`status ${a.status}`}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DoctorAppointments;
