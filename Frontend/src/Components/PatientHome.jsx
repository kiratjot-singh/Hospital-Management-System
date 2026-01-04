import React, { useEffect, useState } from "react";
import "./PatientHome.css";
import { useNavigate, useParams } from "react-router";
import axios from "axios";

const PatientHome = () => {
  const [search, setSearch] = useState("");
  const username = "Opinder";
  const [hospitals,setHospitals]=useState([]);
  const {phone}=useParams();
  const navigate=useNavigate();
  useEffect(()=>{
    const gethospitals=async()=>{
   try{
   const res=await axios.get("http://localhost:5000/api/hospital/getHospitals");
    if(res.data.success){
      setHospitals(res.data.hospitals);
    }
    }catch(err){
      console.log(err);
    }
    }
    gethospitals();
  },[phone])

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-page">
      <header className="navbar">
        <div className="nav-inner">
          <div className="nav-left">Hi, {username}</div>

          <div className="nav-right">
            <button className="nav-btn"> Booked Appointments</button>
            <button className="nav-btn">Saved Hospitals</button>
            <button className="nav-btn">My Reports</button>
            <div className="profile-logo">👤</div>
          </div>
        </div>
      </header>

      <section className="search-section">
        <div className="search-inner">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search hospitals in your area"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <main className="content">
        <h2>Hospitals near you</h2>

        <div className="hospital-list">
          {filtered.map(h => (
            <div key={h._id} className="hospital-row">
              <div>
                <h3>{h.name}</h3>
                <span>{h.area}</span>
              </div>
              <button className="view-btn" onClick={()=>{navigate(`/hospitaldetails/${h._id}`)}}>View</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PatientHome;




