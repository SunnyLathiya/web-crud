const mongoose = require('mongoose');
const Group = require('../models/Group');
const Message = require('../models/Message');
const httpError = require('../utils/httpError');
const { cleanGroupInput, cleanText } = require('../utils/validators');
const { idOf, formatGroup, formatMessage } = require('../utils/formatters');
const { getIO } = require('../sockets/io');
const { PUBLIC_FIELDS } = require('./userService');

function assertObjectId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(400, `Invalid ${label}`);
}

function withMembers(query) {
  return query
    .populate('members', PUBLIC_FIELDS)
    .populate('createdBy', PUBLIC_FIELDS);
}

async function listGroups(userId) {
  const groups = await withMembers(Group.find()).sort({ lastMessageAt: -1 });
  return groups.map((group) => formatGroup(group, userId));
}

async function createGroup(userId, body) {
  const data = cleanGroupInput(body);
  const group = await Group.create({
    ...data,
    createdBy: userId,
    members: [userId],
    lastMessageAt: new Date(),
  });
  const populated = await withMembers(Group.findById(group._id));
  const formatted = formatGroup(populated, userId);
  publishGroup(populated, formatted);
  return formatted;
}

async function getGroupOrThrow(groupId) {
  assertObjectId(groupId, 'group id');
  const group = await Group.findById(groupId);
  if (!group) throw httpError(404, 'Group not found');
  return group;
}

function isMember(group, userId) {
  return group.members.some((member) => idOf(member) === String(userId));
}

async function joinGroup(userId, groupId) {
  await getGroupOrThrow(groupId);
  await Group.updateOne({ _id: groupId }, { $addToSet: { members: userId } });
  const populated = await withMembers(Group.findById(groupId));
  const formatted = formatGroup(populated, userId);
  publishGroup(populated, formatted);
  return formatted;
}

async function leaveGroup(userId, groupId) {
  const group = await getGroupOrThrow(groupId);
  if (!isMember(group, userId)) throw httpError(400, 'You are not a member of this group');

  // History stays in the database so a member can read it again after rejoining.
  await Group.updateOne({ _id: groupId }, { $pull: { members: userId } });

  const io = getIO();
  if (io) {
    const sockets = await io.in(`user:${userId}`).fetchSockets();
    sockets.forEach((socket) => socket.leave(`group:${groupId}`));
  }

  const populated = await withMembers(Group.findById(groupId));
  const formatted = formatGroup(populated, userId);
  publishGroup(populated, formatted);
  return formatted;
}

async function listMessages(groupId, userId, limit) {
  const group = await getGroupOrThrow(groupId);
  if (!isMember(group, userId)) throw httpError(403, 'Join the group to view messages');

  const size = Math.min(Math.max(Number(limit) || 100, 1), 200);
  const messages = await Message.find({ group: groupId })
    .sort({ createdAt: -1 })
    .limit(size)
    .populate('sender', 'firstName lastName');

  return messages.reverse().map(formatMessage);
}

function publishGroup(group, formatted) {
  const io = getIO();
  if (!io || !group) return;
  io.emit('group:updated', formatted);
}

async function sendMessage({ userId, groupId, text }) {
  const group = await getGroupOrThrow(groupId);
  if (!isMember(group, userId)) throw httpError(403, 'Join the group before sending messages');

  const body = cleanText(text);
  const message = await Message.create({
    group: group._id,
    sender: userId,
    text: body,
  });
  await message.populate('sender', 'firstName lastName');

  group.lastMessage = body;
  group.lastMessageAt = message.createdAt;
  await group.save();

  const populated = await withMembers(Group.findById(group._id));
  const formattedMessage = formatMessage(message);
  const formattedGroup = formatGroup(populated, userId);

  const io = getIO();
  if (io) {
    io.to(`group:${group._id}`).emit('message:new', formattedMessage);
    publishGroup(populated, formattedGroup);
  }

  return formattedMessage;
}

module.exports = {
  listGroups,
  createGroup,
  joinGroup,
  leaveGroup,
  listMessages,
  sendMessage,
};
