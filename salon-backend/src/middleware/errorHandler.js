// Catches errors thrown/passed via next(err) anywhere in the app,
// so every controller doesn't need its own try/catch response logic.
// Controllers still use try/catch, but just call next(err) on failure.
function errorHandler(err, req, res, next) {
  console.error(err);

  // Prisma-specific known error codes -> friendlier messages
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with this value already exists.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' });
  }

  const status = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server.';

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
