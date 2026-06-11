require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const favouritesRoutes = require('./routes/favouritesRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const historyRoutes = require('./routes/historyRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/favourites', favouritesRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/search', searchRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'WatchLy API is running' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT);

server.on('listening', () => {
  console.log(`WatchLy server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error('On Mac: System Settings → General → AirDrop & Handoff → turn AirPlay Receiver Off.');
    console.error('Or set a different PORT in backend/.env (e.g. PORT=5001).');
  } else {
    console.error('Server failed to start:', err.message);
  }
  process.exit(1);
});
