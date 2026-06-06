const express = require('express');
const Favourite = require('../models/Favourite');
const protect = require('../middleware/auth');
const {
  validateAddFavouriteItem,
  validateRemoveFavouriteItem,
} = require('../middleware/validateFavourites');

const router = express.Router();

const formatFavouriteItem = (item) => ({
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
    const items = await Favourite.find({ userId: req.user._id }).sort({ addedAt: -1 });

    res.json({
      count: items.length,
      items: items.map(formatFavouriteItem),
    });
  } catch (error) {
    console.error('Get favourites error:', error.message);
    res.status(500).json({ message: 'Server error fetching favourites' });
  }
});

router.post('/', validateAddFavouriteItem, async (req, res) => {
  try {
    const { tmdbId, type, title, poster } = req.body;

    const existingItem = await Favourite.findOne({
      userId: req.user._id,
      tmdbId,
      type,
    });

    if (existingItem) {
      return res.status(409).json({ message: 'Item is already in your favourites' });
    }

    const item = await Favourite.create({
      userId: req.user._id,
      tmdbId,
      type,
      title,
      poster: poster || '',
    });

    res.status(201).json({
      message: 'Item added to favourites',
      item: formatFavouriteItem(item),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Item is already in your favourites' });
    }

    console.error('Add favourite item error:', error.message);
    res.status(500).json({ message: 'Server error adding favourite item' });
  }
});

router.delete('/:tmdbId', validateRemoveFavouriteItem, async (req, res) => {
  try {
    const { tmdbId, type } = req.favouriteQuery;

    const item = await Favourite.findOneAndDelete({
      userId: req.user._id,
      tmdbId,
      type,
    });

    if (!item) {
      return res.status(404).json({ message: 'Favourite item not found' });
    }

    res.json({
      message: 'Item removed from favourites',
      item: formatFavouriteItem(item),
    });
  } catch (error) {
    console.error('Remove favourite item error:', error.message);
    res.status(500).json({ message: 'Server error removing favourite item' });
  }
});

module.exports = router;
