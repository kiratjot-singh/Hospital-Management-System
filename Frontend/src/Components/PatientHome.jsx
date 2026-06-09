import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Search, MapPin, Star, Building2, ArrowRight, RefreshCw, Heart } from "lucide-react";
import Navbar from "./Navbar";
import ChatAgent from "./ChatAgent";
import "./PatientHome.css";

const PatientHome = () => {
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("");
  const [patientId, setPatientId] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { phone } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const gethospitals = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/hospital/getHospitals`);
        if (res.data.success) {
          setHospitals(res.data.hospitals);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    gethospitals();
  }, [phone]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/patient/me`,
          { withCredentials: true }
        );
        setPatientId(res.data.patient._id);
        setUsername(res.data.patient.name);
      } catch (err) {
        console.log(err);
      }
    };
    fetchProfile();
  }, []);

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    (h.area && h.area.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="home-page">
      <Navbar userName={username} role="patient" patientId={patientId} phone={phone} />

      <main className="home-container">
        {/* WELCOME HERO SECTION */}
        <motion.section 
          className="hero-banner"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hero-text-content">
            <motion.div 
              className="badge-accent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
            >
              <Heart size={14} fill="currentColor" /> Premium Digital Health Care
            </motion.div>
            <h1>Find and Book Leading Healthcare Services</h1>
            <p>
              Connect with state-of-the-art hospitals, certified medical specialists, and request appointments instantly.
            </p>
          </div>

          <div className="hero-bg-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
          </div>
        </motion.section>

        {/* SEARCH BAR SECTION */}
        <section className="search-section">
          <div className="search-box-wrapper">
            <Search className="search-box-icon" />
            <input
              type="text"
              placeholder="Search by hospital name or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search-btn" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
        </section>

        {/* HOSPITALS GRID */}
        <section className="hospitals-section">
          <div className="section-header-row">
            <h2>Hospitals Available</h2>
            <span className="count-badge">{filtered.length} found</span>
          </div>

          {isLoading ? (
            <div className="loading-grid">
              {[1, 2, 3].map(n => (
                <div key={n} className="hospital-card skeleton-loading">
                  <div className="skeleton skeleton-img"></div>
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-subtitle"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="hospital-grid"
              layout
            >
              <AnimatePresence>
                {filtered.map((h, index) => (
                  <motion.div
                    key={h._id}
                    className="hospital-card glass-panel"
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: "var(--shadow-lg)" }}
                  >
                    <div className="hospital-card-banner">
                      <Building2 className="hospital-banner-icon" />
                      <div className="rating-badge">
                        <Star size={12} fill="currentColor" />
                        <span>4.8</span>
                      </div>
                    </div>

                    <div className="hospital-card-body">
                      <h3>{h.name}</h3>
                      <div className="area-info">
                        <MapPin size={14} />
                        <span>{h.area || "General Area"}</span>
                      </div>
                    </div>

                    <div className="hospital-card-footer">
                      <button 
                        className="btn btn-primary btn-full-width" 
                        onClick={() => navigate(`/hospitaldetails/${h._id}`)}
                      >
                        Explore Hospital
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!isLoading && filtered.length === 0 && (
                <motion.div 
                  className="empty-state glass-panel"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Building2 size={48} className="empty-icon" />
                  <h3>No hospitals match your search</h3>
                  <p>Try searching with another keyword or checking spelling.</p>
                  <button className="btn btn-secondary" onClick={() => setSearch("")}>Reset Search</button>
                </motion.div>
              )}
            </motion.div>
          )}
        </section>
      </main>

      <ChatAgent patientId={patientId} />
    </div>
  );
};

export default PatientHome;
