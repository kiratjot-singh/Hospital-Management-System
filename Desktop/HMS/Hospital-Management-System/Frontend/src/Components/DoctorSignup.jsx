// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./DoctorSignup.css";

// const DoctorSignup = () => {
//   const navigate = useNavigate();

//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [password, setPassword] = useState("");
//   const [departments, setDepartments] = useState("");
//   const [hospitalId, setHospitalId] = useState("");

//   // List of hospitals
//   const [hospitals, setHospitals] = useState([]);

//   // -------- Fetch hospitals using your backend API -------
//   useEffect(() => {
//     const fetchHospitals = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/api/hospital/getHospitals");
//         const data = await response.json();

//         if (data.success) {
//           setHospitals(data.hospitals);
//         } 

//       } catch (error) {
//         console.error(error);
//       }
//     };

//     fetchHospitals();
//   }, []);
//    useEffect(()=>{
//    const fetchDepartments=async()=>{
//     try{
// const res=await fetch("http://localhost:5000/api/doctor/getDepartment",{
//   method:"POST",
//   body:JSON.stringify({
//     hospitalId
//   })
// });
// const data=await res.json();
//  if (data.success) {
//           setDepartments(data.departments);
//         } 
//     }catch(err){
//      console.log(err);
//     }
//     fetchDepartments();
//    }
//   },[])
//   // -------- Signup handler --------
//   const handleSignup = async () => {
//     if (!name || !phone || !password || !specialization || !hospitalId) {
//       return alert("Please fill all the fields");
//     }

//     try {
//       const response = await fetch("http://localhost:5000/api/doctor/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name,
//           phone,
//           password,
//           specialization,
//           hospitalId   
//         })
//       });

//       const data = await response.json();

//       if (data.success) {
//         alert("Signup successful! Please login now.");
//         navigate("/login/doctor");
//       } else {
//         alert(data.message || "Signup failed");
//       }

//     } catch (err) {
//       console.error(err);
//       alert("Error connecting to server");
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-card">

//         <div className="login-left">
//           <h1 className="app-title">Doctor Signup</h1>
//           <p className="app-subtitle">
//             Register as a doctor and join your hospital's network.
//           </p>
//         </div>

//         <div className="login-right">
//           <h2 className="login-title">Create Account</h2>
//           <p className="login-caption">Fill your details to continue</p>

//           <div className="login-form">

//             <label className="input-label">Full Name</label>
//             <input
//               type="text"
//               placeholder="Enter full name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />

//             <label className="input-label">Phone Number</label>
//             <div className="input-group">
//               <span className="country-code">+91</span>
//               <input
//                 type="tel"
//                 placeholder="Enter phone number"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//               />
//             </div>

//             <label className="input-label">Password</label>
//             <input
//               type="password"
//               placeholder="Enter password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />

//             {/* Dropdown for hospitals */}
//             <label className="input-label">Select Hospital</label>
//             <select
//               className="dropdown"
//               value={hospitalId}
//               onChange={(e) => setHospitalId(e.target.value)}
//             >
//               <option value="">-- Select Hospital --</option>
//               {hospitals.map((h) => (
//                 <option key={h._id} value={h._id}>
//                   {h.name}
//                 </option>
//               ))}
//             </select>

//             <label className="input-label">Specialization</label>
//             <input
//               type="text"
//               placeholder="Cardiologist, Orthopedic, etc."
//               value={specialization}
//               onChange={(e) => setSpecialization(e.target.value)}
//             />

//             <button className="primary-btn" onClick={handleSignup}>
//               Sign Up
//             </button>

//             <p className="helper-text">
//               Already have an account?{" "}
//               <span
//                 className="helper-link"
//                 onClick={() => navigate("/login/doctor")}
//               >
//                 Login here
//               </span>
//             </p>

//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default DoctorSignup;
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

