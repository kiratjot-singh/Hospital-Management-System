import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Stethoscope, Building, Users, Clock, AlertCircle } from "lucide-react";
import Navbar from "./Navbar";
import "./ReceptionistHome.css";

const ReceptionistHome = () => {
  const navigate = useNavigate();
  const { phone } = useParams();

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchName = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/receptionist/getname`,
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchName();
  }, [phone]);

  const Doctors = user?.hospital?.doctors || [];

  const filtered = Doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="receptionist-layout">
      <Navbar userName={username} role="receptionist" phone={phone} />

      <main className="receptionist-container">
        {/* HOSPITAL SUMMARY BANNER */}
        {user?.hospital && (
          <motion.section 
            className="hospital-hero-banner"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="banner-info-left">
              <div className="badge-accent">
                <Building size={14} /> Assigned Base Hospital
              </div>
              <h1>{user.hospital.name}</h1>
              <p className="hospital-area">📍 {user.hospital.area || "City Campus"}</p>
            </div>

            <div className="banner-stats-right">
              <div className="stat-card glass-panel">
                <Users size={20} />
                <div>
                  <span className="stat-num">{Doctors.length}</span>
                  <span className="stat-label">Doctors</span>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <Calendar size={20} />
                <div>
                  <span className="stat-num">{date}</span>
                  <span className="stat-label">Active Schedule</span>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* SEARCH & FILTERS CONTROLS */}
        <section className="search-filter-section glass-panel">
          <div className="search-box-wrapper no-border">
            <Search className="search-box-icon" />
            <input
              type="text"
              placeholder="Search Doctor by Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="date-picker-wrapper">
            <Calendar size={18} className="date-picker-icon" />
            <input
              type="date"
              className="inline-date-picker"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </section>

        {/* DOCTORS GRID */}
        <section className="doctors-list-block">
          <h2>Assigned Doctors</h2>

          {isLoading ? (
            <div className="loading-grid">
              {[1, 2].map(n => (
                <div key={n} className="doctor-item-row skeleton-loading">
                  <div className="skeleton skeleton-avatar"></div>
                  <div className="skeleton skeleton-title"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="doctor-rows-list">
              <AnimatePresence>
                {filtered.length > 0 ? (
                  filtered.map((d, index) => (
                    <motion.div 
                      key={d._id} 
                      className="doctor-item-row glass-panel"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="doctor-row-left">
                        <div className="doctor-avatar-circle">
                          <Stethoscope size={20} />
                        </div>
                        <div>
                          <h3>{d.name}</h3>
                          <span className="specialty-subtext">{d.specialty || d.area || "General Practitioner"}</span>
                        </div>
                      </div>

                      <div className="doctor-row-right">
                        <span className={`availability-tag ${d.available ? "online" : "offline"}`}>
                          {d.available ? "Active" : "Away"}
                        </span>
                        
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            navigate(`/doctor/${d._id}?hospital=${user.hospital._id}&date=${date}`)
                          }
                        >
                          Manage Schedule
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="empty-inline-box glass-panel">
                    <AlertCircle size={32} />
                    <p>No doctors match your search or are assigned to this facility.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ReceptionistHome;
