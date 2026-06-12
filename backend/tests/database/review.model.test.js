const Review = require('../../models/Review');
const { createTestUser, sampleContent } = require('../helpers/testHelpers');

describe('Review model (database)', () => {
  it('stores a review with rating and text', async () => {
    const { user } = await createTestUser();

    const review = await Review.create({
      userId: user._id,
      tmdbId: sampleContent.tmdbId,
      type: sampleContent.type,
      rating: 8,
      review: 'Strong story and pacing',
    });

    expect(review.rating).toBe(8);
    expect(review.review).toBe('Strong story and pacing');
  });

  it('allows multiple reviews for the same user and title', async () => {
    const { user } = await createTestUser();

    await Review.create({
      userId: user._id,
      tmdbId: sampleContent.tmdbId,
      type: sampleContent.type,
      rating: 8,
      review: 'First review',
    });

    const secondReview = await Review.create({
      userId: user._id,
      tmdbId: sampleContent.tmdbId,
      type: sampleContent.type,
      rating: 9,
      review: 'Second review',
    });

    expect(secondReview.review).toBe('Second review');
  });

  it('rejects ratings outside the valid range', async () => {
    const { user } = await createTestUser();

    await expect(
      Review.create({
        userId: user._id,
        tmdbId: sampleContent.tmdbId,
        type: sampleContent.type,
        rating: 11,
        review: 'Invalid rating',
      })
    ).rejects.toThrow();
  });
});
