// testSeeder.js
// Run: node testSeeder.js
require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const BASE_URL = 'http://localhost:' + (process.env.PORT || 5000) + '/api/auth';

const testUser = {
  name: 'Test User',
  role: 'student',
  aadhaar: '123456789012',
  email: 'testuser@example.com',
  mobile: '9876543210',
  username: 'testuser',
  password: 'TestPass123'
};

async function runSeeder() {
  await connectDB();
  console.log('Connected to DB');

  // Test signup
  try {
    const signupRes = await axios.post(BASE_URL + '/signup', testUser);
    console.log('Signup response:', signupRes.data);
  } catch (err) {
    console.error('Signup error:', err.response?.data || err.message);
  }

  // Simulate OTP received (in real app, fetch from DB or email/SMS)
  const User = require('./models/userModel');
  const user = await User.findOne({ username: testUser.username });
  if (!user || !user.otp) {
    console.error('OTP not found for test user');
    return;
  }

  // Test login 
  try {
    const loginRes = await axios.post(BASE_URL + '/login', {
      username: testUser.username,
      password: testUser.password,
      otp: user.otp
    });
    console.log('Login response:', loginRes.data);
  } catch (err) {
    console.error('Login error:', err.response?.data || err.message);
  }

  mongoose.connection.close();
}

runSeeder();
