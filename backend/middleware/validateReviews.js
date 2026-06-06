const mongoose = require('mongoose');

const validateGetReviews = (req, res, next) => {
  const errors = [];
  const tmdbId = Number(req.query.tmdbId);
  const { type } = req.query;

  if (Number.isNaN(tmdbId)) {
    errors.push({ field: 'tmdbId', message: 'Query parameter tmdbId is required and must be a valid number' });
  }

  if (!type || !['movie', 'tv'].includes(type)) {
    errors.push({ field: 'type', message: 'Query parameter type must be either "movie" or "tv"' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  req.reviewQuery = { tmdbId, type };
  next();
};

const validateSubmitReview = (req, res, next) => {
  const errors = [];
  const { tmdbId, type, rating, review } = req.body;

  if (tmdbId === undefined || tmdbId === null || Number.isNaN(Number(tmdbId))) {
    errors.push({ field: 'tmdbId', message: 'A valid TMDB ID is required' });
  } else {
    req.body.tmdbId = Number(tmdbId);
  }

  if (!type || !['movie', 'tv'].includes(type)) {
    errors.push({ field: 'type', message: 'Type must be either "movie" or "tv"' });
  }

  const numericRating = Number(rating);
  if (Number.isNaN(numericRating) || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 10) {
    errors.push({ field: 'rating', message: 'Rating must be an integer between 1 and 10' });
  } else {
    req.body.rating = numericRating;
  }

  if (!review || typeof review !== 'string' || !review.trim()) {
    errors.push({ field: 'review', message: 'Review text is required' });
  } else {
    req.body.review = review.trim();
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateUpdateReview = (req, res, next) => {
  const errors = [];
  const { rating, review } = req.body;

  if (rating === undefined && review === undefined) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: [{ field: 'body', message: 'At least one of rating or review is required' }],
    });
  }

  if (rating !== undefined) {
    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 10) {
      errors.push({ field: 'rating', message: 'Rating must be an integer between 1 and 10' });
    } else {
      req.body.rating = numericRating;
    }
  }

  if (review !== undefined) {
    if (typeof review !== 'string' || !review.trim()) {
      errors.push({ field: 'review', message: 'Review text cannot be empty' });
    } else {
      req.body.review = review.trim();
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateReviewId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid review ID' });
  }

  next();
};

module.exports = {
  validateGetReviews,
  validateSubmitReview,
  validateUpdateReview,
  validateReviewId,
};
