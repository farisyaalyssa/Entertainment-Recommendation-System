const validateAddHistoryItem = (req, res, next) => {
  const errors = [];
  const { tmdbId, type, title, poster } = req.body;

  if (tmdbId === undefined || tmdbId === null || Number.isNaN(Number(tmdbId))) {
    errors.push({ field: 'tmdbId', message: 'A valid TMDB ID is required' });
  } else {
    req.body.tmdbId = Number(tmdbId);
  }

  if (!type || !['movie', 'tv'].includes(type)) {
    errors.push({ field: 'type', message: 'Type must be either "movie" or "tv"' });
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else {
    req.body.title = title.trim();
  }

  if (poster !== undefined && typeof poster !== 'string') {
    errors.push({ field: 'poster', message: 'Poster must be a string' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

module.exports = { validateAddHistoryItem };
