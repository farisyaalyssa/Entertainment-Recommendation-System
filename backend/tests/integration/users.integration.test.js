const request = require('supertest');
const createApp = require('../../app');
const { createTestUser, authHeader } = require('../helpers/testHelpers');

const app = createApp();

describe('Users API integration', () => {
  it('returns the authenticated user profile', async () => {
    const { user, token } = await createTestUser();

    const res = await request(app)
      .get('/api/users/profile')
      .set(authHeader(token));

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(user.email);
  });

  it('updates profile details', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .put('/api/users/profile')
      .set(authHeader(token))
      .send({
        name: 'Updated Profile Name',
        username: `updated${Date.now()}`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe('Updated Profile Name');
  });

  it('changes password and allows login with the new password', async () => {
    const suffix = Date.now();
    const { user, token, plainPassword } = await createTestUser({
      email: `pwchange${suffix}@example.com`,
      username: `pwchange${suffix}`,
    });

    const changeRes = await request(app)
      .put('/api/users/password')
      .set(authHeader(token))
      .send({
        currentPassword: plainPassword,
        newPassword: 'NewPass2',
      });

    expect(changeRes.statusCode).toBe(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'NewPass2',
      });

    expect(loginRes.statusCode).toBe(200);
  });

  it('updates user preferences', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .put('/api/users/preferences')
      .set(authHeader(token))
      .send({
        genres: ['Action', 'Comedy'],
        contentRating: 'PG-13',
        notifications: {
          recommendations: true,
          watchlistReminders: false,
          newReleases: true,
        },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.preferences.genres).toEqual(['Action', 'Comedy']);
  });
});
