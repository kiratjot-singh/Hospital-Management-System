import React, { useEffect, useState } from "react";
import "./HospitalDetails.css";
import { useNavigate, useParams } from "react-router";
import axios from "axios";

const HospitalDetails = () => {
  const { id } = useParams();

  const [hospital, setHospital] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate=useNavigate();

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
              <div
                className="dept-card"
                key={dept._id}
                onClick={() => {navigate(`/hospital/${id}/department/${dept._id}`)}}
              >
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
// import React, { useEffect, useState } from "react";
// import "./HospitalDetails.css";
// import { useNavigate, useParams } from "react-router";
// import axios from "axios";

// const HospitalDetails = () => {
//   const { hospitalId } = useParams();
//   const navigate = useNavigate();

//   const [hospital, setHospital] = useState(null);
//   const [departments, setDepartments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const getDetails = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/patient/hospitaldetails/${hospitalId}`
//         );

//         if (res.data.success) {
//           setHospital(res.data.hospital);
//           setDepartments(res.data.departments || []);
//         }
//       } catch (err) {
//         console.log("❌ Error fetching hospital details:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     getDetails();
//   }, [hospitalId]);

//   if (loading) return <h2 style={{ padding: 40 }}>Loading...</h2>;
//   if (!hospital) return <h2 style={{ padding: 40 }}>Hospital not found</h2>;

//   return (
//     <div className="hospital-page">
//       {/* ===== HERO ===== */}
//       <div className="hospital-hero">
//         <div className="hero-left">
//           <h1>{hospital.name}</h1>

//           <p className="location">
//             📍 {hospital.address.city}, {hospital.address.state} –{" "}
//             {hospital.address.pincode}
//           </p>

//           <p className="rating">
//             {hospital.isPrivate ? "Private Hospital" : "Government Hospital"}
//           </p>

//           <p className="desc">
//             Established in {hospital.establishedYear}
//           </p>

//           <p className="desc">
//             📞 {hospital.contact.phone}
//             <br />
//             ✉️ {hospital.contact.email}
//           </p>
//         </div>

//         <div className="hero-right">
//           <img
//             src={
//               hospital.image ||
//               "https://images.unsplash.com/photo-1586773860418-d37222d8fce3"
//             }
//             alt={hospital.name}
//             onError={(e) => {
//               e.target.src =
//                 "https://images.unsplash.com/photo-1586773860418-d37222d8fce3";
//             }}
//           />
//         </div>
//       </div>

//       {/* ===== DEPARTMENTS ===== */}
//       <div className="departments-section">
//         <h2>Departments</h2>

//         {departments.length === 0 ? (
//           <p>No departments added yet</p>
//         ) : (
//           <div className="departments-grid">
//             {departments.map((dept) => (
//               <div
//                 key={dept._id}
//                 className="dept-card"
//                 onClick={() =>
//                   navigate(
//                     `/hospital/${hospitalId}/department/${dept._id}`
//                   )
//                 }
//               >
//                 <span>{dept.name}</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default HospitalDetails;
