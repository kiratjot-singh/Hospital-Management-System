import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Hospital from "../models/Hospital.js";
import Department from "../models/Department.js";

async function seedDepartments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const hospitals = await Hospital.find();

    if (hospitals.length === 0) {
      throw new Error("No hospitals found. Seed hospitals first.");
    }

    const departmentNames = [
      "Cardiology",
      "Neurology",
      "Orthopedics",
      "Pediatrics",
      "Dermatology",
      "Oncology",
      "Radiology",
      "Emergency",
      "Gynecology",
      "ENT"
    ];

    for (const hospital of hospitals) {
      for (const name of departmentNames) {
        await Department.create({
          name,
          hospital: hospital._id
        });
      }

      console.log(`Seeded departments for ${hospital.name}`);
    }

  } catch (err) {
    console.error("Error seeding departments:", err.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

seedDepartments();
