import express from "express";
import { getHospitals, updateHospital, getHospitalById } from "../controllers/hospitalController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/getHospitals", getHospitals);
router.get("/getHospital/:id", getHospitalById);
router.patch("/update/:id", protectDoctor, updateHospital);

export default router;
