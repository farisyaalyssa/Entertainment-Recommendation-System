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

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/favourites', favouritesRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/history', historyRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'WatchLy API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`WatchLy server running on port ${PORT}`);
});
