
import React, { useEffect, useState } from "react";
import "./DepartmentDoctors.css";
import { useLocation, useNavigate, useParams } from "react-router";
import axios from "axios";

const DepartmentDoctors = () => {
  const {  departmentId } = useParams();
  const navigate = useNavigate();
  
const hospitalId = useParams().hospitalId;
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/doctor/deptdoctors/${departmentId}`
        );

        if (res.data.success) {
          setDoctors(res.data.doctors);
        }
      } catch (err) {
        console.error(" Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [departmentId]);

  if (loading) {
    return <h2 style={{ padding: "40px" }}>Loading doctors...</h2>;
  }

  if (doctors.length === 0) {
    return <h2 style={{ padding: "40px" }}>No doctors found</h2>;
  }

  return (
    <div className="doctors-page">
      <div className="dept-header">
        <h1>Doctors</h1>
        <p>Choose a doctor and book your appointment</p>
      </div>

      <div className="doctors-grid">
        {doctors.map((doc) => (
          <div key={doc._id} className="doctor-card">
            <img
              src={
                doc.image ||
                "https://via.placeholder.com/150"
              }
              alt={doc.name}
            />

            <div className="doctor-info">
              <h3>{doc.name}</h3>

              <p className="qualification">
                {doc.qualifications}
              </p>

              <p className="experience">
                {doc.experience} years experience
              </p>

              <div className="meta">
                <span className="available">
                  {doc.available ? "Available" : "Not Available"}
                </span>
              </div>

              <button
                className="book-btn"
                onClick={() =>
                  navigate( `/hospital/${hospitalId}/doctor/${doc._id}/slots`)
                }
              >
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
