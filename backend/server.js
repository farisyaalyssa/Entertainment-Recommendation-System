require('dotenv').config();

const createApp = require('./app');
const connectDB = require('./config/db');

const app = createApp();

connectDB();

const PORT = process.env.PORT || 3000;

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
