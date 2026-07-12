import express from "express";
import {
  doctorSignup,
  doctorLogin,
  doctorLogout,
  getDoctorById,
  getDepartments,
  getDoctorsByDepartment,
  updateDoctorShift,
} from "../controllers/doctorController.js";
import { protectDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", doctorSignup);
router.post("/login", doctorLogin);
router.post("/logout", doctorLogout);
router.get("/getDoctor/:id", getDoctorById);
router.post("/getDepartment", getDepartments);
router.get("/deptdoctors/:id", getDoctorsByDepartment);
router.patch("/shift", protectDoctor, updateDoctorShift);


export default router;
