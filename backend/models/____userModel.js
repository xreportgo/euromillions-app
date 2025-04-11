// backend/models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  settings: {
    language: {
      type: String,
      enum: ['fr', 'en'],
      default: 'fr'
    },
    notifications: {
      type: Boolean,
      default: false
    }
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
