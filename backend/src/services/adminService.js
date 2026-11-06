const mongoose = require('mongoose');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Group = require('../models/Group');
const httpError = require('../utils/httpError');
const { formatUser } = require('../utils/formatters');
const { disconnectUser } = require('../sockets/io');
const { PUBLIC_FIELDS } = require('./userService');

function assertObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(400, 'Invalid user id');
}

async function getManageableUser(actorId, targetId) {
  assertObjectId(targetId);
  if (String(actorId) === String(targetId)) {
    throw httpError(400, 'You cannot change your own account');
  }

  const user = await User.findById(targetId).select(PUBLIC_FIELDS);
  if (!user) throw httpError(404, 'User not found');
  if (user.role === 'admin') throw httpError(400, 'Admin accounts cannot be changed here');
  return user;
}

async function listUsers() {
  const users = await User.find().select(PUBLIC_FIELDS).sort({ createdAt: -1 });
  return users.map(formatUser);
}

async function setBlocked(actorId, targetId, isBlocked) {
  if (typeof isBlocked !== 'boolean') throw httpError(400, 'isBlocked must be true or false');
  const user = await getManageableUser(actorId, targetId);
  user.isBlocked = isBlocked;
  await user.save();
  if (user.isBlocked) await disconnectUser(user._id);
  return formatUser(user);
}

async function deleteUser(actorId, targetId) {
  const user = await getManageableUser(actorId, targetId);
  await disconnectUser(user._id);

  const conversations = await Conversation.find({ participants: user._id }).select('_id');
  const conversationIds = conversations.map((conversation) => conversation._id);

  await Message.deleteMany({
    $or: [{ sender: user._id }, { conversation: { $in: conversationIds } }],
  });
  await Conversation.deleteMany({ _id: { $in: conversationIds } });
  await Group.updateMany({ members: user._id }, { $pull: { members: user._id } });
  await user.deleteOne();
}

module.exports = { listUsers, setBlocked, deleteUser };
