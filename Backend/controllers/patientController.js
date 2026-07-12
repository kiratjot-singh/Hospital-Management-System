import Patient from "../models/Patient.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Hospital from "../models/Hospital.js";
import Department from "../models/Department.js";

/* -------------------- SIGNUP -------------------- */
export const signup = async (req, res) => {
  try {
    const { name, phonenumber, password } = req.body;

    if (!name || !password || !phonenumber) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    const existingPatient = await Patient.findOne({ phonenumber });
    if (existingPatient) {
      return res.json({
        success: false,
        message: "User already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Patient.create({
      name,
      phonenumber,
      password: hashedPassword,
    });

    return res.json({
      success: true,
      message: "Account created successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* -------------------- LOGIN -------------------- */
export const login = async (req, res) => {
  try {
    const { phonenumber, password } = req.body;

    if (!password || !phonenumber) {
      return res.status(401).json({ success: false, message: "Please fill all the fields" });
    }

    const user = await Patient.findOne({ phonenumber });
    if (!user) {
      return res.json({ success: false, message: "Incorrect phonenumber or password" });
    }

    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      return res.json({ success: false, message: "Incorrect Password" });
    }

    const key = process.env.JWT_SECRET || "secretkey";
    const token = jwt.sign({ id: user._id, role: "patient" }, key, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res.json({
      success: true,
      message: "Logged in successfully",
      token,
      patient: {
        id: user._id,
        name: user.name,
        phonenumber: user.phonenumber,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* -------------------- LOGOUT -------------------- */
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------------- AUTH MIDDLEWARE -------------------- */
import { protectPatient as protectPatientMiddleware } from "../middleware/authMiddleware.js";
export const protectPatient = protectPatientMiddleware;

/* -------------------- GET LOGGED-IN PATIENT -------------------- */
export const getMyPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.patientId).select("_id name phonenumber");

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    return res.json({ success: true, patient });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- GET ALL PATIENTS -------------------- */
export const getpatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .select("_id name phonenumber")
      .sort({ name: 1 });

    res.json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------------- GET HOSPITAL DETAILS -------------------- */
export const getHospitalDetails = async (req, res) => {
  try {
    const hospitalId = req.params.id;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.json({ success: false, message: "Hospital not found" });
    }

    const departments = await Department.find({ hospital: hospitalId });

    return res.json({ success: true, hospital, departments });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: "Server error" });
  }
};

