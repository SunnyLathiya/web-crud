let io = null;

function setIO(instance) {
  io = instance;
}

function getIO() {
  return io;
}

async function disconnectUser(userId) {
  if (!io) return;
  const sockets = await io.in(`user:${userId}`).fetchSockets();
  sockets.forEach((socket) => {
    socket.emit('account:blocked');
    socket.disconnect(true);
  });
}

module.exports = { setIO, getIO, disconnectUser };
