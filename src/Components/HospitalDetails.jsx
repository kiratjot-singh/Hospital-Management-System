import React from "react";
import "./HospitalDetails.css";

const HospitalDetails = () => {
  const hospital = {
    name: "City Care Hospital",
    location: "Amritsar, Punjab",
    rating: 4.5,
    description:
      "City Care Hospital is a multi-speciality hospital providing advanced healthcare services with experienced doctors and modern facilities.",
  };

  const departments = [
    { name: "Cardiology", icon: "❤️" },
    { name: "Neurology", icon: "🧠" },
    { name: "Orthopedics", icon: "🦴" },
    { name: "Pediatrics", icon: "👶" },
    { name: "Dermatology", icon: "🧴" },
    { name: "ENT", icon: "👂" },
    { name: "General Medicine", icon: "🩺" },
    { name: "Emergency", icon: "🚑" },
  ];

  return (
    <div className="hospital-page">
      <div className="hospital-hero">
        <div className="hero-left">
          <h1>{hospital.name}</h1>
          <p className="location">{hospital.location}</p>
          <p className="rating">⭐ {hospital.rating} / 5</p>
          <p className="desc">{hospital.description}</p>
        </div>

        <div className="hero-right">
          <img
            src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3"
            alt="hospital"
          />
        </div>
      </div>

      <div className="departments-section">
        <h2>Departments</h2>

        <div className="departments-grid">
          {departments.map((dept) => (
            <div key={dept.name} className="dept-card">
              <div className="dept-icon">{dept.icon}</div>
              <span>{dept.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HospitalDetails;