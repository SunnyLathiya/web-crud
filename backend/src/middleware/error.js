function notFound(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  if (err.code === 11000) {
    res.status(409).json({ message: 'That record already exists' });
    return;
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((item) => item.message)
      .join('. ');
    res.status(400).json({ message });
    return;
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 ? 'Something went wrong' : err.message,
    ...(err.appCode ? { code: err.appCode } : {}),
  });
}

module.exports = { notFound, errorHandler };
