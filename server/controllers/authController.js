import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { htmlEmailTemplate, textEmailTemplate } from '../utils/emailTemplates.js';
import { generateAndSendOtp } from '../utils/generateAndSendOtp.js';

const OTP_CONFIG = {
  EXPIRATION_MINUTES: 10,
  LENGTH: 6,
  MAX_ATTEMPTS: 3,
  RESEND_DELAY_MS: 30 * 1000, // 30 seconds
};

/**
 * Send OTP manually (optional endpoint)
 */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    await generateAndSendOtp(email, user);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email.',
    });
  } catch (error) {
    console.error('Send OTP Error:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
};

/**
 * User Registration
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists. Please login or reset password.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      isVerified: false,
    });

    await newUser.save();
    await generateAndSendOtp(email, newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Verification OTP sent to your email.',
      data: { email },
    });
  } catch (error) {
    console.error('Registration Error:', error.stack);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again later.' });
  }
};

/**
 * OTP Verification
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    if (user.otpAttempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: 'Maximum OTP attempts reached. Please request a new OTP.',
      });
    }

    const isOtpExpired = Date.now() > user.otpExpires;
    const isOtpValid = await bcrypt.compare(otp, user.otp || '');

    if (!isOtpValid || isOtpExpired) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: isOtpExpired ? 'OTP has expired' : 'Invalid OTP',
        attemptsLeft: OTP_CONFIG.MAX_ATTEMPTS - user.otpAttempts,
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      data: { email, verified: true },
    });
  } catch (error) {
    console.error('OTP Verification Error:', error.stack);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
};

/**
 * Resend OTP
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    if (user.otpExpires && Date.now() < user.otpExpires - OTP_CONFIG.RESEND_DELAY_MS) {
      return res.status(429).json({ success: false, message: 'Please wait before requesting a new OTP.' });
    }

    await generateAndSendOtp(email, user);

    res.status(200).json({ success: true, message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP Error:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to resend OTP. Please try again.' });
  }
};

/**
 * User Login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Account not verified. Please verify your email first.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: userData, token },
    });
  } catch (error) {
    console.error('Login Error:', error.stack);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};