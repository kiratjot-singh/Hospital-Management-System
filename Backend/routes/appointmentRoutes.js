import express from "express";
import {
  bookAppointment,
  getFreeSlots,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
  getDoctorSlots
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/book", bookAppointment);
router.get("/free-slots", getFreeSlots);
router.get("/doctor/:doctorId", getDoctorAppointments);
router.get("/patient/:patientId", getPatientAppointments);
router.patch("/:id/status", updateAppointmentStatus);
router.get("/doctor-slots", getDoctorSlots);
export default router;
