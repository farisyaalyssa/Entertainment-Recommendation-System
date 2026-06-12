const History = require('../../models/History');
const { createTestUser, sampleContent } = require('../helpers/testHelpers');

describe('History model (database)', () => {
  it('stores watch history entries', async () => {
    const { user } = await createTestUser();

    const entry = await History.create({
      userId: user._id,
      ...sampleContent,
    });

    expect(entry.title).toBe(sampleContent.title);
    expect(entry.watchedAt).toBeInstanceOf(Date);
  });

  it('updates watchedAt when the same title is watched again', async () => {
    const { user } = await createTestUser();

    const first = await History.create({
      userId: user._id,
      ...sampleContent,
      watchedAt: new Date('2024-01-01T00:00:00.000Z'),
    });

    const updated = await History.findOneAndUpdate(
      {
        userId: user._id,
        tmdbId: sampleContent.tmdbId,
        type: sampleContent.type,
      },
      { watchedAt: new Date('2025-01-01T00:00:00.000Z') },
      { new: true }
    );

    expect(updated._id.toString()).toBe(first._id.toString());
    expect(updated.watchedAt.getTime()).toBeGreaterThan(first.watchedAt.getTime());
  });

  it('keeps history isolated per user', async () => {
    const userOne = await createTestUser();
    const userTwo = await createTestUser();

    await History.create({ userId: userOne.user._id, ...sampleContent });
    await History.create({ userId: userTwo.user._id, ...sampleContent });

    const userOneHistory = await History.find({ userId: userOne.user._id });
    const userTwoHistory = await History.find({ userId: userTwo.user._id });

    expect(userOneHistory).toHaveLength(1);
    expect(userTwoHistory).toHaveLength(1);
  });
});
