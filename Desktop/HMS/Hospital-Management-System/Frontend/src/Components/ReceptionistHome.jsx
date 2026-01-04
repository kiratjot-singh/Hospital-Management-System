import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ReceptionistHome.css";

const ReceptionistHome = () => {
  const navigate = useNavigate();  // ✅ FIXED
  const { phone } = useParams();

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");

  // ==========================
  // Fetch receptionist details
  // ==========================
  useEffect(() => {
    const fetchName = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/receptionist/getname",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
          }
        );

        const data = await response.json();

        if (data.success) {
          setUser(data.user);
          setUsername(data.user.name);
        } else {
          setUsername("Reception");
        }
      } catch (error) {
        console.log(error);
        setUsername("Receptionist");
      }
    };

    fetchName();
  }, [phone]);

  // ==========================
  // Extract doctors array
  // ==========================
  const Doctors = user?.hospital?.doctors || [];

  // ==========================
  // Filter doctors by search
  // ==========================
  const filtered = Doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-page">
      <header className="navbar">
        <div className="nav-inner">
          <div className="nav-left">Hi, {username}</div>

          <div className="nav-right">
            <button className="nav-btn">Booked Appointments</button>
            <button className="nav-btn">My Reports</button>
            <button className="nav-btn">👤</button>
          </div>
        </div>
      </header>

      <section className="search-section">
        <div className="search-inner">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search Doctor Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <main className="content">
        <h2>Doctors Assigned</h2>

        <div className="Doctor-list">
          {filtered.length > 0 ? (
            filtered.map((d) => (
              <div key={d._id} className="Doctor-row">
                <div>
                  <h3>{d.name}</h3>
                  <span>{d.area}</span>
                </div>

                <button
                  className="view-btn"
                  onClick={() => navigate(`/doctor/${d._id}`)}  // ✅ navigation fixed
                >
                  View
                </button>
              </div>
            ))
          ) : (
            <p>No doctors found</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReceptionistHome;
