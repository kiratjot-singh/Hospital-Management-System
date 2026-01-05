import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },

    date: { type: Date, required: true },
    slot: { type: String, required: true },
    status: { type: String, enum: ["booked", "cancelled", "completed"], default: "booked" },
    reason: String,
  },
  { timestamps: true }
);

// Prevent double booking
appointmentSchema.index(
  { doctor: 1, hospital: 1, date: 1, slot: 1 },
  { unique: true }
);

export default mongoose.model("Appointment", appointmentSchema);
