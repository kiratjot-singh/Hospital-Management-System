import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Stethoscope, Briefcase, Award, Building, User, Calendar, RefreshCw, ToggleLeft, ToggleRight, ArrowLeft, Clock, CheckCircle2, XCircle, FileText, AlertCircle } from "lucide-react";
import Navbar from "./Navbar";
import "./DoctorPage.css";

const DoctorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // doctorId
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const hospitalId = query.get("hospital");
  const initialDate = query.get("date") || new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(initialDate);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewTab, setViewTab] = useState("slots"); // "slots" | "appointments"

  // Shift config state
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [slotDuration, setSlotDuration] = useState(15);

  // Reschedule state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState("");

  // If hospitalId is present in query string, the receptionist is accessing this page.
  // Otherwise, the doctor themselves is logged in.
  const isReceptionist = !!hospitalId;

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctor/getDoctor/${id}`);
      const data = await res.json();
      if (data.success) setDoctor(data.doctor);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/appointments/doctor/${id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSlots = async () => {
    if (isReceptionist || !doctor) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/appointments/slots?doctor=${id}&hospital=${doctor.hospital?._id}&date=${date}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDoctor();
      setLoading(false);
    };
    loadData();
  }, [id, isReceptionist]);

  useEffect(() => {
    if (!isReceptionist && doctor) {
      fetchAppointments();
      fetchSlots();
      setShiftStart(doctor.workingHours?.start || "10:00");
      setShiftEnd(doctor.workingHours?.end || "17:00");
      setSlotDuration(doctor.slotDuration || 15);
    }
  }, [date, doctor, isReceptionist]);

  useEffect(() => {
    if (!rescheduleDate || !doctor) return;
    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/appointments/free-slots?doctor=${id}&hospital=${doctor.hospital?._id}&date=${rescheduleDate}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setRescheduleSlots(data.freeSlots || []);
          setSelectedRescheduleSlot("");
        }
      })
      .catch((err) => console.error(err));
  }, [rescheduleDate, doctor, id]);

  const toggleAvailability = async () => {
    const hasShiftConfig = doctor.workingHours?.start && doctor.workingHours?.end && doctor.slotDuration > 0;
    if (!hasShiftConfig) {
      alert("⚠️ You cannot toggle duty availability until you configure your daily shift hours and slot duration. Please click 'Edit' next to Shift Hours first!");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/receptionist/${id}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !doctor.available }),
      });

      const data = await res.json();
      if (data.success) setDoctor(data.doctor);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include"
      });

      const data = await res.json();
      if (data.success) {
        alert(`Appointment status updated to ${newStatus}`);
        fetchAppointments();
        fetchSlots();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateShift = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctor/shift`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          start: shiftStart,
          end: shiftEnd,
          slotDuration: Number(slotDuration),
        }),
        credentials: "include"
      });

      const data = await res.json();
      if (data.success) {
        alert("Shift updated successfully!");
        setShowShiftModal(false);
        setDoctor(data.doctor);
      } else {
        alert(data.message || "Failed to update shift");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating shift settings");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBlock = async (slotTime) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/appointments/slots/toggle-block`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          hospital: doctor.hospital?._id,
          date,
          slot: slotTime,
        }),
        credentials: "include"
      });

      const data = await res.json();
      if (data.success) {
        fetchSlots();
      } else {
        alert(data.message || "Failed to toggle block status");
      }
    } catch (err) {
      console.error(err);
      alert("Error blocking slot");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!selectedRescheduleSlot || !rescheduleDate) {
      alert("Please select a slot");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/appointments/${rescheduleAppt._id}/reschedule`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            date: rescheduleDate,
            slot: selectedRescheduleSlot,
          }),
          credentials: "include"
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Appointment rescheduled successfully!");
        setShowRescheduleModal(false);
        fetchAppointments();
        fetchSlots();
      } else {
        alert(data.message || "Failed to reschedule appointment");
      }
    } catch (err) {
      console.error(err);
      alert("Error rescheduling appointment");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner-container">
          <RefreshCw className="animate-spin" size={48} />
          <h2>Syncing medical workspace...</h2>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="error-page">
        <Stethoscope size={64} className="error-icon" />
        <h2>Physician Profile Not Found</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  // Filter appointments for the selected date
  const filteredAppointments = appointments.filter((app) => {
    const appDate = new Date(app.date).toISOString().split("T")[0];
    return appDate === date;
  });

  const completedCount = filteredAppointments.filter(a => a.status === "completed").length;
  const pendingCount = filteredAppointments.filter(a => a.status === "booked").length;

  return (
    <div className="doctor-page-layout">
      <Navbar 
        userName={doctor.name} 
        role={isReceptionist ? "receptionist" : "doctor"} 
        phone={doctor.phone} 
      />

      <div className="doctor-page-container">
        {isReceptionist && (
          <button className="back-btn-float" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
        )}

        {/* PROFILE SUMMARY BAR */}
        <motion.div 
          className="doctor-profile-card glass-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="doctor-card-left">
            <div className="doctor-image-wrapper">
              <img
                src={doctor.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"}
                alt={doctor.name}
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300";
                }}
              />
            </div>
            <h2>Dr. {doctor.name}</h2>
            <p className="doctor-dept-sub">
              {doctor.departments?.map((d) => d.name).join(", ") || "General Medicine"}
            </p>
          </div>

          <div className="doctor-card-right">
            <div className="practitioner-header-row">
              <h3>{isReceptionist ? "Clinical Practitioner Bio" : "Physician Workspace Dashboard"}</h3>
              {!isReceptionist && (
                <div className="date-picker-inline glass-panel">
                  <Calendar size={14} />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              )}
            </div>
            
            <div className="practitioner-details-grid">
              <div className="detail-item">
                <Award className="detail-icon" />
                <div>
                  <span className="detail-label">Experience</span>
                  <strong className="detail-value">{doctor.experience} Years</strong>
                </div>
              </div>

              <div className="detail-item">
                <Building className="detail-icon" />
                <div>
                  <span className="detail-label">Base Hospital</span>
                  <strong className="detail-value">{doctor.hospital?.name || "Facility Center"}</strong>
                </div>
              </div>

              <div className="detail-item">
                <Stethoscope className="detail-icon" />
                <div>
                  <span className="detail-label">Qualifications</span>
                  <strong className="detail-value">{doctor.qualifications || "MBBS"}</strong>
                </div>
              </div>

              <div className="detail-item">
                <Clock className="detail-icon" />
                <div>
                  <div className="shift-hours-label-row">
                    <span className="detail-label">Shift Hours</span>
                    {!isReceptionist && (
                      <button 
                        className="edit-shift-btn-inline"
                        onClick={() => setShowShiftModal(true)}
                        title="Configure Shift Working Hours"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <strong className="detail-value">
                    {doctor.workingHours?.start && doctor.workingHours?.end && doctor.slotDuration > 0 ? (
                      `${doctor.workingHours.start} - ${doctor.workingHours.end} (${doctor.slotDuration}m slots)`
                    ) : (
                      <span className="text-warning-badge">Not Configured</span>
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className="availability-toggle-row glass-panel">
              <div className="availability-info">
                <span>Duty Availability</span>
                <p className="avail-desc">Toggle availability status for daily queues.</p>
              </div>

              <button 
                className={`avail-toggle-btn ${doctor.available ? "active" : ""}`}
                onClick={toggleAvailability}
              >
                {doctor.available ? (
                  <>
                    <span>Available</span>
                    <ToggleRight size={32} />
                  </>
                ) : (
                  <>
                    <span>Unavailable</span>
                    <ToggleLeft size={32} />
                  </>
                )}
              </button>
            </div>

            {isReceptionist && (
              <div className="doctor-card-actions">
                <button
                  className="btn btn-primary schedule-btn"
                  onClick={() =>
                    navigate(`/receptionist/doctor/${id}/appointments?hospital=${hospitalId}&date=${date}`)
                  }
                >
                  <Calendar size={18} /> Manage Appointment Schedule
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* WARNING BANNER FOR UNCONFIGURED SHIFTS */}
        {!isReceptionist && !(doctor.workingHours?.start && doctor.workingHours?.end && doctor.slotDuration > 0) && (
          <motion.div 
            className="setup-warning-banner glass-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={24} className="warning-icon-animate" />
            <div>
              <h4>Shift Configuration Required</h4>
              <p>You are currently marked as <strong>Unavailable</strong> for patient bookings. Please click <strong>Edit</strong> next to <strong>Shift Hours</strong> in your profile dashboard above to configure your daily working hours and slot duration.</p>
            </div>
          </motion.div>
        )}

        {/* DOCTOR EXCLUSIVE INTERACTIVE SCHEDULE BOARD */}
        {!isReceptionist && (
          <motion.section 
            className="doctor-schedule-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Clinical Stats counters */}
            <div className="clinical-stats-row">
              <div className="stat-pill glass-panel">
                <span className="stat-val blue">{filteredAppointments.length}</span>
                <span className="stat-lbl">Today's Visits</span>
              </div>
              <div className="stat-pill glass-panel">
                <span className="stat-val yellow">{pendingCount}</span>
                <span className="stat-lbl">Pending Queue</span>
              </div>
              <div className="stat-pill glass-panel">
                <span className="stat-val green">{completedCount}</span>
                <span className="stat-lbl">Consulted</span>
              </div>
            </div>

            <div className="section-title-row flex-between">
              <div className="flex-align-center gap-2">
                <Calendar className="section-title-icon" />
                <h2>Daily Consultations - {date}</h2>
              </div>
              <div className="schedule-view-tabs">
                <button 
                  className={`tab-btn ${viewTab === "slots" ? "active" : ""}`}
                  onClick={() => setViewTab("slots")}
                >
                  All Slots Grid
                </button>
                <button 
                  className={`tab-btn ${viewTab === "appointments" ? "active" : ""}`}
                  onClick={() => setViewTab("appointments")}
                >
                  Appointments Only
                </button>
              </div>
            </div>

            {viewTab === "slots" ? (
              slots.length === 0 ? (
                <div className="empty-inline-box glass-panel">
                  <Clock size={40} className="empty-icon" />
                  <h3>No slots generated for this date</h3>
                  <p>Check if you have configured your shift times correctly.</p>
                </div>
              ) : (
                <div className="slots-grid-manager">
                  {slots.map((s) => {
                    const appt = appointments.find(
                      (a) => a.slot === s.slot && new Date(a.date).toISOString().split("T")[0] === date
                    );

                    return (
                      <div key={s.slot} className={`slot-manager-card status-${s.status}`}>
                        <div className="slot-manager-time-header">
                          <Clock size={16} />
                          <span>{s.slot}</span>
                          <span className={`status-badge status-${s.status}`}>
                            {s.status === "free" ? "Available" : s.status === "blocked" ? "Break" : "Booked"}
                          </span>
                        </div>

                        {s.status === "booked" && (
                          <div className="slot-manager-body">
                            <p className="patient-name">Patient: <strong>{s.patientName || "Member"}</strong></p>
                            {appt && <p className="reason-lbl">Reason: <em>{appt.reason || "General Checkup"}</em></p>}
                          </div>
                        )}

                        <div className="slot-manager-actions">
                          {s.status === "free" && (
                            <button
                              className="btn-action-small secondary"
                              onClick={() => handleToggleBlock(s.slot)}
                              disabled={actionLoading}
                            >
                              Block Break
                            </button>
                          )}
                          {s.status === "blocked" && (
                            <button
                              className="btn-action-small success"
                              onClick={() => handleToggleBlock(s.slot)}
                              disabled={actionLoading}
                            >
                              Resume Shift
                            </button>
                          )}
                          {s.status === "booked" && appt && appt.status === "booked" && (
                            <div className="action-buttons-grp">
                              <button
                                className="btn-action-small success"
                                onClick={() => updateStatus(appt._id, "completed")}
                                disabled={actionLoading}
                              >
                                Visited
                              </button>
                              <button
                                className="btn-action-small warning"
                                onClick={() => {
                                  setRescheduleAppt(appt);
                                  setRescheduleDate(date);
                                  setShowRescheduleModal(true);
                                }}
                                disabled={actionLoading}
                              >
                                Shift Time
                              </button>
                              <button
                                className="btn-action-small danger"
                                onClick={() => updateStatus(appt._id, "cancelled")}
                                disabled={actionLoading}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              filteredAppointments.length === 0 ? (
                <div className="empty-inline-box glass-panel">
                  <Clock size={40} className="empty-icon" />
                  <h3>No appointments booked for this date</h3>
                  <p>Enjoy your downtime or pick another shift date to review queues.</p>
                </div>
              ) : (
                <div className="doctor-appointments-list">
                  <AnimatePresence>
                    {filteredAppointments.map((app, idx) => (
                      <motion.div 
                        key={app._id} 
                        className={`doctor-appt-row glass-panel status-${(app.status || "booked").toLowerCase()}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                      >
                        <div className="appt-meta-block">
                          <div className="appt-time">
                            <Clock size={16} />
                            <span>{app.slot}</span>
                          </div>
                          <div className="patient-name-label">
                            <User size={16} />
                            <span>{app.patient?.name || "Patient Member"}</span>
                          </div>
                        </div>

                        <div className="appt-reason">
                          <FileText size={16} className="reason-icon" />
                          <span>Reason: <strong>{app.reason || "General Consultation"}</strong></span>
                        </div>

                        <div className="appt-actions-row">
                          <span className={`status-badge status-${(app.status || "booked").toLowerCase()}`}>
                            {app.status}
                          </span>

                          {app.status === "booked" && (
                            <div className="action-buttons-grp">
                              <button 
                                className="btn-action-small success"
                                onClick={() => updateStatus(app._id, "completed")}
                                disabled={actionLoading}
                                title="Mark Visited"
                              >
                                <CheckCircle2 size={16} />
                                <span>Visited</span>
                              </button>
                              <button 
                                className="btn-action-small danger"
                                onClick={() => updateStatus(app._id, "cancelled")}
                                disabled={actionLoading}
                                title="Cancel Appointment"
                              >
                                <XCircle size={16} />
                                <span>Cancel</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )
            )}
          </motion.section>
        )}

        {/* EDIT SHIFT WORKING HOURS MODAL */}
        <AnimatePresence>
          {showShiftModal && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="modal-card glass-panel"
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
              >
                <div className="modal-header">
                  <h3>Configure Daily Shift Times</h3>
                  <button className="close-btn" onClick={() => setShowShiftModal(false)}>✕</button>
                </div>
                <form onSubmit={handleUpdateShift} className="modal-form">
                  <div className="form-group">
                    <label className="input-label">Shift Start Time</label>
                    <input 
                      type="time" 
                      value={shiftStart} 
                      onChange={(e) => setShiftStart(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Shift End Time</label>
                    <input 
                      type="time" 
                      value={shiftEnd} 
                      onChange={(e) => setShiftEnd(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Consultation Slot Duration</label>
                    <select 
                      value={slotDuration} 
                      onChange={(e) => setSlotDuration(Number(e.target.value))}
                    >
                      <option value={10}>10 Minutes</option>
                      <option value={15}>15 Minutes</option>
                      <option value={20}>20 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowShiftModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={actionLoading}>Save Shift Settings</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESCHEDULE APPOINTMENT / SHIFT TIME MODAL */}
        <AnimatePresence>
          {showRescheduleModal && rescheduleAppt && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="modal-card glass-panel"
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
              >
                <div className="modal-header">
                  <h3>Reschedule Appointment Slot</h3>
                  <button className="close-btn" onClick={() => setShowRescheduleModal(false)}>✕</button>
                </div>
                <form onSubmit={handleConfirmReschedule} className="modal-form">
                  <div className="info-box-inline">
                    <p>Rescheduling patient appointment for <strong>{rescheduleAppt.patient?.name}</strong>.</p>
                    <p>Current Time: <strong>{rescheduleAppt.slot}</strong> on <strong>{date}</strong>.</p>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Select Target Date</label>
                    <input 
                      type="date" 
                      value={rescheduleDate} 
                      onChange={(e) => setRescheduleDate(e.target.value)} 
                      min={new Date().toISOString().split("T")[0]}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="input-label">Select Available Time Slot</label>
                    {rescheduleSlots.length === 0 ? (
                      <p className="no-slots-alert">No free slots available on this date.</p>
                    ) : (
                      <div className="slots-selection-chips">
                        {rescheduleSlots.map((slotTime) => (
                          <button
                            key={slotTime}
                            type="button"
                            className={`slot-chip ${selectedRescheduleSlot === slotTime ? "selected" : ""}`}
                            onClick={() => setSelectedRescheduleSlot(slotTime)}
                          >
                            {slotTime}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowRescheduleModal(false)}>Cancel</button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={actionLoading || !selectedRescheduleSlot}
                    >
                      Confirm Reschedule
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DoctorPage;
