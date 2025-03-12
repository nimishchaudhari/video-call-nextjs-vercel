const { Server } = require('socket.io');

export default function handler(req, res) {
  if (res.socket.server.io) {
    return res.end();
  }

  const io = new Server(res.socket.server, { path: '/api/signal' });
  res.socket.server.io = io;

  io.on('connection', (socket) => {
    socket.on('signal', ({ room, data }) => {
      socket.to(room).emit('signal', data);
    });
    socket.on('text', ({ room, text }) => {
      socket.to(room).emit('text', text);
    });
    socket.on('join', (room) => {
      socket.join(room);
    });
  });

  res.end();
}

export const config = {
  api: { bodyParser: false },
};
