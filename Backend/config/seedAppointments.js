import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";

const PATIENT_ID  = "694c9a87b1114dcec071301c";
const DOCTOR_ID   = "695a48a0865ea1d8e898393e";
const HOSPITAL_ID = "695a08899431ee7ad91a6f67";

async function seedSpecificAppointment() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    if (
      !mongoose.Types.ObjectId.isValid(PATIENT_ID) ||
      !mongoose.Types.ObjectId.isValid(DOCTOR_ID) ||
      !mongoose.Types.ObjectId.isValid(HOSPITAL_ID)
    ) {
      throw new Error("Invalid ObjectId format");
    }

    const appointment = await Appointment.create({
      patient: PATIENT_ID,
      doctor: DOCTOR_ID,
      hospital: HOSPITAL_ID,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      slot: "10:00-10:15",
      status: "booked",
      reason: "General consultation"
    });

    console.log("Appointment created:", appointment);

  } catch (err) {
    console.error("Seeding error:", err.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

seedSpecificAppointment();
