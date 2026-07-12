import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, UserCheck, UserPlus, AlertCircle, ArrowLeft, RefreshCw, X } from "lucide-react";
import Navbar from "./Navbar";
import "./DoctorAppointments.css";

const DoctorAppointments = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const hospitalId = query.get("hospital");
  const initialDate = query.get("date") || new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(initialDate);
  const [slots, setSlots] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/appointments/slots?doctor=${id}&hospital=${hospitalId}&date=${date}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          credentials: "include"
        }
      );
      const data = await res.json();
      if (data.success) setSlots(data.slots);
    } catch (err) {
      console.error(err);
      alert("Failed to load slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hospitalId) fetchSlots();
  }, [id, date, hospitalId]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/patient`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      credentials: "include"
    })
      .then((r) => r.json())
      .then((d) => setPatients(d.patients || []));
  }, []);

  const bookSlot = async () => {
    if (!selectedPatient || !selectedSlot) return alert("Select patient and slot");

    try {
      setBooking(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/appointments/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          doctor: id,
          patient: selectedPatient,
          hospital: hospitalId,
          date,
          slot: selectedSlot,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      alert("Appointment booked successfully");
      setSelectedSlot(null);
      setSelectedPatient("");
      fetchSlots();
    } catch (err) {
      alert(err.message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="appt-sched-layout">
      <Navbar role="receptionist" phone="" />

      <div className="appt-sched-container">
        <div className="header-nav-row">
          <button className="back-btn-float" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>

          <div className="date-filter-card glass-panel">
            <Calendar size={16} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="sched-header">
          <h1>Doctor Consultation Schedule</h1>
          <p>Review daily slot statuses, book physical walk-in patients, and manage bookings.</p>
        </div>

        {loading ? (
          <div className="loading-page inline-spinner">
            <RefreshCw className="animate-spin" size={48} />
            <h2>Syncing schedules...</h2>
          </div>
        ) : (
          <motion.div 
            className="sched-slots-grid"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.03 } }
            }}
          >
            {slots.map((s) => (
              <motion.div 
                key={s.slot} 
                className={`sched-slot-card glass-panel status-${(s.status || "free").toLowerCase()}`}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1 }
                }}
              >
                <div className="slot-badge-row">
                  <div className="slot-time-badge">
                    <Clock size={14} />
                    <span>{s.slot}</span>
                  </div>

                  <span className={`status-dot-tag status-${(s.status || "free").toLowerCase()}`}>
                    {s.status}
                  </span>
                </div>

                <div className="slot-patient-info">
                  <span className="patient-label">Assigned Patient</span>
                  <strong className="patient-value">
                    {s.patientName ? (
                      <>
                        <UserCheck size={14} />
                        {s.patientName}
                      </>
                    ) : (
                      "Unassigned / Open Slot"
                    )}
                  </strong>
                </div>

                {s.status === "free" && (
                  <button
                    className="btn btn-primary btn-full-width btn-small-text"
                    disabled={booking}
                    onClick={() => setSelectedSlot(s.slot)}
                  >
                    <UserPlus size={14} />
                    Assign Patient
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* BOOKING DIALOG MODAL */}
        <AnimatePresence>
          {selectedSlot && (
            <div className="modal-backdrop">
              <motion.div 
                className="modal-content-card glass-panel"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="modal-header-row">
                  <h3>Assign Walk-in Patient</h3>
                  <button className="close-modal-btn" onClick={() => setSelectedSlot(null)}>
                    <X size={18} />
                  </button>
                </div>

                <p className="modal-desc">
                  Booking slot <strong>{selectedSlot}</strong> on <strong>{date}</strong>
                </p>

                <div className="form-group">
                  <label className="input-label">Select Patient Directory</label>
                  <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
                    <option value="">Choose Patient</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (+91-{p.phonenumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-footer-actions">
                  <button className="btn btn-secondary" onClick={() => setSelectedSlot(null)} disabled={booking}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={bookSlot} disabled={booking || !selectedPatient}>
                    {booking ? <RefreshCw className="animate-spin" size={16} /> : "Confirm Slot Assignment"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DoctorAppointments;
