const Favourite = require('../../models/Favourite');
const { createTestUser, sampleContent } = require('../helpers/testHelpers');

describe('Favourite model (database)', () => {
  it('stores favourite items for a user', async () => {
    const { user } = await createTestUser();

    const item = await Favourite.create({
      userId: user._id,
      ...sampleContent,
    });

    expect(item.title).toBe(sampleContent.title);
  });

  it('prevents duplicate favourite entries', async () => {
    const { user } = await createTestUser();

    await Favourite.create({ userId: user._id, ...sampleContent });

    await expect(
      Favourite.create({ userId: user._id, ...sampleContent })
    ).rejects.toThrow();
  });
});
