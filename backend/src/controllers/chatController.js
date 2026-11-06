const asyncHandler = require('../utils/asyncHandler');
const chatService = require('../services/chatService');

const list = asyncHandler(async (req, res) => {
  const conversations = await chatService.listConversations(req.user._id);
  res.json(conversations);
});

const start = asyncHandler(async (req, res) => {
  const conversation = await chatService.startConversation(req.user._id, req.body.userId);
  res.status(201).json(conversation);
});

const messages = asyncHandler(async (req, res) => {
  const items = await chatService.listMessages(req.params.id, req.user._id, req.query.limit);
  res.json(items);
});

const send = asyncHandler(async (req, res) => {
  const message = await chatService.sendMessage({
    userId: req.user._id,
    conversationId: req.params.id,
    text: req.body.text,
  });
  res.status(201).json(message);
});

module.exports = { list, start, messages, send };
