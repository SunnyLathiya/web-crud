const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const httpError = require('../utils/httpError');
const { cleanText } = require('../utils/validators');
const { idOf, formatConversation, formatMessage } = require('../utils/formatters');
const { getIO } = require('../sockets/io');
const { PUBLIC_FIELDS } = require('./userService');

function makePairKey(a, b) {
  return [String(a), String(b)].sort().join(':');
}

function assertObjectId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(400, `Invalid ${label}`);
}

async function listConversations(userId) {
  const conversations = await Conversation.find({ participants: userId })
    .populate('participants', PUBLIC_FIELDS)
    .sort({ lastMessageAt: -1 });

  return conversations
    .map((conversation) => formatConversation(conversation, userId))
    .filter((conversation) => conversation.participant);
}

async function startConversation(userId, otherUserId) {
  assertObjectId(otherUserId, 'user id');
  if (String(userId) === String(otherUserId)) {
    throw httpError(400, 'You cannot start a chat with yourself');
  }

  const other = await User.findById(otherUserId).select(PUBLIC_FIELDS);
  if (!other || other.isBlocked) throw httpError(404, 'User not found');

  const pairKey = makePairKey(userId, otherUserId);
  let conversation = await Conversation.findOne({ pairKey });

  if (!conversation) {
    try {
      conversation = await Conversation.create({
        pairKey,
        participants: [userId, otherUserId],
        lastMessage: '',
        lastMessageAt: new Date(),
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
      conversation = await Conversation.findOne({ pairKey });
    }
  }

  const populated = await conversation.populate('participants', PUBLIC_FIELDS);
  return formatConversation(populated, userId);
}

async function getAuthorizedConversation(conversationId, userId) {
  assertObjectId(conversationId, 'conversation id');
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw httpError(404, 'Conversation not found');

  const isParticipant = conversation.participants.some((participant) => idOf(participant) === String(userId));
  if (!isParticipant) throw httpError(403, 'You are not part of this conversation');
  return conversation;
}

async function listMessages(conversationId, userId, limit) {
  await getAuthorizedConversation(conversationId, userId);
  const size = Math.min(Math.max(Number(limit) || 100, 1), 200);
  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .limit(size)
    .populate('sender', 'firstName lastName');

  return messages.reverse().map(formatMessage);
}

function publishConversation(conversation, message) {
  const io = getIO();
  if (!io) return;

  io.to(`conversation:${conversation._id}`).emit('message:new', message);
  conversation.participants.forEach((participant) => {
    io.to(`user:${idOf(participant)}`).emit(
      'conversation:updated',
      formatConversation(conversation, idOf(participant))
    );
  });
}

async function sendMessage({ userId, conversationId, text }) {
  const conversation = await getAuthorizedConversation(conversationId, userId);
  const body = cleanText(text);
  const otherId = conversation.participants.map(idOf).find((participantId) => participantId !== String(userId));
  const other = await User.findById(otherId);
  if (!other || other.isBlocked) throw httpError(403, 'This user is unavailable');

  const message = await Message.create({
    conversation: conversation._id,
    sender: userId,
    text: body,
  });
  await message.populate('sender', 'firstName lastName');

  conversation.lastMessage = body;
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();

  const populated = await Conversation.findById(conversation._id).populate('participants', PUBLIC_FIELDS);
  const formatted = formatMessage(message);
  publishConversation(populated, formatted);
  return formatted;
}

module.exports = {
  listConversations,
  startConversation,
  listMessages,
  sendMessage,
};
