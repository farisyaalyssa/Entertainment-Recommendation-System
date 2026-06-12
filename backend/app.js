const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const favouritesRoutes = require('./routes/favouritesRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const historyRoutes = require('./routes/historyRoutes');
const searchRoutes = require('./routes/searchRoutes');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/watchlist', watchlistRoutes);
  app.use('/api/favourites', favouritesRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/history', historyRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/content', searchRoutes.contentRouter);

  app.use(express.static(path.join(__dirname, '..')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  });

  return app;
}

module.exports = createApp;
