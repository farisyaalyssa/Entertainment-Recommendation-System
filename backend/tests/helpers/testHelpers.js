const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

async function createTestUser(overrides = {}) {
  const plainPassword = overrides.plainPassword || 'Test1234';
  const { plainPassword: _ignored, ...userFields } = overrides;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  const suffix = Date.now();
  const user = await User.create({
    name: 'Test User',
    username: `testuser${suffix}`,
    email: `test${suffix}@example.com`,
    password: hashedPassword,
    ...userFields,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  return { user, token, plainPassword };
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

const sampleContent = {
  tmdbId: 550,
  type: 'movie',
  title: 'Fight Club',
  poster: 'https://example.com/poster.jpg',
};

module.exports = {
  createTestUser,
  authHeader,
  sampleContent,
};
