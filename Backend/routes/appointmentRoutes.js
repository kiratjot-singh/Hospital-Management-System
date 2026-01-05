import express from "express";
import {
  bookAppointment,
  getFreeSlots,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/book", bookAppointment);
router.get("/free-slots", getFreeSlots);
router.get("/doctor/:doctorId", getDoctorAppointments);
router.get("/patient/:patientId", getPatientAppointments);
router.patch("/:id/status", updateAppointmentStatus);

export default router;
