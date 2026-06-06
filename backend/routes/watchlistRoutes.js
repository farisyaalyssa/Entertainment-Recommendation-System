const express = require('express');
const Watchlist = require('../models/Watchlist');
const protect = require('../middleware/auth');
const {
  validateAddWatchlistItem,
  validateRemoveWatchlistItem,
} = require('../middleware/validateWatchlist');

const router = express.Router();

const formatWatchlistItem = (item) => ({
  id: item._id,
  tmdbId: item.tmdbId,
  type: item.type,
  title: item.title,
  poster: item.poster,
  addedAt: item.addedAt,
});

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const items = await Watchlist.find({ userId: req.user._id }).sort({ addedAt: -1 });

    res.json({
      count: items.length,
      items: items.map(formatWatchlistItem),
    });
  } catch (error) {
    console.error('Get watchlist error:', error.message);
    res.status(500).json({ message: 'Server error fetching watchlist' });
  }
});

router.post('/', validateAddWatchlistItem, async (req, res) => {
  try {
    const { tmdbId, type, title, poster } = req.body;

    const existingItem = await Watchlist.findOne({
      userId: req.user._id,
      tmdbId,
      type,
    });

    if (existingItem) {
      return res.status(409).json({ message: 'Item is already in your watchlist' });
    }

    const item = await Watchlist.create({
      userId: req.user._id,
      tmdbId,
      type,
      title,
      poster: poster || '',
    });

    res.status(201).json({
      message: 'Item added to watchlist',
      item: formatWatchlistItem(item),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Item is already in your watchlist' });
    }

    console.error('Add watchlist item error:', error.message);
    res.status(500).json({ message: 'Server error adding watchlist item' });
  }
});

router.delete('/:tmdbId', validateRemoveWatchlistItem, async (req, res) => {
  try {
    const { tmdbId, type } = req.watchlistQuery;

    const item = await Watchlist.findOneAndDelete({
      userId: req.user._id,
      tmdbId,
      type,
    });

    if (!item) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }

    res.json({
      message: 'Item removed from watchlist',
      item: formatWatchlistItem(item),
    });
  } catch (error) {
    console.error('Remove watchlist item error:', error.message);
    res.status(500).json({ message: 'Server error removing watchlist item' });
  }
});

module.exports = router;
