const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  },
  aadhaar: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  refreshToken: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);