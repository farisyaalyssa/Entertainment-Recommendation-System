const { validateRegister, validateLogin } = require('../../middleware/validateAuth');
const { runMiddleware } = require('../helpers/middleware');

describe('validateAuth middleware', () => {
  describe('validateRegister', () => {
    it('accepts valid registration input', async () => {
      const { req, res, next } = await runMiddleware(validateRegister, {
        body: {
          name: 'Jane Doe',
          username: 'janedoe',
          email: 'jane@example.com',
          password: 'Password1',
        },
      });

      expect(next).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(req.body.username).toBe('janedoe');
      expect(req.body.email).toBe('jane@example.com');
    });

    it('rejects weak passwords', async () => {
      const { res, next } = await runMiddleware(validateRegister, {
        body: {
          name: 'Jane Doe',
          username: 'janedoe',
          email: 'jane@example.com',
          password: 'password',
        },
      });

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('rejects invalid email addresses', async () => {
      const { res, next } = await runMiddleware(validateRegister, {
        body: {
          name: 'Jane Doe',
          username: 'janedoe',
          email: 'not-an-email',
          password: 'Password1',
        },
      });

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
    });
  });

  describe('validateLogin', () => {
    it('accepts valid login input', async () => {
      const { req, res, next } = await runMiddleware(validateLogin, {
        body: {
          email: 'jane@example.com',
          password: 'Password1',
        },
      });

      expect(next).toHaveBeenCalled();
      expect(req.body.email).toBe('jane@example.com');
      expect(res.statusCode).toBe(200);
    });

    it('rejects missing password', async () => {
      const { res, next } = await runMiddleware(validateLogin, {
        body: {
          email: 'jane@example.com',
        },
      });

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
    });
  });
});
