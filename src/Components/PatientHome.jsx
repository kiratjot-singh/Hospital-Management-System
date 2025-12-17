import React, { useState } from "react";
import "./PatientHome.css";

const PatientHome = () => {
  const [search, setSearch] = useState("");
  const username = "Opinder";

  const hospitals = [
    { id: 1, name: "City Care Hospital", area: "Amritsar" },
    { id: 2, name: "Fortis Healthcare", area: "Amritsar" },
    { id: 3, name: "LifeLine Hospital", area: "Amritsar" },
    { id: 4, name: "Apollo Clinic", area: "Amritsar" },
      { id: 5, name: "City Care Hospital", area: "Amritsar" },
    { id: 6, name: "Fortis Healthcare", area: "Amritsar" },
    { id: 7, name: "LifeLine Hospital", area: "Amritsar" },
    { id: 8, name: "Apollo Clinic", area: "Amritsar" }
  ];

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-page">
      <header className="navbar">
        <div className="nav-inner">
          <div className="nav-left">Hi, {username}</div>

          <div className="nav-right">
            <button className="nav-btn"> Booked Appointments</button>
            <button className="nav-btn">Saved Hospitals</button>
            <button className="nav-btn">My Reports</button>
            <div className="profile-logo">👤</div>
          </div>
        </div>
      </header>

      <section className="search-section">
        <div className="search-inner">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search hospitals in your area"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <main className="content">
        <h2>Hospitals near you</h2>

        <div className="hospital-list">
          {filtered.map(h => (
            <div key={h.id} className="hospital-row">
              <div>
                <h3>{h.name}</h3>
                <span>{h.area}</span>
              </div>
              <button className="view-btn">View</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PatientHome;




