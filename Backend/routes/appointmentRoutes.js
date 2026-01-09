import express from "express";
import {
  bookAppointment,
  getDoctorSlots,
  getFreeSlots,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus
} from "../controllers/appointmentController.js";
import { protectPatient } from "../controllers/patientController.js";

const router = express.Router();

// 🔐 Protected booking route
router.post("/book", bookAppointment);

// Public routes
router.get("/slots", getDoctorSlots);
router.get("/free-slots", getFreeSlots);

// Doctor views
router.get("/doctor/:doctorId", getDoctorAppointments);

// Patient views
router.get("/patient/:patientId", getPatientAppointments);

// Update status
router.patch("/:id/status", updateAppointmentStatus);

export default router;
