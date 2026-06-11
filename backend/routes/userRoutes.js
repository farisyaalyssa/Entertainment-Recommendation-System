const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const protect = require('../middleware/auth');
const {
  validateUpdateProfile,
  validateChangePassword,
  validateUpdatePreferences,
  validateDeleteAccount,
} = require('../middleware/validateUser');

const router = express.Router();

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  preferences: user.preferences,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

router.use(protect);

router.get('/profile', (req, res) => {
  res.json({ user: formatUser(req.user) });
});

router.put('/profile', validateUpdateProfile, async (req, res) => {
  try {
    const { name, username, avatar } = req.body;
    const user = req.user;

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }

    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: formatUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Username is already taken' });
    }

    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

router.put('/password', validateChangePassword, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findOne({ _id: req.user._id }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.password) {
      return res.status(500).json({ message: 'Could not verify current password' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error.message);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

router.put('/preferences', validateUpdatePreferences, async (req, res) => {
  try {
    const { genres, contentRating, notifications } = req.body;
    const user = req.user;

    if (genres !== undefined) user.preferences.genres = genres;
    if (contentRating !== undefined) user.preferences.contentRating = contentRating;

    if (notifications) {
      if (notifications.recommendations !== undefined) {
        user.preferences.notifications.recommendations = notifications.recommendations;
      }
      if (notifications.watchlistReminders !== undefined) {
        user.preferences.notifications.watchlistReminders = notifications.watchlistReminders;
      }
      if (notifications.newReleases !== undefined) {
        user.preferences.notifications.newReleases = notifications.newReleases;
      }
    }

    user.markModified('preferences');
    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Update preferences error:', error.message);
    res.status(500).json({ message: 'Server error updating preferences' });
  }
});

router.delete('/account', validateDeleteAccount, async (req, res) => {
  try {
    const { action } = req.body;

    if (action === 'deactivate') {
      req.user.isActive = false;
      await req.user.save();
      return res.json({ message: 'Account deactivated successfully' });
    }

    await User.findByIdAndDelete(req.user._id);
    return res.json({ message: 'Account permanently deleted' });
  } catch (error) {
    console.error('Delete account error:', error.message);
    res.status(500).json({ message: 'Server error deleting account' });
  }
});

module.exports = router;
