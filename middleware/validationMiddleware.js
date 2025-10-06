// Scalable validation middleware for signup and login
module.exports = {
  validateSignup: (req, res, next) => {
    const { name, role, aadhaar, email, mobile, username, password } = req.body;
    if (!name || !role || !aadhaar || !email || !mobile || !username || !password) {
      return res.status(400).json({ message: 'All fields (name, role, aadhaar, email, mobile, username, password) are required.' });
    }
    next();
  },
  validateLogin: (req, res, next) => {
    const { username, password, otp } = req.body;
    if (!username || !password || !otp) {
      return res.status(400).json({ message: 'Username, password, and OTP are required.' });
    }
    next();
  }
};
