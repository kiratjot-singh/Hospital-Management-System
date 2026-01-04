import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./DoctorPage.css";
import { useNavigate } from "react-router-dom";




const DoctorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/doctor/getDoctor/${id}`);
        const data = await res.json();
        if (data.success) setDoctor(data.doctor);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const toggleAvailability = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/receptionist/${id}/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ available: !doctor.available })
      });

      const data = await res.json();
      if (data.success) setDoctor(data.doctor);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="doctor-loading">Loading doctor profile…</div>;
  if (!doctor) return <div className="doctor-loading">Doctor not found</div>;


  
  return (
    <div className="doctor-page">
      <div className="doctor-card">
        {/* Left section */}
        <div className="doctor-left">
          <img
            src={doctor.image || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"}
            alt="Doctor"
            className="doctor-photo"
          />
          <h2>{doctor.name}</h2>
          <p className="department">{doctor.area}</p>
        </div>

        {/* Right section */}
        <div className="doctor-right">
          <div className="info-grid">
            <div>
              <span className="label">Experience</span>
              <span>{doctor.experience} years</span>
            </div>
            <div>
              <span className="label">Hospital</span>
              <span>{doctor.hospital?.name}</span>
            </div>
            <div>
              <span className="label">Status</span>
              <span className={`status ${doctor.available ? "available" : "unavailable"}`}>
                {doctor.available ? "Available" : "Unavailable"}
              </span>
            </div>
            <div>
              <span className="label">Today's Appointments</span>
              <span>{doctor.todayCount || 0}</span>
            </div>
          </div>

          <div className="actions">
           

            <button
              className="action-btn primary"
              onClick={() => navigate(`/receptionist/doctor/${id}/appointments`)}
            >
              View Appointments
            </button>
            <button className="action-btn secondary" onClick={toggleAvailability}>
            {doctor.available ? "Mark Unavailable" : "Mark Available"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPage;
