import mongoose from "mongoose";

const receptionistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, unique: true, required: true },
  email: { type: String, required: true },
  password: { type: String },
  otp: { type: String },
  otpExpires: { type: Date },
  hospital:{type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
});

export default mongoose.model("Receptionist", receptionistSchema);
