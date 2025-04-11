// backend/utils/config.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/euromillions',
  nodeEnv: process.env.NODE_ENV || 'development'
};
