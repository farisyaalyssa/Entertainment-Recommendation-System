const express = require('express');
const Review = require('../models/Review');
const protect = require('../middleware/auth');
const {
  validateGetReviews,
  validateSubmitReview,
  validateUpdateReview,
  validateReviewId,
} = require('../middleware/validateReviews');

const router = express.Router();

const formatReview = (review) => ({
  id: review._id,
  userId: review.userId?._id || review.userId,
  tmdbId: review.tmdbId,
  type: review.type,
  rating: review.rating,
  review: review.review,
  createdAt: review.createdAt,
  user: review.userId?.name
    ? {
        name: review.userId.name,
        username: review.userId.username,
        avatar: review.userId.avatar,
      }
    : undefined,
});

router.use(protect);

router.get('/mine', async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      count: reviews.length,
      reviews: reviews.map(formatReview),
    });
  } catch (error) {
    console.error('Get user reviews error:', error.message);
    res.status(500).json({ message: 'Server error fetching your reviews' });
  }
});

router.get('/', validateGetReviews, async (req, res) => {
  try {
    const { tmdbId, type } = req.reviewQuery;

    const reviews = await Review.find({ tmdbId, type })
      .populate('userId', 'name username avatar')
      .sort({ createdAt: -1 });

    res.json({
      count: reviews.length,
      reviews: reviews.map(formatReview),
    });
  } catch (error) {
    console.error('Get reviews error:', error.message);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

router.post('/', validateSubmitReview, async (req, res) => {
  try {
    const { tmdbId, type, rating, review } = req.body;

    const existingReview = await Review.findOne({
      userId: req.user._id,
      tmdbId,
      type,
    });

    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this title' });
    }

    const newReview = await Review.create({
      userId: req.user._id,
      tmdbId,
      type,
      rating,
      review,
    });

    res.status(201).json({
      message: 'Review submitted successfully',
      review: formatReview(newReview),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this title' });
    }

    console.error('Submit review error:', error.message);
    res.status(500).json({ message: 'Server error submitting review' });
  }
});

router.put('/:id', validateReviewId, validateUpdateReview, async (req, res) => {
  try {
    const reviewDoc = await Review.findById(req.params.id);

    if (!reviewDoc) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (reviewDoc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    const { rating, review } = req.body;

    if (rating !== undefined) reviewDoc.rating = rating;
    if (review !== undefined) reviewDoc.review = review;

    await reviewDoc.save();

    res.json({
      message: 'Review updated successfully',
      review: formatReview(reviewDoc),
    });
  } catch (error) {
    console.error('Update review error:', error.message);
    res.status(500).json({ message: 'Server error updating review' });
  }
});

router.delete('/:id', validateReviewId, async (req, res) => {
  try {
    const reviewDoc = await Review.findById(req.params.id);

    if (!reviewDoc) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (reviewDoc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await reviewDoc.deleteOne();

    res.json({
      message: 'Review deleted successfully',
      review: formatReview(reviewDoc),
    });
  } catch (error) {
    console.error('Delete review error:', error.message);
    res.status(500).json({ message: 'Server error deleting review' });
  }
});

module.exports = router;
