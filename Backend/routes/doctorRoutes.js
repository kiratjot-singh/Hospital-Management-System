import express from "express";
import { doctorSignup, doctorLogin ,getDoctorById, getDepartments, getDoctorsByDepartment} from "../controllers/doctorController.js";

const router = express.Router();

router.post("/signup", doctorSignup);
router.post("/login", doctorLogin);
router.get("/getDoctor/:id", getDoctorById);
router.post("/getDepartment",getDepartments)
router.get("/deptdoctors/:id",getDoctorsByDepartment)


export default router;
