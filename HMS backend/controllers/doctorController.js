import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";   // <-- important
import bcrypt from "bcryptjs";

// ---------------- Doctor Signup ----------------
export const doctorSignup = async (req, res) => {
  try {
    const { name, phone, password, specialization, hospitalId } = req.body;
    console.log("Received hospitalId from frontend:", hospitalId);


    // Validate required fields
    if (!name || !phone || !password || !specialization || !hospitalId) {
      return res.json({ success: false, message: "All fields required" });
    }

    // Check duplicate doctor
    const exists = await Doctor.findOne({ phone });
    if (exists) {
      return res.json({ success: false, message: "Phone already registered" });
    }

    // Check hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.json({ success: false, message: "Invalid hospital selected" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create doctor (note: hospital field, not hospitalId)
    const doctor = await Doctor.create({
      name,
      phone,
      password: hashed,
      specialization,
      hospital: hospitalId
    });

    // Add doctor to hospital list
    await Hospital.findByIdAndUpdate(hospitalId, {
      $push: { doctors: doctor._id }
    });

    return res.json({ success: true, doctor });

  } catch (err) {
    console.log("Error:", err);
    return res.json({ success: false, message: err.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate("hospital")   // if doctor belongs to a hospital
      .exec();

    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    res.json({ success: true, doctor });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Server error" });
  }
};



// ---------------- Doctor Login ----------------
export const doctorLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const doctor = await Doctor.findOne({ phone });
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    const match = await bcrypt.compare(password, doctor.password);
    if (!match) {
      return res.json({ success: false, message: "Wrong password" });
    }

    return res.json({ success: true, doctor });

  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};
