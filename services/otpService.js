const crypto = require('crypto');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

exports.generateOTP = () => {
  return ('' + Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
};

// Email setup (Nodemailer)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// SMS setup (Twilio)
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendOTP = async (email, mobile, otp) => {
  let emailResult = false;
  let smsResult = false;
  // Send OTP via email
  if (email) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is: ${otp}`
      });
      emailResult = true;
    } catch (err) {
      console.error('Email OTP error:', err.message);
    }
  }
  // Send OTP via SMS
  if (mobile) {
    try {
      await twilioClient.messages.create({
        body: `Your OTP is: ${otp}`,
        from: process.env.TWILIO_PHONE,
        to: mobile
      });
      smsResult = true;
    } catch (err) {
      console.error('SMS OTP error:', err.message);
    }
  }
  // Log for testing
  if (!emailResult && !smsResult) {
    console.log(`Sending OTP ${otp} to email: ${email}, mobile: ${mobile}`);
  }
  return emailResult || smsResult;
};
