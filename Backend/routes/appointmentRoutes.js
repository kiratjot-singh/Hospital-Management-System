import express from "express";
import {
  bookAppointment,
  getDoctorSlots,
  getFreeSlots,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
  toggleBlockSlot,
  rescheduleAppointment,
} from "../controllers/appointmentController.js";
import { protectPatient, protectDoctor, protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 Protected booking route
router.post("/book", protectPatient, bookAppointment);

// Public routes (required for viewing schedules before logging in or on landing pages)
router.get("/slots", getDoctorSlots);
router.get("/free-slots", getFreeSlots);

// Doctor views (protected to only doctors)
router.get("/doctor/:doctorId", protectDoctor, getDoctorAppointments);

// Patient views (protected to only patients)
router.get("/patient/:patientId", protectPatient, getPatientAppointments);

// Shared route controls (doctor or receptionist or patient can cancel/update status)
router.patch("/:id/status", protectUser, updateAppointmentStatus);
router.patch("/slots/toggle-block", protectDoctor, toggleBlockSlot);
router.patch("/:id/reschedule", protectUser, rescheduleAppointment);

export default router;
