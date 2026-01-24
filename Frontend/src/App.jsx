import { Routes, Route } from "react-router-dom";
import RoleSelect from "./Components/RoleSelect";
import ReceptionistLogin from "./Components/ReceptionistLogin";
import ReceptionistSignup from "./Components/ReceptionistSignup";
import ReceptionistHome from "./Components/ReceptionistHome";
import DoctorPage from "./Components/DoctorPage";
import PatientSignup from "./Components/PatientSignup";
import PatientLogin from "./Components/PatientLogin";
import DoctorAppointments from "./Components/DoctorAppointments";
import PatientPreferences from './Components/PatientPreferences'
import PatientHome from './Components/PatientHome'
import HospitalDetails from './Components/HospitalDetails'
import DepartmentDoctors from './Components/DepartmentDoctors'
import DoctorLogin from "./Components/DoctorLogin";
import DoctorSignup from "./Components/DoctorSignup";
import DoctorSlots from "./Components/DoctorSlots";
import ConfirmAppointment from "./Components/ConfirmAppointment";
import Appointments from "./Components/Appoitments";


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

             {/* ---------------- Patient Routes ---------------- */}
        <Route path="/login/patient" element={<PatientLogin />} />
        <Route path="/signup/patient" element={<PatientSignup />} />
        <Route path="/receptionist/doctor/:id/appointments" element={<DoctorAppointments />}/>
        <Route path='/home/patient/:phone' element={<PatientHome/>} />
       <Route path='/preferences' element={<PatientPreferences/>} />
        <Route path='/hospitaldetails/:id' element={<HospitalDetails/>} />
         <Route path='/hospital/:hospitalId/department/:departmentId' element={<DepartmentDoctors/>} />
         <Route path='/hospital/:hospitalId/doctor/:doctorId/slots' element={<DoctorSlots/>} />
         <Route path="/confirm-appointment/:doctorId/:hospitalId/:date/:slot"element={<ConfirmAppointment />}        
/>
       <Route path="/appointments/:patientId" element={<Appointments />} />
      </Routes>
    </>
  );
}

export default App;
