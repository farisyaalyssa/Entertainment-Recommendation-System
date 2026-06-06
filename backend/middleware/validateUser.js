const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const VALID_CONTENT_RATINGS = ['All', 'G', 'PG', 'PG-13', 'R', 'NC-17'];

const validatePassword = (password, fieldName = 'password') => {
  const errors = [];

  if (!password || typeof password !== 'string') {
    errors.push({ field: fieldName, message: 'Password is required' });
    return errors;
  }

  if (password.length < 8) {
    errors.push({ field: fieldName, message: 'Password must be at least 8 characters' });
  }
  if (!/[A-Z]/.test(password)) {
    errors.push({ field: fieldName, message: 'Password must contain at least one uppercase letter' });
  }
  if (!/[0-9]/.test(password)) {
    errors.push({ field: fieldName, message: 'Password must contain at least one number' });
  }

  return errors;
};

const validateUpdateProfile = (req, res, next) => {
  const errors = [];
  const { name, username, avatar } = req.body;

  if (name === undefined && username === undefined && avatar === undefined) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: [{ field: 'body', message: 'At least one of name, username, or avatar is required' }],
    });
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    } else {
      req.body.name = name.trim();
    }
  }

  if (username !== undefined) {
    if (typeof username !== 'string') {
      errors.push({ field: 'username', message: 'Username must be a string' });
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
      req.body.username = trimmedUsername.toLowerCase();
    }
  }

  if (avatar !== undefined && typeof avatar !== 'string') {
    errors.push({ field: 'avatar', message: 'Avatar must be a string' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateChangePassword = (req, res, next) => {
  const errors = [];
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }

  errors.push(...validatePassword(newPassword, 'newPassword'));

  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push({
      field: 'newPassword',
      message: 'New password must be different from current password',
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateUpdatePreferences = (req, res, next) => {
  const errors = [];
  const { genres, contentRating, notifications } = req.body;

  if (genres === undefined && contentRating === undefined && notifications === undefined) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: [{ field: 'body', message: 'At least one preference field is required' }],
    });
  }

  if (genres !== undefined) {
    if (!Array.isArray(genres) || genres.some((genre) => typeof genre !== 'string' || !genre.trim())) {
      errors.push({ field: 'genres', message: 'Genres must be an array of non-empty strings' });
    } else {
      req.body.genres = genres.map((genre) => genre.trim());
    }
  }

  if (contentRating !== undefined) {
    if (typeof contentRating !== 'string' || !VALID_CONTENT_RATINGS.includes(contentRating)) {
      errors.push({
        field: 'contentRating',
        message: `Content rating must be one of: ${VALID_CONTENT_RATINGS.join(', ')}`,
      });
    }
  }

  if (notifications !== undefined) {
    if (typeof notifications !== 'object' || notifications === null || Array.isArray(notifications)) {
      errors.push({ field: 'notifications', message: 'Notifications must be an object' });
    } else {
      const booleanFields = ['recommendations', 'watchlistReminders', 'newReleases'];
      booleanFields.forEach((field) => {
        if (
          notifications[field] !== undefined &&
          typeof notifications[field] !== 'boolean'
        ) {
          errors.push({
            field: `notifications.${field}`,
            message: `${field} must be a boolean`,
          });
        }
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateDeleteAccount = (req, res, next) => {
  const { action } = req.body;

  if (!action || !['deactivate', 'delete'].includes(action)) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: [{ field: 'action', message: 'Action must be either "deactivate" or "delete"' }],
    });
  }

  next();
};

module.exports = {
  validateUpdateProfile,
  validateChangePassword,
  validateUpdatePreferences,
  validateDeleteAccount,
};
