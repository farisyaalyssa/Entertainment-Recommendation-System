const {
  validateUpdateProfile,
  validateChangePassword,
  validateUpdatePreferences,
  validateDeleteAccount,
} = require('../../middleware/validateUser');
const { runMiddleware } = require('../helpers/middleware');

describe('validateUser middleware', () => {
  it('accepts valid profile updates', async () => {
    const { req, next } = await runMiddleware(validateUpdateProfile, {
      body: {
        name: 'Updated Name',
        username: 'updateduser',
      },
    });

    expect(next).toHaveBeenCalled();
    expect(req.body.name).toBe('Updated Name');
    expect(req.body.username).toBe('updateduser');
  });

  it('rejects profile updates with no fields', async () => {
    const { res, next } = await runMiddleware(validateUpdateProfile, {
      body: {},
    });

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
  });

  it('accepts valid password changes', async () => {
    const { next } = await runMiddleware(validateChangePassword, {
      body: {
        currentPassword: 'OldPass1',
        newPassword: 'NewPass2',
      },
    });

    expect(next).toHaveBeenCalled();
  });

  it('rejects password changes when new password matches current password', async () => {
    const { res, next } = await runMiddleware(validateChangePassword, {
      body: {
        currentPassword: 'SamePass1',
        newPassword: 'SamePass1',
      },
    });

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
  });

  it('accepts valid preference updates', async () => {
    const { next } = await runMiddleware(validateUpdatePreferences, {
      body: {
        genres: ['Action', 'Drama'],
        contentRating: 'PG-13',
        notifications: {
          recommendations: true,
          watchlistReminders: false,
          newReleases: true,
        },
      },
    });

    expect(next).toHaveBeenCalled();
  });

  it('accepts valid account delete actions', async () => {
    const { next } = await runMiddleware(validateDeleteAccount, {
      body: { action: 'deactivate' },
    });

    expect(next).toHaveBeenCalled();
  });

  it('rejects invalid account delete actions', async () => {
    const { res, next } = await runMiddleware(validateDeleteAccount, {
      body: { action: 'pause' },
    });

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
  });
});
