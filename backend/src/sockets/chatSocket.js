const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Group = require('../models/Group');
const { isAllowedOrigin } = require('../config/cors');
const { setIO } = require('./io');
const chatService = require('../services/chatService');
const groupService = require('../services/groupService');
const httpError = require('../utils/httpError');

const onlineCounts = new Map();

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) callback(null, true);
        else callback(new Error('Not allowed by CORS'));
      },
    },
  });

  setIO(io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('UNAUTHORIZED'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('UNAUTHORIZED'));
      if (user.isBlocked) return next(new Error('BLOCKED'));
      socket.user = { id: String(user._id), role: user.role };
      return next();
    } catch (error) {
      return next(new Error('UNAUTHORIZED'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    socket.join(`user:${userId}`);

    onlineCounts.set(userId, (onlineCounts.get(userId) || 0) + 1);
    socket.emit('presence:snapshot', Array.from(onlineCounts.keys()));
    io.emit('presence:update', { userId, online: true });

    socket.on('disconnect', () => {
      const nextCount = (onlineCounts.get(userId) || 1) - 1;
      if (nextCount <= 0) {
        onlineCounts.delete(userId);
        io.emit('presence:update', { userId, online: false });
      } else {
        onlineCounts.set(userId, nextCount);
      }
    });

    socket.on('room:join', async (payload = {}) => {
      try {
        const id = payload.id;
        if (payload.type === 'direct') {
          const conversation = await Conversation.findOne({ _id: id, participants: userId });
          if (conversation) socket.join(`conversation:${id}`);
        }
        if (payload.type === 'group') {
          const group = await Group.findOne({ _id: id, members: userId });
          if (group) socket.join(`group:${id}`);
        }
      } catch (error) {
        console.error('room:join failed', error.message);
      }
    });

    socket.on('message:send', async (payload, ack) => {
      const respond = (body) => {
        if (typeof ack === 'function') ack(body);
      };

      try {
        const data = payload && typeof payload === 'object' ? payload : {};
        let message;
        if (data.conversationId) {
          message = await chatService.sendMessage({
            userId,
            conversationId: data.conversationId,
            text: data.text,
          });
        } else if (data.groupId) {
          message = await groupService.sendMessage({
            userId,
            groupId: data.groupId,
            text: data.text,
          });
        } else {
          throw httpError(400, 'Choose a conversation or a group');
        }
        respond({ message });
      } catch (error) {
        respond({ error: error.status ? error.message : 'Could not send message' });
      }
    });
  });

  return io;
}

module.exports = initSocket;
