const request = require('supertest');
const createApp = require('../../app');
const { createTestUser, authHeader, sampleContent } = require('../helpers/testHelpers');

const app = createApp();

describe('Favourites API integration', () => {
  it('adds, lists, and removes favourite items', async () => {
    const { token } = await createTestUser();

    const addRes = await request(app)
      .post('/api/favourites')
      .set(authHeader(token))
      .send(sampleContent);

    expect(addRes.statusCode).toBe(201);

    const listRes = await request(app)
      .get('/api/favourites')
      .set(authHeader(token));

    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.count).toBe(1);

    const deleteRes = await request(app)
      .delete(`/api/favourites/${sampleContent.tmdbId}?type=${sampleContent.type}`)
      .set(authHeader(token));

    expect(deleteRes.statusCode).toBe(200);
  });
});
