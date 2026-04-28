import http from 'http';
import app from './app';
import { config } from './config';
import { Server } from 'socket.io';
import { setupSocketHandlers } from './socket/chat.handler';

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Setup chat handlers
setupSocketHandlers(io);

server.listen(config.port, () => {
  console.log(`[server]: Server is running at http://localhost:${config.port} in ${config.nodeEnv} mode`);
  console.log(`[socket]: Socket.io server ready`);
});
