const Watchlist = require('../../models/Watchlist');
const { createTestUser, sampleContent } = require('../helpers/testHelpers');

describe('Watchlist model (database)', () => {
  it('stores watchlist items for a user', async () => {
    const { user } = await createTestUser();

    const item = await Watchlist.create({
      userId: user._id,
      ...sampleContent,
    });

    expect(item.title).toBe(sampleContent.title);
    expect(item.type).toBe('movie');
  });

  it('prevents duplicate watchlist entries for the same title', async () => {
    const { user } = await createTestUser();

    await Watchlist.create({
      userId: user._id,
      ...sampleContent,
    });

    await expect(
      Watchlist.create({
        userId: user._id,
        ...sampleContent,
      })
    ).rejects.toThrow();
  });

  it('keeps watchlist items isolated per user', async () => {
    const userOne = await createTestUser();
    const userTwo = await createTestUser();

    await Watchlist.create({ userId: userOne.user._id, ...sampleContent });
    await Watchlist.create({
      userId: userTwo.user._id,
      ...sampleContent,
      title: 'Different User Item',
    });

    const userOneItems = await Watchlist.find({ userId: userOne.user._id });
    const userTwoItems = await Watchlist.find({ userId: userTwo.user._id });

    expect(userOneItems).toHaveLength(1);
    expect(userTwoItems).toHaveLength(1);
    expect(userOneItems[0].title).toBe(sampleContent.title);
  });
});
