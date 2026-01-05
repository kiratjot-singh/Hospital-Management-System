import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorSignup.css";

const DoctorSignup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [hospitalId, setHospitalId] = useState("");
  const [hospitals, setHospitals] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [deptOpen, setDeptOpen] = useState(false);

  // fetch hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/hospital/getHospitals");
        const data = await res.json();
        if (data.success) setHospitals(data.hospitals);
      } catch (err) {
        console.log(err);
      }
    };
    fetchHospitals();
  }, []);

  // fetch departments on hospital select
  useEffect(() => {
    if (!hospitalId) return;

    const fetchDepartments = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/doctor/getDepartment",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hospitalId }),
          }
        );
        const data = await res.json();
        if (data.success) setDepartments(data.departments);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDepartments();
    setSelectedDepartments([]);
  }, [hospitalId]);

  const toggleDepartment = (id) => {
    setSelectedDepartments((prev) =>
      prev.includes(id)
        ? prev.filter((d) => d !== id)
        : [...prev, id]
    );
  };

  const handleSignup = async () => {
    if (!name || !phone || !password || !hospitalId || selectedDepartments.length === 0) {
      return alert("Please fill all fields");
    }

    try {
      const res = await fetch("http://localhost:5000/api/doctor/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          password,
          hospitalId,
          departments: selectedDepartments,
        }),
      });

      const data = await res.json();
      if (data.success) navigate("/login/doctor");
      else alert(data.message);
    } catch (err) {
      console.log(err);
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

            <label className="input-label">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />

            <label className="input-label">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />

            <label className="input-label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <label className="input-label">Hospital</label>
            <select
              className="dropdown"
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
            >
              <option value="">Select Hospital</option>
              {hospitals.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>

            {/* ✅ CLEAN DEPARTMENT DROPDOWN */}
            <label className="input-label">Departments</label>

            <div
              className="dropdown dept-select"
              onClick={() => setDeptOpen(!deptOpen)}
            >
              {selectedDepartments.length === 0
                ? "Select Departments"
                : `${selectedDepartments.length} selected`}
              <span className="arrow">▼</span>
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

