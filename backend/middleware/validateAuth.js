const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

const validateRegister = (req, res, next) => {
  const errors = [];
  const { name, username, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name is required and must be at least 2 characters' });
  }

  if (!username || typeof username !== 'string') {
    errors.push({ field: 'username', message: 'Username is required' });
  } else {
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      errors.push({ field: 'username', message: 'Username must be between 3 and 30 characters' });
    }
    if (!USERNAME_REGEX.test(trimmedUsername)) {
      errors.push({
        field: 'username',
        message: 'Username can only contain letters, numbers, and underscores',
      });
    }
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else {
    if (password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' });
    }
    if (!/[0-9]/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain at least one number' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  req.body.name = name.trim();
  req.body.username = username.trim().toLowerCase();
  req.body.email = email.trim().toLowerCase();

  next();
};

const validateLogin = (req, res, next) => {
  const errors = [];
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  req.body.email = email.trim().toLowerCase();

  next();
};

module.exports = { validateRegister, validateLogin };
