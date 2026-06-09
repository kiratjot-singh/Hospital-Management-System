import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Stethoscope, ChevronDown, Check, RefreshCw, AlertCircle } from "lucide-react";
import "./DoctorSignup.css";

const DoctorSignup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [hospital, setHospital] = useState("");
  const [hospitals, setHospitals] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [deptOpen, setDeptOpen] = useState(false);

  const [qualifications, setQualifications] = useState("MBBS");
  const [experience, setExperience] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMesg, setErrorMesg] = useState("");

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/hospital/getHospitals`);
        const data = await res.json();
        if (data.success) setHospitals(data.hospitals);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (!hospital) return;
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctor/getDepartment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hospitalId: hospital }),
        });
        const data = await res.json();
        if (data.success) setDepartments(data.departments);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepartments();
    setSelectedDepartments([]);
  }, [hospital]);

  const toggleDepartment = (id) => {
    setSelectedDepartments((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMesg("");

    if (
      !name ||
      !phone ||
      !password ||
      !hospital ||
      selectedDepartments.length === 0 ||
      !startTime ||
      !endTime
    ) {
      setErrorMesg("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    const payload = {
      name,
      phone,
      password,
      hospitalId: hospital,
      departments: selectedDepartments,
      qualifications,
      experience: Number(experience),
      workingHours: {
        start: startTime,
        end: endTime,
      },
      slotDuration: Number(slotDuration),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctor/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        navigate("/login/doctor");
      } else {
        setErrorMesg(data.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMesg("Server error during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <motion.div 
        className="signup-card glass-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="signup-header">
          <div className="brand-logo-center">
            <Heart className="brand-logoanimate animate-pulse" />
            <h2>CareFlow Pro</h2>
          </div>
          <h1>Clinical Registration</h1>
          <p>Register as a certified doctor on CareFlow.</p>
        </div>

        {errorMesg && (
          <motion.div 
            className="error-box"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertCircle size={16} />
            <span>{errorMesg}</span>
          </motion.div>
        )}

        <form onSubmit={handleSignup} className="signup-grid-form">
          {/* Personal Details */}
          <div className="form-section-title">Clinical Profile</div>
          
          <div className="signup-fields-grid">
            <div className="form-group">
              <label className="input-label">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dr. John Doe" required />
            </div>

            <div className="form-group">
              <label className="input-label">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter 10 digit number" required />
            </div>

            <div className="form-group">
              <label className="input-label">Access Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            <div className="form-group">
              <label className="input-label">Qualifications</label>
              <input value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="e.g. MBBS, MD" required />
            </div>

            <div className="form-group">
              <label className="input-label">Clinical Experience (Years)</label>
              <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 5" required />
            </div>

            <div className="form-group">
              <label className="input-label">Assign Hospital</label>
              <select value={hospital} onChange={(e) => setHospital(e.target.value)} required>
                <option value="">Choose Hospital</option>
                {hospitals.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department Selection */}
          <div className="form-group dropdown-group">
            <label className="input-label">Assigned Departments</label>
            <div className="dropdown" onClick={() => setDeptOpen(!deptOpen)}>
              <span>
                {selectedDepartments.length === 0
                  ? "Select Departments"
                  : `${selectedDepartments.length} Selected`}
              </span>
              <ChevronDown size={16} />
            </div>

            {deptOpen && (
              <div className="dept-menu glass-panel">
                {departments.length === 0 ? (
                  <div className="no-depts-text">Please choose a hospital first</div>
                ) : (
                  departments.map((d) => (
                    <div
                      key={d._id}
                      className={`dept-option ${selectedDepartments.includes(d._id) ? "active" : ""}`}
                      onClick={() => toggleDepartment(d._id)}
                    >
                      <span>{d.name}</span>
                      {selectedDepartments.includes(d._id) && <Check size={14} />}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Working Hours */}
          <div className="form-section-title">Schedule Settings</div>

          <div className="signup-fields-grid hours-grid">
            <div className="form-group">
              <label className="input-label">Shift Start Time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="input-label">Shift End Time</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="input-label">Consultation Slot Duration (Mins)</label>
              <input type="number" value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="primary-btn submit-signup" disabled={isLoading}>
            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <><Stethoscope size={18} /> Complete Registration</>}
          </button>

          <p className="helper-text">
            Already registered?{" "}
            <span className="helper-link" onClick={() => navigate("/login/doctor")} style={{ cursor: "pointer" }}>
              Login to workspace
            </span>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default DoctorSignup;
