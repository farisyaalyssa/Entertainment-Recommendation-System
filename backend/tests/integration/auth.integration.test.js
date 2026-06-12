const request = require('supertest');
const createApp = require('../../app');

const app = createApp();

describe('Auth API integration', () => {
  it('registers a new user', async () => {
    const suffix = Date.now();

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Integration User',
        username: `intuser${suffix}`,
        email: `intuser${suffix}@example.com`,
        password: 'Password1',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(`intuser${suffix}@example.com`);
  });

  it('logs in with valid credentials', async () => {
    const suffix = Date.now();
    const email = `login${suffix}@example.com`;

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        username: `loginuser${suffix}`,
        email,
        password: 'Password1',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Password1' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.message).toBe('Login successful');
  });

  it('rejects invalid login credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'missing@example.com',
        password: 'Password1',
      });

    expect(res.statusCode).toBe(401);
  });
});
