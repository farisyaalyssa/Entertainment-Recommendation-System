const request = require('supertest');
const createApp = require('../../app');
const { createTestUser, authHeader, sampleContent } = require('../helpers/testHelpers');

const app = createApp();

describe('Reviews API integration', () => {
  it('submits, lists, updates, and deletes a review', async () => {
    const { user, token } = await createTestUser();

    const createRes = await request(app)
      .post('/api/reviews')
      .set(authHeader(token))
      .send({
        tmdbId: sampleContent.tmdbId,
        type: sampleContent.type,
        rating: 8,
        review: 'Excellent film',
      });

    expect(createRes.statusCode).toBe(201);
    const reviewId = createRes.body.review.id;

    const listRes = await request(app)
      .get(`/api/reviews?tmdbId=${sampleContent.tmdbId}&type=${sampleContent.type}`)
      .set(authHeader(token));

    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.count).toBe(1);

    const mineRes = await request(app)
      .get('/api/reviews/mine')
      .set(authHeader(token));

    expect(mineRes.statusCode).toBe(200);
    expect(mineRes.body.reviews[0].review).toBe('Excellent film');

    const updateRes = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set(authHeader(token))
      .send({ rating: 9, review: 'Even better on rewatch' });

    expect(updateRes.statusCode).toBe(200);

    const deleteRes = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set(authHeader(token));

    expect(deleteRes.statusCode).toBe(200);
    expect(String(createRes.body.review.userId)).toBe(String(user._id));
  });
});
