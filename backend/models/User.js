const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  preferences: {
    genres: {
      type: [String],
      default: [],
    },
    contentRating: {
      type: String,
      default: 'All',
    },
    notifications: {
      recommendations: {
        type: Boolean,
        default: true,
      },
      watchlistReminders: {
        type: Boolean,
        default: true,
      },
      newReleases: {
        type: Boolean,
        default: false,
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
