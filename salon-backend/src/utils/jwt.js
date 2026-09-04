const jwt = require('jsonwebtoken');

// We put id + role in the token payload. Role goes in here (not
// looked up fresh from DB on every request) so the RBAC middleware
// can check permissions without an extra database call each time.
function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
