const protect = require('../../middleware/auth');
const { createTestUser } = require('../helpers/testHelpers');
const { runMiddleware } = require('../helpers/middleware');

describe('auth middleware', () => {
  it('allows requests with a valid token', async () => {
    const { user, token } = await createTestUser();

    const { req, next } = await runMiddleware(protect, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(next).toHaveBeenCalled();
    expect(req.user._id.toString()).toBe(user._id.toString());
  });

  it('blocks requests without a token', async () => {
    const { res, next } = await runMiddleware(protect, {
      headers: {},
    });

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  it('blocks requests with an invalid token', async () => {
    const { res, next } = await runMiddleware(protect, {
      headers: { Authorization: 'Bearer invalid-token' },
    });

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  it('blocks deactivated users', async () => {
    const { token } = await createTestUser({ isActive: false });

    const { res, next } = await runMiddleware(protect, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });
});
