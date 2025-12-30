// import express from "express";
// import { sendOtp, verifyOtp, signup, loginPassword } from "../controllers/authController.js";

// const router = express.Router();

// router.post("/signup", signup);
// router.post("/login-password", loginPassword);
// router.post("/send-otp", sendOtp);
// router.post("/verify-otp", verifyOtp);

// export default router;
import express from "express";
import {
  signup,
  loginPassword,
  sendEmailOtp,
  verifyEmailOtp,
  getname,
  
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login-password", loginPassword);
router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/getname", getname);


export default router;
