import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    slot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["free", "booked", "blocked"],
      default: "free",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
  },
  { timestamps: true }
);

// Enforce unique slots per doctor, hospital, date and time slot
slotSchema.index(
  { doctor: 1, hospital: 1, date: 1, slot: 1 },
  { unique: true }
);

// Indexes on patient and doctor for fast querying
slotSchema.index({ patient: 1 });
slotSchema.index({ doctor: 1 });

export default mongoose.model("Slot", slotSchema);
