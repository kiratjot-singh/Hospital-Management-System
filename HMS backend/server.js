import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js"
import patientRoutes from "./routes/patientRoutes.js"

dotenv.config();
connectDB();

const app = express();


app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,POST",
  allowedHeaders: "Content-Type",
}));
app.use(express.json());

app.use("/api/receptionist", authRoutes);
app.use("/api/doctor",doctorRoutes);
app.use("/api/hospital",hospitalRoutes);
app.use("/api/patient",patientRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
