const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seedAdmin() {
  const email = String(process.env.ADMIN_EMAIL || 'admin@webchat.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const existing = await User.findOne({ email });
  if (existing) return existing;

  try {
    const user = await User.create({
      firstName: process.env.ADMIN_FIRST_NAME || 'System',
      lastName: process.env.ADMIN_LAST_NAME || 'Admin',
      email,
      country: process.env.ADMIN_COUNTRY || 'India',
      password: await bcrypt.hash(password, 10),
      role: 'admin',
    });
    console.log(`Seeded admin account: ${email}`);
    return user;
  } catch (error) {
    if (error.code === 11000) return User.findOne({ email });
    throw error;
  }
}

module.exports = seedAdmin;
