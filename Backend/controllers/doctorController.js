import Department from "../models/Department.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import Slot from "../models/Slot.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ---------------- Doctor Signup ----------------
export const doctorSignup = async (req, res) => {
  try {
    const { name, phone, password, hospitalId, departments, newHospitalName, newHospitalArea } = req.body;

    if (
      !name ||
      !phone ||
      !password ||
      (!hospitalId && !newHospitalName) ||
      !departments ||
      departments.length === 0
    ) {
      return res.json({
        success: false,
        message: "All fields required",
      });
    }

    const exists = await Doctor.findOne({ phone });
    if (exists) {
      return res.json({
        success: false,
        message: "Phone already registered",
      });
    }

    let finalHospitalId = hospitalId;
    let finalDeptIds = departments;

    if (newHospitalName) {
      // Dynamically create new Hospital/Clinic
      const newHospital = await Hospital.create({
        name: newHospitalName,
        address: { city: newHospitalArea || "Delhi", state: "Delhi" },
        doctors: []
      });
      finalHospitalId = newHospital._id;

      // Dynamically create selected departments for this new Hospital
      const createdDepts = [];
      for (const deptName of departments) {
        const dept = await Department.create({
          name: deptName,
          hospital: finalHospitalId
        });
        createdDepts.push(dept._id);
      }
      finalDeptIds = createdDepts;
    } else {
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
        return res.json({
          success: false,
          message: "Invalid hospital selected",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      name,
      phone,
      password: hashedPassword,
      hospital: finalHospitalId,
      departments: finalDeptIds,
      available: false, // Default unavailable until slots are configured
      workingHours: { start: "", end: "" },
      slotDuration: 0
    });

    await Hospital.findByIdAndUpdate(finalHospitalId, {
      $push: { doctors: doctor._id },
    });

    await Department.updateMany(
      { _id: { $in: finalDeptIds } },
      { $push: { doctors: doctor._id } }
    );

    const key = process.env.JWT_SECRET || "secretkey";
    const token = jwt.sign({ id: doctor._id, role: "doctor" }, key, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    const doctorObj = doctor.toObject();
    delete doctorObj.password;

    return res.json({
      success: true,
      token,
      doctor: doctorObj,
    });

  } catch (err) {
    console.log("Doctor signup error:", err);
    return res.json({
      success: false,
      message: err.message,
    });
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

    const key = process.env.JWT_SECRET || "secretkey";
    const token = jwt.sign({ id: doctor._id, role: "doctor" }, key, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    const doctorObj = doctor.toObject();
    delete doctorObj.password;
    delete doctorObj.otp;
    delete doctorObj.otpExpires;

    return res.json({ success: true, token, doctor: doctorObj });

  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

// ---------------- Doctor Logout ----------------
export const doctorLogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};
export const getDepartments = async (req, res) => {
  const { hospitalId } = req.body;
  try {
    const departments = await Department.find({ hospital: hospitalId });
    if (!departments) {
      return res.json({ success: false, message: "cannot get departments" });
    }
    return res.json({ success: true, departments });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
}
export const getDoctorsByDepartment = async (req, res) => {
  try {
    const deptId = req.params.id;

    const doctors = await Doctor.find({
      departments: deptId,
      active: true,
      available: true,
    })
      .select("-password -otp -otpExpires")
    return res.status(200).json({
      success: true,
      doctors,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ---------------- Update Doctor Shift/Working Hours ----------------
export const updateDoctorShift = async (req, res) => {
  try {
    const doctorId = req.doctorId; // attached by protectDoctor middleware
    const { start, end, slotDuration } = req.body;

    if (!start || !end || !slotDuration) {
      return res.status(400).json({ success: false, message: "Missing required shift parameters" });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      {
        "workingHours.start": start,
        "workingHours.end": end,
        slotDuration: Number(slotDuration),
        available: true, // Mark doctor available when they configure their daily slots
      },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Delete future free (unbooked) slots for this doctor so they can be regenerated dynamically
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Slot.deleteMany({
      doctor: doctorId,
      date: { $gte: today },
      status: "free"
    });

    const doctorObj = doctor.toObject();
    delete doctorObj.password;
    delete doctorObj.otp;
    delete doctorObj.otpExpires;

    return res.json({ success: true, message: "Shift settings updated successfully", doctor: doctorObj });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};