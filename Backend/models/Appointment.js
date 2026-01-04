import mongoose from "mongoose";
const appointmentSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },

    date: { type: Date, required: true },
    slot: { type: String, required: true }, // "10:00-10:15"
    status: { type: String, enum: ["booked", "cancelled", "completed"], default: "booked" },
    reason: String,
  },
  { timestamps: true }
);
export default mongoose.model("Appointment", appointmentSchema);