import express from 'express';
import { registerUser, loginUser, verifyOtp, resendOtp, sendOtp } from '../controllers/authController.js'; 

const router = express.Router();

// POST request to register a new user
router.post('/signup', registerUser);

// POST request to login a user
router.post('/login', loginUser);

// POST request to send OTP
router.post('/send-otp', sendOtp);

// POST request to resend OTP
router.post('/resend-otp', resendOtp);
// POST request to verify OTP
router.post('/verify-otp', verifyOtp);

export default router;
