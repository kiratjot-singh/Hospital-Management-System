import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, unique: true, required: true },
    departments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
  ],
    password: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
    qualifications:{type:String,required:true},
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    experience: { type: Number, default: 0 },
    image: { type: String, default: "" }, // profile photo URL
    available: { type: Boolean, default: true }, // for receptionist toggle
    active: { type: Boolean, default: true }, // soft delete / disable doctor
    workingHours: {
    start: { type: String, required: true }, // "10:00"
    end: { type: String, required: true },   // "17:00"
    },
    slotDuration: { type: Number, default: 15 } // minutes

  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
