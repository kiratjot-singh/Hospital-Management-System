import mongoose from "mongoose";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import Department from "../models/Department.js";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const seedDoctors = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is undefined");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const hospital = await Hospital.findOne({ name: "City Care Hospital" });
    if (!hospital) {
      console.log("❌ Hospital not found");
      process.exit(1);
    }

    const cardiology = await Department.findOne({ name: "Cardiology" });
    const dermatology = await Department.findOne({ name: "Dermatology" });
    const orthopedics = await Department.findOne({ name: "Orthopedics" });

    if (!cardiology || !dermatology || !orthopedics) {
      console.log("❌ One or more departments missing. Seed departments first.");
      process.exit(1);
    }

    const doctors = [
      {
        name: "Dr. Rahul Sharma",
        phone: "9000000001",
        qualifications: "MBBS, MD (Cardiology)",
        departments: [cardiology._id],
        hospital: hospital._id,
        experience: 8,
        workingHours: { start: "10:00", end: "17:00" },
        slotDuration: 15,
      },
      {
        name: "Dr. Neha Verma",
        phone: "9000000002",
        qualifications: "MBBS, MD (Dermatology)",
        departments: [dermatology._id],
        hospital: hospital._id,
        experience: 5,
        workingHours: { start: "09:00", end: "14:00" },
        slotDuration: 20,
      },
      {
        name: "Dr. Amit Kapoor",
        phone: "9000000003",
        qualifications: "MBBS, MS (Orthopedics)",
        departments: [orthopedics._id],
        hospital: hospital._id,
        experience: 10,
        workingHours: { start: "11:00", end: "18:00" },
        slotDuration: 15,
      },
    ];

    await Doctor.insertMany(doctors);
    console.log("✅ Doctors seeded successfully");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
    process.exit(1);
  }
};

seedDoctors();
