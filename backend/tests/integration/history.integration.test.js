const request = require('supertest');
const createApp = require('../../app');
const { createTestUser, authHeader, sampleContent } = require('../helpers/testHelpers');

const app = createApp();

describe('History API integration', () => {
  it('records, lists, and clears watch history', async () => {
    const { token } = await createTestUser();

    const addRes = await request(app)
      .post('/api/history')
      .set(authHeader(token))
      .send(sampleContent);

    expect(addRes.statusCode).toBe(201);

    const listRes = await request(app)
      .get('/api/history')
      .set(authHeader(token));

    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.count).toBe(1);

    const clearRes = await request(app)
      .delete('/api/history')
      .set(authHeader(token));

    expect(clearRes.statusCode).toBe(200);

    const afterClear = await request(app)
      .get('/api/history')
      .set(authHeader(token));

    expect(afterClear.body.count).toBe(0);
  });
});
