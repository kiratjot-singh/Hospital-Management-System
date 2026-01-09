import express from "express";
import {
  getHospitalDetails,
  login,
  signup,
  getpatients,
  getMyPatientProfile,
  protectPatient
} from "../controllers/patientController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// 🔐 Logged-in patient profile
router.get("/me", getMyPatientProfile);

// Hospital details
router.get("/hospitaldetails/:id", getHospitalDetails);

// All patients (admin or general)
router.get("/", getpatients);

export default router;
