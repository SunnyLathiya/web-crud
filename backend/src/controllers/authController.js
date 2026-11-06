const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const { formatUser } = require('../utils/formatters');

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

const me = asyncHandler(async (req, res) => {
  res.json(formatUser(req.user));
});

module.exports = { signup, login, me };
