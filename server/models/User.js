import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // Default role is 'user'
  isVerified: { type: Boolean, default: false }, // Field to track if the user is verified
  otp: { type: String }, // Field to store the OTP
  otpExpires: { type: Date }, // Field to store OTP expiration time
});

const User = mongoose.model('User', userSchema);

export default User;