import React, { useEffect, useState } from "react";
import "./HospitalDetails.css";
import { useParams } from "react-router";
import axios from "axios";

const HospitalDetails = () => {
  const { id } = useParams();

  const [hospital, setHospital] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/patient/hospitaldetails/${id}`
        );

        if (res.data.success) {
          setHospital(res.data.hospital);
          setDepartments(res.data.departments || []);
        }
      } catch (err) {
        console.log("❌ Error fetching hospital details:", err);
      } finally {
        setLoading(false);
      }
    };

    getDetails();
  }, [id]);

  if (loading) {
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;
  }

  if (!hospital) {
    return <h2 style={{ padding: "40px" }}>Hospital not found</h2>;
  }

  return (
    <div className="hospital-page">
      {/* ================= HERO ================= */}
      <div className="hospital-hero">
        <div className="hero-left">
          <h1>{hospital.name}</h1>

          <p className="location">
            📍 {hospital.address.city}, {hospital.address.state} –{" "}
            {hospital.address.pincode}
          </p>

          <p className="rating">
            {hospital.isPrivate ? "Private Hospital" : "Government Hospital"}
          </p>

          <p className="desc">
            Established in {hospital.establishedYear}
          </p>

          <p className="desc">
            📞 {hospital.contact.phone}
            <br />
            ✉️ {hospital.contact.email}
          </p>
        </div>

        <div className="hero-right">
          <img
            src={
              hospital.image ||
              "https://images.unsplash.com/photo-1586773860418-d37222d8fce3"
            }
            alt={hospital.name}
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1586773860418-d37222d8fce3";
            }}
          />
        </div>
      </div>

      {/* ================= DEPARTMENTS ================= */}
      <div className="departments-section">
        <h2>Departments</h2>

        {departments.length === 0 ? (
          <p>No departments added yet</p>
        ) : (
          <div className="departments-grid">
            {departments.map((dept) => (
              <div className="dept-card" key={dept._id}>
                <span>{dept.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDetails;


