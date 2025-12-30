import express from "express";
import { doctorSignup, doctorLogin ,getDoctorById} from "../controllers/doctorController.js";

const router = express.Router();

router.post("/signup", doctorSignup);
router.post("/login", doctorLogin);
router.get("/getDoctor/:id", getDoctorById);


export default router;
