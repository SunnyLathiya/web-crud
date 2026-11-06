const asyncHandler = require('../utils/asyncHandler');
const adminService = require('../services/adminService');

const listUsers = asyncHandler(async (req, res) => {
  const users = await adminService.listUsers();
  res.json(users);
});

const setBlocked = asyncHandler(async (req, res) => {
  const user = await adminService.setBlocked(req.user._id, req.params.id, req.body.isBlocked);
  res.json(user);
});

const removeUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.user._id, req.params.id);
  res.json({ message: 'User deleted' });
});

module.exports = { listUsers, setBlocked, removeUser };
