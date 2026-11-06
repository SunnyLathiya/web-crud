const asyncHandler = require('../utils/asyncHandler');
const { searchUsers } = require('../services/userService');
const { formatUser } = require('../utils/formatters');

const search = asyncHandler(async (req, res) => {
  const users = await searchUsers(req.user._id, req.query.q);
  res.json(users.map(formatUser));
});

module.exports = { search };
