const {
  validateGetReviews,
  validateSubmitReview,
  validateUpdateReview,
  validateReviewId,
} = require('../../middleware/validateReviews');
const { runMiddleware } = require('../helpers/middleware');

describe('validateReviews middleware', () => {
  it('accepts valid review query params', async () => {
    const { req, next } = await runMiddleware(validateGetReviews, {
      query: { tmdbId: '550', type: 'movie' },
    });

    expect(next).toHaveBeenCalled();
    expect(req.reviewQuery).toEqual({ tmdbId: 550, type: 'movie' });
  });

  it('accepts valid review submissions', async () => {
    const { req, next } = await runMiddleware(validateSubmitReview, {
      body: {
        tmdbId: 550,
        type: 'movie',
        rating: 8,
        review: 'Great movie',
      },
    });

    expect(next).toHaveBeenCalled();
    expect(req.body.rating).toBe(8);
    expect(req.body.review).toBe('Great movie');
  });

  it('rejects invalid ratings', async () => {
    const { res, next } = await runMiddleware(validateSubmitReview, {
      body: {
        tmdbId: 550,
        type: 'movie',
        rating: 11,
        review: 'Too generous',
      },
    });

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
  });

  it('accepts valid review updates', async () => {
    const { next } = await runMiddleware(validateUpdateReview, {
      body: { rating: 9 },
    });

    expect(next).toHaveBeenCalled();
  });

  it('rejects invalid review ids', async () => {
    const { res, next } = await runMiddleware(validateReviewId, {
      params: { id: 'not-a-valid-id' },
    });

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
  });
});
