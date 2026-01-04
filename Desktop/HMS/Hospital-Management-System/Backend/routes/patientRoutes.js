import express from "express";
import { getHospitalDetails, login, signup } from "../controllers/patientController.js";
const router=express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/hospitaldetails/:id').get(getHospitalDetails);

export default router