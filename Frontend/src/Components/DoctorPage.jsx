import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./DoctorPage.css";

const DoctorPage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      const res = await fetch(
        `http://localhost:5000/api/doctor/getDoctor/${id}`
      );
      const data = await res.json();

      if (data.success) setDoctor(data.doctor);
    };

    fetchDoctor();
  }, [id]);

  if (!doctor) return <h2 style={{ padding: "20px" }}>Loading...</h2>;

  return (
    <div className="doctor-page">
      <div className="doctor-card">
        <h1>{doctor.name}</h1>
        <p><strong>Department:</strong> {doctor.area}</p>
        <p><strong>Experience:</strong> {doctor.experience} years</p>
        <p><strong>Hospital:</strong> {doctor.hospital?.name}</p>

        <button className="book-btn">Book Appointment</button>
      </div>
    </div>
  );
};

export default DoctorPage;
