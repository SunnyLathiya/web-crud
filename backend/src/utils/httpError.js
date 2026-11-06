function httpError(status, message, appCode) {
  const error = new Error(message);
  error.status = status;
  if (appCode) error.appCode = appCode;
  return error;
}

module.exports = httpError;
