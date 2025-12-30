// import { Routes, Route } from "react-router-dom";

// import RoleSelect from "./Components/RoleSelect";

// import ReceptionistLogin from "./Components/ReceptionistLogin";
// import ReceptionistSignup from "./Components/ReceptionistSignup";
// import ReceptionistHome from "./Components/ReceptionistHome";

// import DoctorLogin from "./Components/DoctorLogin";
// import DoctorHome from "./Components/DoctorHome";

// function App() {
//   return (
//     <>
//       <Routes>

//         {/* ---------------- Role Selection Page ---------------- */}
//         <Route path="/" element={<RoleSelect />} />

//         {/* ---------------- Receptionist Routes ---------------- */}
//         <Route path="/login/receptionist" element={<ReceptionistLogin />} />
//         <Route path="/signup/receptionist" element={<ReceptionistSignup />} />
//         <Route path="/home/receptionist/:phone" element={<ReceptionistHome />} />

//         {/* ---------------- Doctor Routes ---------------- */}
//         <Route path="/login/doctor" element={<DoctorLogin />} />
//         <Route path="/signup/doctor" element={<DoctorSignup />} />
//         <Route path="/home/doctor/:id" element={<DoctorHome />} />

        

//       </Routes>
//     </>
//   );
// }

// export default App;


import { Routes, Route } from "react-router-dom";

import RoleSelect from "./Components/RoleSelect";

import ReceptionistLogin from "./Components/ReceptionistLogin";
import ReceptionistSignup from "./Components/ReceptionistSignup";
import ReceptionistHome from "./Components/ReceptionistHome";
import DoctorPage from "./Components/DoctorPage";
import PatientSignup from "./Components/PatientSignup";
import PatientLogin from "./Components/PatientLogin";

import DoctorLogin from "./Components/DoctorLogin";
import DoctorSignup from "./Components/DoctorSignup";
// import DoctorHome from "./Components/DoctorHome";

// import HospitalDetails from "./Components/HospitalDetails";
// import DepartmentDoctors from "./Components/DepartmentDoctors";

function App() {
  return (
    <>
      <Routes>

        {/* ---------------- Role Selection Page ---------------- */}
        <Route path="/" element={<RoleSelect />} />

        {/* ---------------- Receptionist Routes ---------------- */}
        <Route path="/login/receptionist" element={<ReceptionistLogin />} />
        <Route path="/signup/receptionist" element={<ReceptionistSignup />} />
        <Route path="/home/receptionist/:phone" element={<ReceptionistHome />} />

        {/* ---------------- Doctor Routes ---------------- */}
        <Route path="/login/doctor" element={<DoctorLogin />} />
        <Route path="/signup/doctor" element={<DoctorSignup />} />
        <Route path="/doctor/:id" element={<DoctorPage />} />

        {/* <Route path="/home/doctor/:phone" element={<DoctorHome />} /> */}

        {/* ---------------- Hospital / Departments ---------------- */}
        {/* <Route path="/hospital" element={<HospitalDetails />} />
        <Route path="/departments" element={<DepartmentDoctors />} /> */}

        <Route path="/login/patient" element={<PatientLogin />} />
        <Route path="/signup/patient" element={<PatientSignup />} />


      </Routes>
    </>
  );
}

export default App;
