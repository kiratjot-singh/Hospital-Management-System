import React, { useEffect, useState } from "react";
import "./PatientHome.css";
import { useNavigate, useParams } from "react-router";
import axios from "axios";

const PatientHome = () => {
  const [search, setSearch] = useState("");
const [username, setUsername] = useState("");
const [patientId, setPatientId] = useState(null);
  const [hospitals,setHospitals]=useState([]);
  const {phone}=useParams();
  const navigate=useNavigate();
  useEffect(()=>{
    const gethospitals=async()=>{
   try{
   const res=await axios.get(`${import.meta.env.VITE_API_BASE_URL}/hospital/getHospitals`);
    if(res.data.success){
      setHospitals(res.data.hospitals);
    }
    }catch(err){
      console.log(err);
    }
    }
    gethospitals();
  },[phone])
  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/patient/me`,
        { withCredentials: true }
      );

      setPatientId(res.data.patient._id);
      setUsername(res.data.patient.name);
    } catch(err) {
      console.log(err);
    }
  };

  fetchProfile();
}, []);


  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-page">
      <header className="navbar">
        <div className="nav-inner">
          <div className="nav-left">Hi, {username}</div>

          <div className="nav-right">
            {/* <button className="nav-btn"  onClick={() => navigate(`/appointments/${patientId}`)}> Booked Appointments</button> */}
            {/* <button className="nav-btn">Saved Hospitals</button> */}
            {/* <button className="nav-btn">My Reports</button> */}
            <button
  className="nav-btn"
  disabled={!patientId}
  onClick={() => navigate(`/appointments/${patientId}`)}
>
  Booked Appointments
</button>

            <div 
  className="profile-logo" 
  onClick={() => navigate(`/patient/me/${patientId}`)}
  style={{ cursor: "pointer" }}
>
  👤
</div>
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





