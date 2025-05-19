import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { textEmailTemplate, htmlEmailTemplate } from './emailTemplates.js';  // Add .js extension

dotenv.config(); // ✅ Make sure environment variables are loaded

const OTP_CONFIG = {
  EXPIRATION_MINUTES: 10,
};

// ✅ Ensure proper types and fallback
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Generate and send OTP to user's email
 */
export const generateAndSendOtp = async (email, user) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  // Set OTP and expiration time for the user
  user.otp = hashedOtp;
  user.otpExpires = Date.now() + OTP_CONFIG.EXPIRATION_MINUTES * 60 * 1000;
  user.otpAttempts = 0;
  await user.save();

  const expirationMinutes = OTP_CONFIG.EXPIRATION_MINUTES;

  // Sending OTP email
  await emailTransporter.sendMail({
    from: `"${process.env.EMAIL_SENDER_NAME || 'Auth System'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    text: textEmailTemplate(user.name, otp, expirationMinutes), // Pass OTP and expiration time
    html: htmlEmailTemplate(user.name, otp, expirationMinutes), // Pass OTP and expiration time
  });
};
