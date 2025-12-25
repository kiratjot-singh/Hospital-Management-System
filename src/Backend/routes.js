import express from "express";
import { login, signup } from "./usercontroller.js";
const router=express.Router();

router.route('/signup').post(signup);
router.route('/').post(login);

export default router