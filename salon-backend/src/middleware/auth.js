const { verifyToken } = require('../utils/jwt');

// This runs BEFORE any protected route. It checks:
// "Is there a valid token? If yes, who is this and what's their role?"
// It does NOT check what they're allowed to do — that's requireRole's job.
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization; // expects "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    // req.user is now available in every route/controller after this
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = authenticate;
