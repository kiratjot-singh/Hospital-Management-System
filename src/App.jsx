import { useState } from 'react'
import './App.css'
import {BrowserRouter ,Routes, Route} from "react-router-dom";
import PatientLogin from './Components/PatientLogin'
import PatientSignup from './Components/PatientSignup'
import PatientPreferences from './Components/PatientPreferences'
import PatientHome from './Components/PatientHome'
import HospitalDetails from './Components/HospitalDetails'
import DepartmentDoctors from './Components/DepartmentDoctors'

function App() {


  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<PatientLogin/>} />
      <Route path='/signup' element={<PatientSignup/>} />
       <Route path='/home' element={<PatientHome/>} />
       <Route path='/preferences' element={<PatientPreferences/>} />
        <Route path='/hospitaldetails' element={<HospitalDetails/>} />
         <Route path='/department' element={<DepartmentDoctors/>} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
