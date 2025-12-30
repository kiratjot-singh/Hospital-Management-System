import mongoose from "mongoose";


const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, unique: true, required: true },
  specialization: { type: String, required: true },
  password: { type: String },
  otp: { type: String },
  otpExpires: { type: Date },
  hospital:{type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  experience: Number,
  
  
});

export default mongoose.model("Doctor", doctorSchema);