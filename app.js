dotenv.config();
connectDB();
dotenv.config();
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Sentry = require('@sentry/node');
dotenv.config();
Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
});
connectDB();
const createApp = require('./config/express');
const app = createApp();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
