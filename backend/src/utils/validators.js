const httpError = require('./httpError');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignup(body = {}) {
  const firstName = String(body.firstName || '').trim();
  const lastName = String(body.lastName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const country = String(body.country || '').trim();
  const password = String(body.password || '');
  const errors = [];

  if (firstName.length < 2 || firstName.length > 40) {
    errors.push('First name must be 2 to 40 characters');
  }
  if (lastName.length < 2 || lastName.length > 40) {
    errors.push('Last name must be 2 to 40 characters');
  }
  if (!emailPattern.test(email)) errors.push('Enter a valid email');
  if (country.length < 2 || country.length > 80) errors.push('Enter a valid country');
  if (password.length < 6) errors.push('Password must be at least 6 characters');
  if (errors.length) throw httpError(400, errors.join('. '));

  return { firstName, lastName, email, country, password };
}

function validateLogin(body = {}) {
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!emailPattern.test(email) || !password) {
    throw httpError(401, 'Invalid email or password');
  }
  return { email, password };
}

function cleanText(text) {
  const value = String(text || '').trim();
  if (!value) throw httpError(400, 'Message cannot be empty');
  if (value.length > 2000) throw httpError(400, 'Message is too long');
  return value;
}

function cleanGroupInput(body = {}) {
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  if (name.length < 2 || name.length > 40) {
    throw httpError(400, 'Group name must be 2 to 40 characters');
  }
  if (description.length > 200) {
    throw httpError(400, 'Description must be 200 characters or less');
  }
  return { name, description };
}

module.exports = {
  validateSignup,
  validateLogin,
  cleanText,
  cleanGroupInput,
};
