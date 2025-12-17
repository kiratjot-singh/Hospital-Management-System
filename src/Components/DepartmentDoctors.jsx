import React from "react";
import "./DepartmentDoctors.css";

const DepartmentDoctors = () => {
  const department = "Cardiology";

  const doctors = [
    {
      id: 1,
      name: "Dr. Amanpreet Singh",
      qualification: "MBBS, MD (Cardiology)",
      experience: "12 years experience",
      fees: "₹800",
      image:
        "https://randomuser.me/api/portraits/men/32.jpg",
      available: "Mon - Fri",
    },
    {
      id: 2,
      name: "Dr. Neha Sharma",
      qualification: "MBBS, DM (Cardiology)",
      experience: "9 years experience",
      fees: "₹700",
      image:
        "https://randomuser.me/api/portraits/women/44.jpg",
      available: "Tue - Sat",
    },
    {
      id: 3,
      name: "Dr. Rajiv Mehta",
      qualification: "MBBS, MD (Cardiology)",
      experience: "15 years experience",
      fees: "₹1000",
      image:
        "https://randomuser.me/api/portraits/men/58.jpg",
      available: "Mon, Wed, Fri",
    },
  ];

  return (
    <div className="doctors-page">
      <div className="dept-header">
        <h1>{department} Doctors</h1>
        <p>Choose a doctor and book your appointment</p>
      </div>

      <div className="doctors-grid">
        {doctors.map((doc) => (
          <div key={doc.id} className="doctor-card">
            <img src={doc.image} alt={doc.name} />

            <div className="doctor-info">
              <h3>{doc.name}</h3>
              <p className="qualification">{doc.qualification}</p>
              <p className="experience">{doc.experience}</p>

              <div className="meta">
                <span className="fees">Consultation: {doc.fees}</span>
                <span className="available">{doc.available}</span>
              </div>

              <button className="book-btn">
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentDoctors;
  