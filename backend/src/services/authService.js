const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const httpError = require('../utils/httpError');
const { formatUser } = require('../utils/formatters');
const { validateSignup, validateLogin } = require('../utils/validators');

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

async function signup(body) {
  const data = validateSignup(body);
  const existing = await User.findOne({ email: data.email });
  if (existing) throw httpError(409, 'An account with this email already exists');

  const user = await User.create({
    ...data,
    password: await bcrypt.hash(data.password, 10),
    role: 'user',
  });

  return { token: signToken(user), user: formatUser(user) };
}

async function login(body) {
  const { email, password } = validateLogin(body);
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw httpError(401, 'Invalid email or password');

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) throw httpError(401, 'Invalid email or password');
  if (user.isBlocked) throw httpError(403, 'Account is blocked', 'BLOCKED');

  return { token: signToken(user), user: formatUser(user) };
}

module.exports = { signup, login };
