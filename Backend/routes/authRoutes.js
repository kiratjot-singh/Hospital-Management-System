import express from "express";
import {
  signup,
  loginPassword,
  sendEmailOtp,
  verifyEmailOtp,
  getname,
  toggleAvailability,
  logout,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login-password", loginPassword);
router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/getname", getname);
router.patch("/:id/availability", toggleAvailability);
router.post("/logout", logout);

// router.post("/bookappointment",bookAppointment)


export default router;
