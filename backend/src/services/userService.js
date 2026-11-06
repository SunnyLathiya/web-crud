const User = require('../models/User');

const PUBLIC_FIELDS = 'firstName lastName email country role isBlocked createdAt';

async function searchUsers(currentUserId, query) {
  const term = String(query || '').trim();
  if (!term) return [];

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(escaped, 'i');

  return User.find({
    _id: { $ne: currentUserId },
    isBlocked: false,
    $or: [{ firstName: pattern }, { lastName: pattern }, { email: pattern }],
  })
    .select(PUBLIC_FIELDS)
    .limit(8)
    .sort({ firstName: 1, lastName: 1 });
}

module.exports = { searchUsers, PUBLIC_FIELDS };
