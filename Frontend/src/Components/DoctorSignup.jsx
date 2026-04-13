import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    const fetchHospitals = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/hospital/getHospitals`);
      const data = await res.json();
      if (data.success) setHospitals(data.hospitals);
    };
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (!hospital) return;
    const fetchDepartments = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctor/getDepartment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId: hospital }),
      });
      const data = await res.json();
      if (data.success) setDepartments(data.departments);
    };
    fetchDepartments();
    setSelectedDepartments([]);
  }, [hospital]);

  const toggleDepartment = (id) => {
    setSelectedDepartments((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSignup = async () => {
    if (
      !name ||
      !phone ||
      !password ||
      !hospital ||
      selectedDepartments.length === 0 ||
      !startTime ||
      !endTime
    ) {
      alert("Please fill all required fields");
      return;
    }

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
      if (data.success) navigate("/login/doctor");
      else alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <h1 className="app-title">Doctor Signup</h1>
          <p className="app-subtitle">Register doctor</p>
        </div>

        <div className="login-right">
          <div className="login-form">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />

            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />

            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <label>Qualifications</label>
            <input value={qualifications} onChange={(e) => setQualifications(e.target.value)} />

            <label>Experience (years)</label>
            <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} />

            <label>Hospital</label>
            <select value={hospital} onChange={(e) => setHospital(e.target.value)}>
              <option value="">Select Hospital</option>
              {hospitals.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>

            <label>Departments</label>
            <div className="dropdown" onClick={() => setDeptOpen(!deptOpen)}>
              {selectedDepartments.length === 0
                ? "Select Departments"
                : `${selectedDepartments.length} selected`}
            </div>

            {deptOpen && (
              <div className="dept-menu">
                {departments.map((d) => (
                  <div
                    key={d._id}
                    className={`dept-option ${
                      selectedDepartments.includes(d._id) ? "active" : ""
                    }`}
                    onClick={() => toggleDepartment(d._id)}
                  >
                    {d.name}
                  </div>
                ))}
              </div>
            )}

            <label>Working Hours</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />

            <label>Slot Duration (minutes)</label>
            <input type="number" value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)} />

            <button className="primary-btn" onClick={handleSignup}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignup;
