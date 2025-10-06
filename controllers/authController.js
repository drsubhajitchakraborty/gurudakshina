const User = require('../models/userModel');
const otpService = require('../services/otpService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateSignup } = require('../utils/validation');
const { isValidEmail } = require('../helpers/emailHelper');
const { isStrongPassword } = require('../helpers/passwordHelper');

// Signup
exports.signup = async (req, res) => {
  try {
    let { name, role, aadhaar, email, mobile, username, password } = req.body;
    // Basic sanitization
    name = name?.trim();
    role = role?.trim();
    aadhaar = aadhaar?.trim();
    email = email?.trim();
    mobile = mobile?.trim();
    username = username?.trim();
    password = password?.trim();

    if (!name || !role || !aadhaar || !email || !mobile || !username || !password) {
      return res.status(400).json({ message: 'All fields (name, role, aadhaar, email, mobile, username, password) are required.' });
    }
    if (!validateSignup({ role, aadhaar, email, mobile, username, password })) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters, include uppercase, lowercase, and a number.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, role, aadhaar, email, mobile, username, password: hashedPassword });
    await user.save();
    // Generate OTP
    const otp = otpService.generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    // Send OTP (implement email/sms sending in otpService)
    await otpService.sendOTP(user.email, user.mobile, otp);
    res.status(201).json({ message: 'Signup successful. OTP sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    let { username, password, otp } = req.body;
    username = username?.trim();
    password = password?.trim();
    otp = otp?.trim();
    if (!username || !password || !otp) {
      return res.status(400).json({ message: 'Username, password, and OTP are required.' });
    }
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid password.' });
    if (!otp || otp !== user.otp || user.otpExpires < Date.now()) {
      return res.status(401).json({ message: 'Invalid or expired OTP.' });
    }
    // Generate access token
    const accessToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    user.refreshToken = refreshToken;
    await user.save();
    res.status(200).json({
      message: 'Login successful.',
      accessToken,
      refreshToken
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token.' });
    }
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      // Generate new access token
      const accessToken = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      res.status(200).json({ accessToken });
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired refresh token.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot Username
exports.forgotUsername = async (req, res) => {
  try {
    const { email, mobile } = req.body;
    const user = await User.findOne({ email, mobile });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { username, email, mobile } = req.body;
    const user = await User.findOne({ username, email, mobile });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    // Generate OTP
    const otp = otpService.generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    await otpService.sendOTP(user.email, user.mobile, otp);
    res.status(200).json({ message: 'OTP sent for password reset.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change Username
exports.changeUsername = async (req, res) => {
  try {
    const { oldUsername, newUsername, password, otp } = req.body;
    const user = await User.findOne({ username: oldUsername });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid password.' });
    if (!otp || otp !== user.otp || user.otpExpires < Date.now()) {
      return res.status(401).json({ message: 'Invalid or expired OTP.' });
    }
    user.username = newUsername;
    await user.save();
    res.status(200).json({ message: 'Username changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { username, oldPassword, newPassword, otp } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid old password.' });
    if (!otp || otp !== user.otp || user.otpExpires < Date.now()) {
      return res.status(401).json({ message: 'Invalid or expired OTP.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
