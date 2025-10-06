exports.validateSignup = (body) => {
  const { role, aadhaar, email, mobile, username, password } = body;
  if (!role || !aadhaar || !email || !mobile || !username || !password) {
    return false;
  }
  // Add more validation as needed (regex, length, etc.)
  return true;
};
