// import React from "react";
// import "./DepartmentDoctors.css";
// import { useNavigate } from "react-router";

// const DepartmentDoctors = () => {
//   const department = "Cardiology";
//   const navigate=useNavigate();

//   const doctors = [
//     {
//       id: 1,
//       name: "Dr. Amanpreet Singh",
//       qualification: "MBBS, MD (Cardiology)",
//       experience: "12 years experience",
//       fees: "₹800",
//       image:
//         "https://randomuser.me/api/portraits/men/32.jpg",
//       available: "Mon - Fri",
//     },
//     {
//       id: 2,
//       name: "Dr. Neha Sharma",
//       qualification: "MBBS, DM (Cardiology)",
//       experience: "9 years experience",
//       fees: "₹700",
//       image:
//         "https://randomuser.me/api/portraits/women/44.jpg",
//       available: "Tue - Sat",
//     },
//     {
//       id: 3,
//       name: "Dr. Rajiv Mehta",
//       qualification: "MBBS, MD (Cardiology)",
//       experience: "15 years experience",
//       fees: "₹1000",
//       image:
//         "https://randomuser.me/api/portraits/men/58.jpg",
//       available: "Mon, Wed, Fri",
//     },
//   ];

//   return (
//     <div className="doctors-page">
//       <div className="dept-header">
//         <h1>{department} Doctors</h1>
//         <p>Choose a doctor and book your appointment</p>
//       </div>

//       <div className="doctors-grid">
//         {doctors.map((doc) => (
//           <div key={doc.id} className="doctor-card">
//             <img src={doc.image} alt={doc.name} />

//             <div className="doctor-info">
//               <h3>{doc.name}</h3>
//               <p className="qualification">{doc.qualification}</p>
//               <p className="experience">{doc.experience}</p>

//               <div className="meta">
//                 <span className="fees">Consultation: {doc.fees}</span>
//                 <span className="available">{doc.available}</span>
//               </div>

//               <button className="book-btn" onClick={()=>{navigate("/slots")}} >
//                 Book Appointment
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default DepartmentDoctors;
import React, { useEffect, useState } from "react";
import "./DepartmentDoctors.css";
import { useNavigate, useParams } from "react-router";
import axios from "axios";

const DepartmentDoctors = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/doctor/deptdoctors/${id}`
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
  }, [id]);

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
                  navigate(`/slots/${doc._id}`)
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

  