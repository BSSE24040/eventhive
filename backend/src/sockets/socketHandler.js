const { Server } = require('socket.io');

let io;

// Initializes Socket.io on top of the HTTP server. Called once from server.js.
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Clients join a room per event so seat updates only broadcast to
    // people actually viewing that event's page.
    socket.on('joinEvent', (eventId) => {
      socket.join(`event:${eventId}`);
    });

    socket.on('leaveEvent', (eventId) => {
      socket.leave(`event:${eventId}`);
    });

    socket.on('disconnect', () => {
      // no-op — room membership is cleaned up automatically by socket.io
    });
  });

  return io;
};

// Lets controllers/services emit events without importing socket.io directly
const getIO = () => io;

module.exports = { initSocket, getIO };
