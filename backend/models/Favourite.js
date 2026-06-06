const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tmdbId: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['movie', 'tv'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  poster: {
    type: String,
    default: '',
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

favouriteSchema.index({ userId: 1, tmdbId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', favouriteSchema);
