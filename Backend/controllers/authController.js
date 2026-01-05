import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Receptionist from "../models/Receptionist.js";
import Hospital from "../models/Hospital.js";
import Doctor from "../models/Doctor.js"
import Patient from "../models/Patient.js"
import Appointment from "../models/Appointment.js";
// MailTrap Transporter
// 
// Looking to send emails in production? Check out our Email API/SMTP product!
var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "0471591f54d4e9",
    pass: "c027d88cc0a538"
  }
});


export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("doctor", "name")
      .populate("patient", "name")
      .populate("hospital", "name")
      .sort({ date: 1 });

    const formatted = appointments.map(a => ({
      _id: a._id,
      doctorName: a.doctor?.name || "-",
      patientName: a.patient?.name || "-",
      hospitalName: a.hospital?.name || "-",
      date: a.date,
      slot: a.slot,
      status: a.status,
      reason: a.reason
    }));

    res.json({ success: true, appointments: formatted });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


transporter.verify((error, success) => {
  if (error) {
    console.log("Mailtrap SMTP Error:", error);
  } else {
    console.log("Mailtrap SMTP Connected Successfully");
  }
});

// JWT Token
const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// export const bookAppointment = async(req,res)=>{
//   try{
//     const { patientId, doctorId, date, timeSlot } = req.body;

//   const appointment = new Appointment({ patient: patientId, doctor: doctorId, date, timeSlot });
//   await appointment.save();

//   res.json({ success: true, appointment });
//   }
//   catch(err){
//     res.status(500).json({ success: false, message: err.message });
//   }
// }
export const toggleAvailability = async (req, res) => {
  try {
    const { available } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { available },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ---------------- SIGNUP ----------------
// import Receptionist from "../models/Receptionist.js";
// import Hospital from "../models/Hospital.js";
// import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { name, phone, email, password, hospitalId } = req.body;

    if (!hospitalId) {
      return res.json({ success: false, message: "Hospital ID missing" });
    }

    const exists = await Receptionist.findOne({ phone });
    if (exists)
      return res.json({ success: false, message: "Phone already exists" });

    const hospitalExists = await Hospital.findById(hospitalId);
    if (!hospitalExists)
      return res.json({ success: false, message: "Invalid hospital selected" });

    const hashed = await bcrypt.hash(password, 10);

    await Receptionist.create({
      name,
      phone,
      email,
      password: hashed,
      hospital: hospitalId, // <-- ✔ CORRECT
    });

    res.json({ success: true, message: "Signup successful" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};


// ---------------- SEND EMAIL OTP ----------------
export const sendEmailOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await Receptionist.findOne({ phone });
    if (!user) return res.json({ success: false, message: "Phone not registered" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 min expiry
    await user.save();

    await transporter.sendMail({
      from: "support@hms.com",
      to: user.email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
export const getname = async (req, res) => {
  try {
    const { phone } = req.body;

    // PHONE CHECK
    if (!phone) {
      return res.json({ success: false, message: "Phone is required" });
    }
    console.log(phone)

    // FIND USER
   
     const user = await Receptionist.findOne({ phone })
      .populate({
        path: "hospital",
        populate: {
          path: "doctors",
        },
      });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // SUCCESS
    return res.json({ success: true, user});

  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Server error" });
  }
};



// ---------------- VERIFY OTP ----------------
export const verifyEmailOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const user = await Receptionist.findOne({ phone });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.otp !== otp)
      return res.json({ success: false, message: "Incorrect OTP" });

    if (user.otpExpires < Date.now())
      return res.json({ success: false, message: "OTP expired" });

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ success: true, token: createToken(user._id) });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ---------------- PASSWORD LOGIN ----------------
export const loginPassword = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await Receptionist.findOne({ phone });
    if (!user) return res.json({ success: false, message: "Phone not registered" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: "Incorrect password" });

    res.json({ success: true, token: createToken(user._id) });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
