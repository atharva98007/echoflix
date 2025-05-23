const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // You can restrict this to your frontend origin
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const rooms = {}; // { roomId: { users: [], host: socketId } }

io.on('connection', (socket) => {
  console.log('🔌 New socket connected:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    console.log(`📥 ${userId} joined room ${roomId}`);
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { users: [], host: userId };
    }

    rooms[roomId].users.push(userId);

    // Notify others in the room
    socket.to(roomId).emit('user-connected', userId);

    // Update full user list
    io.to(roomId).emit('update-user-list', rooms[roomId].users);

    // Assign host
    if (rooms[roomId].host === userId) {
      socket.emit('set-host');
    }

    socket.on('chat-message', (message) => {
      socket.to(roomId).emit('chat-message', `${userId}: ${message}`);
    });

    socket.on('mute-user', (targetId) => {
      console.log(`🔇 ${userId} wants to mute ${targetId}`);
      io.to(roomId).emit('mute-me', targetId);
      io.to(targetId).emit('mute-me');
    });

    socket.on('kick-user', (targetId) => {
      console.log(`❌ ${userId} kicked ${targetId}`);
      io.to(roomId).emit('kick-me', targetId);
      io.to(targetId).emit('kick-me');
      // Optional: remove from user list immediately
      if (rooms[roomId]) {
        rooms[roomId].users = rooms[roomId].users.filter(id => id !== targetId);
        io.to(roomId).emit('update-user-list', rooms[roomId].users);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ ${userId} disconnected`);
      socket.to(roomId).emit('user-disconnected', userId);

      if (rooms[roomId]) {
        rooms[roomId].users = rooms[roomId].users.filter(id => id !== userId);
        if (rooms[roomId].host === userId) {
          // Reassign host if current host leaves
          const newHost = rooms[roomId].users[0];
          if (newHost) {
            rooms[roomId].host = newHost;
            io.to(newHost).emit('set-host');
          }
        }

        if (rooms[roomId].users.length === 0) {
          delete rooms[roomId];
        } else {
          io.to(roomId).emit('update-user-list', rooms[roomId].users);
        }
      }
    });
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
