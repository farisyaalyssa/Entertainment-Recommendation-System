const express = require('express');
const History = require('../models/History');
const protect = require('../middleware/auth');
const { validateAddHistoryItem, validateRemoveHistoryItem } = require('../middleware/validateHistory');

const router = express.Router();

const formatHistoryItem = (item) => ({
  id: item._id,
  tmdbId: item.tmdbId,
  type: item.type,
  title: item.title,
  poster: item.poster,
  watchedAt: item.watchedAt,
});

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const items = await History.find({ userId: req.user._id }).sort({ watchedAt: -1 });

    res.json({
      count: items.length,
      items: items.map(formatHistoryItem),
    });
  } catch (error) {
    console.error('Get history error:', error.message);
    res.status(500).json({ message: 'Server error fetching watch history' });
  }
});

router.post('/', validateAddHistoryItem, async (req, res) => {
  try {
    const { tmdbId, type, title, poster } = req.body;

    const item = await History.findOneAndUpdate(
      { userId: req.user._id, tmdbId, type },
      {
        userId: req.user._id,
        tmdbId,
        type,
        title,
        poster: poster || '',
        watchedAt: new Date(),
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      message: 'Item added to watch history',
      item: formatHistoryItem(item),
    });
  } catch (error) {
    console.error('Add history item error:', error.message);
    res.status(500).json({ message: 'Server error adding watch history item' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const result = await History.deleteMany({ userId: req.user._id });

    res.json({
      message: 'Watch history cleared successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Clear history error:', error.message);
    res.status(500).json({ message: 'Server error clearing watch history' });
  }
});

router.delete('/:tmdbId', validateRemoveHistoryItem, async (req, res) => {
  try {
    const { tmdbId, type } = req.historyQuery;

    const item = await History.findOneAndDelete({
      userId: req.user._id,
      tmdbId,
      type,
    });

    if (!item) {
      return res.status(404).json({ message: 'History item not found' });
    }

    res.json({
      message: 'Item removed from watch history',
      item: formatHistoryItem(item),
    });
  } catch (error) {
    console.error('Remove history item error:', error.message);
    res.status(500).json({ message: 'Server error removing watch history item' });
  }
});

module.exports = router;
