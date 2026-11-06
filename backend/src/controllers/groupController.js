const asyncHandler = require('../utils/asyncHandler');
const groupService = require('../services/groupService');

const list = asyncHandler(async (req, res) => {
  const groups = await groupService.listGroups(req.user._id);
  res.json(groups);
});

const create = asyncHandler(async (req, res) => {
  const group = await groupService.createGroup(req.user._id, req.body);
  res.status(201).json(group);
});

const join = asyncHandler(async (req, res) => {
  const group = await groupService.joinGroup(req.user._id, req.params.id);
  res.json(group);
});

const leave = asyncHandler(async (req, res) => {
  const group = await groupService.leaveGroup(req.user._id, req.params.id);
  res.json(group);
});

const messages = asyncHandler(async (req, res) => {
  const items = await groupService.listMessages(req.params.id, req.user._id, req.query.limit);
  res.json(items);
});

const send = asyncHandler(async (req, res) => {
  const message = await groupService.sendMessage({
    userId: req.user._id,
    groupId: req.params.id,
    text: req.body.text,
  });
  res.status(201).json(message);
});

module.exports = { list, create, join, leave, messages, send };
