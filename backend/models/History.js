const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
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
  watchedAt: {
    type: Date,
    default: Date.now,
  },
});

historySchema.index({ userId: 1, tmdbId: 1, type: 1 }, { unique: true });
historySchema.index({ userId: 1, watchedAt: -1 });

module.exports = mongoose.model('History', historySchema);
