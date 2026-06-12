const request = require('supertest');
const createApp = require('../../app');
const { createTestUser, authHeader, sampleContent } = require('../helpers/testHelpers');

const app = createApp();

describe('Watchlist API integration', () => {
  it('adds, lists, and removes watchlist items', async () => {
    const { token } = await createTestUser();

    const addRes = await request(app)
      .post('/api/watchlist')
      .set(authHeader(token))
      .send(sampleContent);

    expect(addRes.statusCode).toBe(201);

    const listRes = await request(app)
      .get('/api/watchlist')
      .set(authHeader(token));

    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.count).toBe(1);
    expect(listRes.body.items[0].title).toBe(sampleContent.title);

    const deleteRes = await request(app)
      .delete(`/api/watchlist/${sampleContent.tmdbId}?type=${sampleContent.type}`)
      .set(authHeader(token));

    expect(deleteRes.statusCode).toBe(200);

    const afterDelete = await request(app)
      .get('/api/watchlist')
      .set(authHeader(token));

    expect(afterDelete.body.count).toBe(0);
  });
});
