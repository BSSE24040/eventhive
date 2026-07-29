const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socketHandler');
const { releaseExpiredHolds } = require('./services/bookingService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`EventHive API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });

  // Background sweep: every minute, release seats from expired unpaid holds
  // so they become available to other buyers again.
  setInterval(async () => {
    try {
      const releasedCount = await releaseExpiredHolds();
      if (releasedCount > 0) {
        console.log(`Released ${releasedCount} expired booking hold(s)`);
      }
    } catch (error) {
      console.error('Error releasing expired holds:', error.message);
    }
  }, 60 * 1000);
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});
