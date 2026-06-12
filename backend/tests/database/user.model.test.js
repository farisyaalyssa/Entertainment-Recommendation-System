const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { createTestUser } = require('../helpers/testHelpers');

describe('User model (database)', () => {
  it('stores hashed passwords instead of plain text', async () => {
    const plainPassword = 'Password1';
    const { user } = await createTestUser({ plainPassword });

    const storedUser = await User.findById(user._id).select('+password');

    expect(storedUser.password).not.toBe(plainPassword);
    expect(await bcrypt.compare(plainPassword, storedUser.password)).toBe(true);
  });

  it('applies default preferences', async () => {
    const { user } = await createTestUser();

    expect(user.preferences.contentRating).toBe('All');
    expect(user.preferences.notifications.recommendations).toBe(true);
    expect(user.preferences.genres).toEqual([]);
  });

  it('enforces unique email addresses', async () => {
    const suffix = Date.now();
    const email = `unique${suffix}@example.com`;

    await createTestUser({ email, username: `usera${suffix}` });

    await expect(
      createTestUser({ email, username: `userb${suffix}` })
    ).rejects.toThrow();
  });

  it('matches passwords with matchPassword()', async () => {
    const plainPassword = 'Password1';
    const { user } = await createTestUser({ plainPassword });
    const storedUser = await User.findById(user._id).select('+password');

    expect(await storedUser.matchPassword(plainPassword)).toBe(true);
    expect(await storedUser.matchPassword('WrongPass1')).toBe(false);
  });
});
