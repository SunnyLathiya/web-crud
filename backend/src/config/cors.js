function isAllowedOrigin(origin) {
  if (!origin) return true;
  const configured = process.env.CLIENT_URL || 'http://localhost:3000';
  if (origin === configured) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

module.exports = { isAllowedOrigin };
