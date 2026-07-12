import express from "express";
import {
  getHospitalDetails,
  login,
  logout,
  signup,
  getpatients,
  getMyPatientProfile,
} from "../controllers/patientController.js";
import { protectPatient, protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// 🔐 Logged-in patient profile
router.get("/me", protectPatient, getMyPatientProfile);

// Hospital details
router.get("/hospitaldetails/:id", getHospitalDetails);

// All patients (admin or general)
router.get("/", protectUser, getpatients);

export default router;
